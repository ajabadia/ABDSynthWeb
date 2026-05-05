'use client';

import { useCallback } from 'react';
import { useManifestState } from './useManifestState';
import { useAuditEngine } from './useAuditEngine';
import { useEntityManager } from './useEntityManager';
import { useFileOps } from './useFileOps';

import { useAssetManager } from './useAssetManager';

/**
 * OMEGA ERA 7.2.3 - MANIFEST EDITOR HOOK (ORCHESTRATOR)
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
    exportContract,
    handleResourceUpload,
    handleRemoveResource,
    handleBulkUpload
  } = useFileOps(manifest, setManifest, setContract, setWasmBuffer, wasmBuffer, setExtraResources, extraResources, addLog, issues);

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
      const { wasmRuntime } = await import('../../services/wasmRuntime');
      const { IntegrityService } = await import('../../services/integrityService');
      
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
  }, [addLog, manifest, issues, contract]);

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
    exportContract,
    handleRemoveResource,
    handleDeploy,
    assetUrls,
    resolveAsset,
    addLog,
    reset
  };
};
