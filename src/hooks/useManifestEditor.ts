'use client';

import { useCallback } from 'react';
import { useManifestState } from './manifest-editor/useManifestState';
import { useAuditEngine } from './manifest-editor/useAuditEngine';
import { useEntityManager } from './manifest-editor/useEntityManager';
import { useFileOps } from './manifest-editor/useFileOps';

/**
 * OMEGA ERA 7.1 - MANIFEST EDITOR HOOK (ORCHESTRATOR)
 * This hook composes specialized sub-hooks for state, I/O, entities, and auditing.
 * Following Aseptic Engineering Standards.
 */
export const useManifestEditor = () => {
  // 1. Core State
  const { 
    manifest, 
    setManifest, 
    contract, 
    setContract, 
    wasmBuffer,
    setWasmBuffer,
    extraResources,
    setExtraResources,
    updateManifest, 
    resetState 
  } = useManifestState();

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
    removeContainer
  } = useEntityManager(manifest, setManifest, updateManifest, addLog);

  // 4. File I/O Operations
  const {
    handleWasmUpload,
    handleContractUpload,
    handleManifestUpload,
    exportManifest,
    exportOmegaPack,
    exportCADBlueprint,
    handleResourceUpload,
    handleRemoveResource,
    handleBulkUpload
  } = useFileOps(manifest, setManifest, setContract, setWasmBuffer, wasmBuffer, setExtraResources, extraResources, addLog, issues);

  const handleDeploy = useCallback(async () => {
    if (issues.length > 0) {
      if (!confirm(`Manifest has ${issues.length} audit issues. Deploy to engine anyway?`)) return;
    }

    addLog(`[SYSTEM] HIL Bridge: Initiating direct injection...`);
    addLog(`[SYSTEM] Target ID: ${manifest.id}`);
    
    try {
      const { wasmRuntime } = require('../services/wasmRuntime');
      const result = await wasmRuntime.deployManifest(manifest);
      
      if (result.success) {
        addLog(`[SUCCESS] Hot-Swap injection complete.`);
        addLog(`[SYSTEM] Engine Hash: 0x${result.hash}`);
        addLog(`[SYSTEM] Simulation synchronized.`);
      }
    } catch (err) {
      addLog(`[CRITICAL] Deployment failed: ${err}`);
    }
  }, [addLog, manifest, issues]);

  const reset = () => {
    if (confirm("Reset workspace?")) {
      resetState();
      addLog("Workspace reset.");
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
    exportManifest,
    exportOmegaPack,
    exportCADBlueprint,
    handleRemoveResource,
    handleDeploy,
    addLog,
    reset
  };
};
