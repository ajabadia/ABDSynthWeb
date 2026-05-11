import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';
import { wasmRuntime } from '@/services/wasmRuntime';

/**
 * OMEGA Simulation Bridge (Phase 9.1 - Live Loop)
 * Orchestrates real-time parameter updates and debounced structural synchronization
 * between the React authoring state and the WASM execution runtime.
 */

export type SimulationSyncStatus = 'idle' | 'syncing' | 'in-sync' | 'degraded' | 'error';

export interface SimulationBridgeState {
  status: SimulationSyncStatus;
  pendingStructuralSync: boolean;
  lastSuccessfulSyncAt: number | null;
  lastError: string | null;
  pushParameterUpdate: (id: string, value: number) => void;
  scheduleStructuralSync: (reason: string) => void;
  forceResync: () => Promise<void>;
}

export const useSimulationBridge = (
  activeId: string,
  manifest: OMEGA_Manifest,
  contract: OmegaContract | null,
  isReady: boolean,
  flushPendingHash: (id: string) => Promise<void>,
  captureStableSnapshot: (id: string) => Promise<void>
): SimulationBridgeState => {
  const [status, setStatus] = useState<SimulationSyncStatus>('idle');
  const [lastSuccessfulSyncAt, setLastSuccessfulSyncAt] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pendingStructuralSync, setPendingStructuralSync] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const syncInProgressRef = useRef(false);

  /**
   * Workstream 2: Parameter Fast-Path
   * Low-latency route for numeric updates.
   */
  const pushParameterUpdate = useCallback((id: string, value: number) => {
    if (!isReady) return;
    
    wasmRuntime.setParameter(id, value);
    
    // Status maintenance
    if (status === 'idle' || status === 'error') setStatus('in-sync');
  }, [isReady, status]);

  /**
   * Core Sync Logic (Workstream 3, 4 & 6)
   */
  const performStructuralSync = useCallback(async (reason: string) => {
    if (!isReady || syncInProgressRef.current) return;

    syncInProgressRef.current = true;
    try {
      console.log(`[BRIDGE] Executing Structural Sync: ${reason}`);
      
      // 1. Coordination with Orchestrator (RISK-002 Fix)
      await flushPendingHash(activeId);
      
      // 2. Hot-Reload Deployment (Workstream 4)
      const result = await wasmRuntime.deployManifest(manifest, { isHotReload: true });
      
      if (result.success) {
        // 3. Capture stable snapshot AFTER successful deploy
        await captureStableSnapshot(activeId);
        
        setLastSuccessfulSyncAt(Date.now());
        setStatus('in-sync');
        setPendingStructuralSync(false);
        setLastError(null);
        console.log(`[BRIDGE] Sync Success: ${result.hash}`);
      } else {
        throw new Error('Deployment failed at runtime');
      }
    } catch (err) {
      console.error('[BRIDGE] Sync failed:', err);
      setLastError(err instanceof Error ? err.message : 'Unknown sync error');
      setStatus('error');
    } finally {
      syncInProgressRef.current = false;
      debounceTimerRef.current = null;
    }
  }, [isReady, activeId, manifest, flushPendingHash, captureStableSnapshot]);

  /**
   * Workstream 3: Structural Sync Queue
   * Debounced deployment for structural changes.
   */
  const scheduleStructuralSync = useCallback((reason: string) => {
    if (!isReady) return;

    setPendingStructuralSync(true);
    setStatus('syncing');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      await performStructuralSync(reason);
    }, 500);
  }, [isReady, performStructuralSync]);

  /**
   * Workstream 6: Error Recovery
   */
  const forceResync = useCallback(async () => {
    console.log('[BRIDGE] Manual recovery triggered.');
    await performStructuralSync('Manual Recovery');
  }, [performStructuralSync]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return useMemo(() => ({
    status,
    pendingStructuralSync,
    lastSuccessfulSyncAt,
    lastError,
    pushParameterUpdate,
    scheduleStructuralSync,
    forceResync
  }), [status, pendingStructuralSync, lastSuccessfulSyncAt, lastError, pushParameterUpdate, scheduleStructuralSync, forceResync]);
};
