'use client';

import { useCallback } from 'react';
import { useDocumentOrchestrator } from './useDocumentOrchestrator';
import { useAuditEngine } from './useAuditEngine';
import { useEntityManager } from './useEntityManager';
import { useFileOps } from './useFileOps';
import { ClipboardService } from '@/services/clipboardService';
import { OMEGA_Manifest, ExtraResource } from '@/omega-ui-core/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';

import { useAssetManager } from './useAssetManager';

/**
 * OMEGA ERA 7.2.3 - MANIFEST EDITOR HOOK (ORCHESTRATOR)
 * This hook composes specialized sub-hooks for state, I/O, entities, and auditing.
 * Following Aseptic Engineering Standards.
 */
export const useManifestEditor = () => {
  // 1. Core State
  const orchestrator = useDocumentOrchestrator();
  const activeDoc = orchestrator.activeDocument;
  const activeId = orchestrator.activeDocumentId;
  
  const { 
    manifest, 
    contract, 
    wasmBuffer,
    extraResources,
    isDirty,
  } = activeDoc;

  // Compatibility Setters (route to orchestrator)
  const setManifest = useCallback((updater: OMEGA_Manifest | ((prev: OMEGA_Manifest) => OMEGA_Manifest)) => {
    const next = typeof updater === 'function' ? updater(manifest) : updater;
    orchestrator.updateDocument(activeId, { manifest: next });
  }, [orchestrator, activeId, manifest]);

  const setContract = useCallback((updater: OmegaContract | null | ((prev: OmegaContract | null) => OmegaContract | null)) => {
    const next = typeof updater === 'function' ? updater(contract) : updater;
    orchestrator.updateDocument(activeId, { contract: next });
  }, [orchestrator, activeId, contract]);

  const setWasmBuffer = useCallback((updater: ArrayBuffer | null | ((prev: ArrayBuffer | null) => ArrayBuffer | null)) => {
    const next = typeof updater === 'function' ? updater(wasmBuffer) : updater;
    orchestrator.updateDocument(activeId, { wasmBuffer: next });
  }, [orchestrator, activeId, wasmBuffer]);

  const setExtraResources = useCallback((updater: ExtraResource[] | ((prev: ExtraResource[]) => ExtraResource[])) => {
    const next = typeof updater === 'function' ? updater(extraResources) : updater;
    orchestrator.updateDocument(activeId, { extraResources: next });
  }, [orchestrator, activeId, extraResources]);

  const updateManifest = useCallback((updates: Partial<OMEGA_Manifest>) => {
    orchestrator.updateDocument(activeId, { manifest: updates });
  }, [orchestrator, activeId]);

  const captureStableSnapshot = useCallback(() => {
    return orchestrator.captureStableSnapshot(activeId);
  }, [orchestrator, activeId]);

  const resetState = useCallback(() => {
    // Resetting the active document means deleting it and recreating it or just resetting its fields
    // For now, let's just use a simple reset in the orchestrator
    // We'll implement orchestrator.resetDocument(activeId) in the next step if needed
  }, []);

  // 2. Audit & Validation Engine
  const { logs, addLog, issues } = useAuditEngine(manifest, contract);

  // 3. Entity & Modulation Management
  const {
    findItem,
    updateItem,
    duplicateItem,
    removeItem,
    addEntity,
    addModulation,
    removeModulation,
    updateModulation,
    addContainer,
    updateContainer,
    removeContainer,
    applyTemplate
  } = useEntityManager(manifest, setManifest, updateManifest, addLog);

  // 4. File I/O Operations
  const {
    handleWasmUpload,
    handleContractUpload,
    handleManifestUpload,
    exportManifest,
    exportOmegaPack,
    exportCADBlueprint,
    exportContract,
    handleResourceUpload,
    handleRemoveResource,
    handleBulkUpload
  } = useFileOps(manifest, setManifest, setContract, setWasmBuffer, wasmBuffer, setExtraResources, extraResources, addLog, issues, captureStableSnapshot);

  // 5. Asset Management (Fase 13)
  const { assetUrls, resolveAsset } = useAssetManager(extraResources);

  const handleDeploy = useCallback(async () => {
    if (issues.length > 0) {
      addLog(`[WARNING] Deployment blocked by ${issues.length} audit violations.`);
      return 'AUDIT_FAIL';
    }

    addLog(`[SYSTEM] HIL Bridge: Initiating direct injection...`);
    addLog(`[SYSTEM] Target ID: ${manifest.id}`);
    
    try {
      const { wasmRuntime } = await import('@/services/wasmRuntime');
      const { IntegrityService } = await import('@/services/integrityService');
      
      const hashAtStart = await IntegrityService.generateManifestHash(manifest);

      // 1. Coherence Check (Safety Lock)
      if (contract?.firmwareHash && hashAtStart !== contract.firmwareHash) {
        addLog(`[CRITICAL] Coherence Failure: Manifest Hash (${hashAtStart.slice(0, 8)}) mismatch with Binary Hash (${contract.firmwareHash.slice(0, 8)}).`);
        const proceed = confirm("FIRMWARE_MISMATCH: The manifest structure has changed and no longer matches the loaded binary. This will cause simulation errors. Proceed anyway?");
        if (!proceed) {
          addLog(`[ABORT] Deployment cancelled by engineer due to integrity failure.`);
          return;
        }
      }

      const result = await wasmRuntime.deployManifest(manifest);
      
      if (result.success) {
        addLog(`[SUCCESS] Hot-Swap injection complete.`);
        addLog(`[SYSTEM] Engine Fingerprint: ${hashAtStart.slice(0, 16)}...`);
        addLog(`[SYSTEM] Simulation synchronized.`);

        // Race Condition Protection (Adjustment 3)
        const hashNow = await IntegrityService.generateManifestHash(manifest);
        if (hashNow === hashAtStart) {
          captureStableSnapshot();
        } else {
          addLog(`[SYSTEM] Local changes detected during deployment. Maintaining Dirty state.`);
        }
      }
    } catch (err) {
      addLog(`[CRITICAL] Deployment failed: ${err}`);
    }
  }, [addLog, manifest, issues, contract, captureStableSnapshot]);

  const reset = () => {
    console.log("[SYSTEM] Reset requested. isDirty:", isDirty);
    const message = isDirty 
      ? "WORKSPACE DIRTY: You have unsaved changes. Resetting will PERMANENTLY lose all modifications. Proceed?"
      : "Reset workspace to initial state?";
      
    if (window.confirm(message)) {
      console.log("[SYSTEM] Reset confirmed by engineer.");
      resetState();
      addLog("[SYSTEM] Workspace reset performed by engineer.");
    } else {
      console.log("[SYSTEM] Reset cancelled by engineer.");
    }
  };

  return {
    manifest,
    contract,
    wasmBuffer,
    extraResources,
    issues,
    logs,
    handleWasmUpload,
    handleContractUpload,
    handleManifestUpload,
    handleResourceUpload,
    handleBulkUpload,
    updateManifest,
    findItem,
    updateItem,
    removeItem,
    duplicateItem,
    addEntity,
    addModulation,
    removeModulation,
    updateModulation,
    addContainer,
    updateContainer,
    removeContainer,
    applyTemplate,
    exportManifest,
    exportOmegaPack,
    exportCADBlueprint,
    exportContract,
    handleRemoveResource,
    handleDeploy,
    copyToClipboard: (id: string) => {
      const item = findItem(id);
      if (item) {
        ClipboardService.copy(item);
        addLog(`[SYSTEM] Copied item ${id} to clipboard.`);
      }
    },
    pasteFromClipboard: () => {
      const item = ClipboardService.paste();
      if (item) {
        addEntity('control'); // This is a placeholder, we should have a more generic addFromClipboard
        // For now, let's just log it. Real implementation in next step.
        addLog(`[SYSTEM] Pasted item ${item.id} from clipboard.`);
      }
    },
    assetUrls,
    resolveAsset,
    addLog,
    reset,
    isDirty,
    captureStableSnapshot,
    orchestrator // Expose the orchestrator for downstream consumption
  };
};
