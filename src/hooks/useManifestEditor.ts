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
      const { IntegrityService } = await import('../services/integrityService');
      
      // 1. Coherence Check (Safety Lock)
      const currentHash = await IntegrityService.generateManifestHash(manifest);
      if (contract?.firmwareHash && currentHash !== contract.firmwareHash) {
        addLog(`[CRITICAL] Coherence Failure: Manifest Hash (${currentHash.slice(0, 8)}) mismatch with Binary Hash (${contract.firmwareHash.slice(0, 8)}).`);
        const proceed = confirm("FIRMWARE_MISMATCH: The manifest structure has changed and no longer matches the loaded binary. This will cause simulation errors. Proceed anyway?");
        if (!proceed) {
          addLog(`[ABORT] Deployment cancelled by engineer due to integrity failure.`);
          return;
        }
      }

      const result = await wasmRuntime.deployManifest(manifest);
      
      if (result.success) {
        addLog(`[SUCCESS] Hot-Swap injection complete.`);
        addLog(`[SYSTEM] Engine Fingerprint: ${currentHash.slice(0, 16)}...`);
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
