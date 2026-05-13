'use client';

import { useCallback, useRef } from 'react';
import type { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { calculateManifestDiff, applyDiffEntry } from '../utils/manifestDiff';
import type { ManifestDiffResult, DiffEntry } from '../types/diff';
import type { DocumentOrchestrator } from '../types/document';

interface HistoryDependencies {
  orchestrator: Pick<DocumentOrchestrator, 'pushHistory' | 'undo' | 'redo' | 'undoTo' | 'updateDocument' | 'documentsById'>;
  activeId: string;
  manifest: OMEGA_Manifest;
  simulationBridge: {
    scheduleStructuralSync: (label: string) => void;
  };
  addLog: (msg: string) => void;
}

/**
 * OMEGA ERA 7.2.3 - HISTORY ACTIONS HOOK
 * Handles state persistence, timeline jumps, and manifest reconciliation.
 */
export const useHistoryActions = ({
  orchestrator,
  activeId,
  manifest,
  simulationBridge,
  addLog
}: HistoryDependencies) => {
  const lastHistoryPushRef = useRef<{ timestamp: number; label: string } | null>(null);

  const pushHistoryEntry = useCallback((label: string, force = false) => {
    const now = Date.now();
    const lastPush = lastHistoryPushRef.current;

    // Coalescing logic: If same label and within 1s window, skip unless forced
    if (!force && lastPush && lastPush.label === label && (now - lastPush.timestamp) < 1000) {
      return;
    }

    orchestrator.pushHistory(activeId, {
      manifest: structuredClone(manifest),
      timestamp: now,
      label,
      metadata: {}
    });

    lastHistoryPushRef.current = { timestamp: now, label };
  }, [orchestrator, activeId, manifest]);

  const undo = useCallback(() => {
    orchestrator.undo(activeId);
    simulationBridge.scheduleStructuralSync('Undo Action');
    addLog(`[HISTORY] Undo performed.`);
  }, [orchestrator, activeId, addLog, simulationBridge]);

  const redo = useCallback(() => {
    orchestrator.redo(activeId);
    simulationBridge.scheduleStructuralSync('Redo Action');
    addLog(`[HISTORY] Redo performed.`);
  }, [orchestrator, activeId, addLog, simulationBridge]);

  const undoTo = useCallback((index: number) => {
    orchestrator.undoTo(activeId, index);
    simulationBridge.scheduleStructuralSync('Timeline Jump');
    addLog(`[HISTORY] Jumped to historical snapshot ${index}.`);
  }, [orchestrator, activeId, addLog, simulationBridge]);

  const updateManifestWithHistory = useCallback((
    updates: Partial<OMEGA_Manifest> | ((prev: OMEGA_Manifest) => Partial<OMEGA_Manifest>), 
    label: string, 
    forceHistory = false
  ) => {
    // Get latest manifest from orchestrator if needed (Phase 10.1C Stale Closure Remediation)
    const currentDoc = orchestrator.documentsById[activeId];
    const baseManifest = currentDoc?.manifest || manifest;
    const finalUpdates = typeof updates === 'function' ? updates(baseManifest) : updates;

    pushHistoryEntry(label, forceHistory);
    orchestrator.updateDocument(activeId, { manifest: finalUpdates });
    
    // Only sync if NOT in a transaction (Atomic Commitment Rule)
    if (!currentDoc?.activeTransaction) {
      simulationBridge.scheduleStructuralSync(label);
    }
  }, [pushHistoryEntry, orchestrator, activeId, manifest, simulationBridge]);

  const compareWithHistory = useCallback((index: number): ManifestDiffResult | null => {
    const doc = orchestrator.documentsById[activeId];
    if (!doc || !doc.history.past[index]) return null;
    
    const pastSnapshot = doc.history.past[index].manifest;
    return calculateManifestDiff(pastSnapshot, manifest);
  }, [orchestrator.documentsById, activeId, manifest]);

  const handleMergeEntries = useCallback((entries: DiffEntry[]) => {
    if (entries.length === 0) return;

    let nextManifest = manifest;
    entries.forEach(entry => {
      nextManifest = applyDiffEntry(nextManifest, entry);
    });

    const label = entries.length === 1 
      ? `[MERGE] ${entries[0].description}`
      : `[MERGE] Selective reconciliation (${entries.length} changes)`;

    updateManifestWithHistory(nextManifest, label, true);
    addLog(`[SYSTEM] ${label} completed.`);
  }, [manifest, updateManifestWithHistory, addLog]);

  return {
    pushHistoryEntry,
    undo,
    redo,
    undoTo,
    updateManifestWithHistory,
    compareWithHistory,
    handleMergeEntries
  };
};
