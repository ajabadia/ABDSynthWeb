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
    updateModulation
  } = useEntityManager(manifest, setManifest, updateManifest, addLog);

  // 4. File I/O Operations
  const {
    handleWasmUpload,
    handleContractUpload,
    handleManifestUpload,
    exportManifest,
    exportOmegaPack,
    handleResourceUpload,
    handleBulkUpload
  } = useFileOps(manifest, setManifest, setContract, setWasmBuffer, wasmBuffer, setExtraResources, extraResources, addLog, issues);

  const handleDeploy = useCallback(() => {
    addLog(`[SYSTEM] Deployment Request: Initiating direct injection into OMEGA Engine...`);
    addLog(`[SYSTEM] Module ID: ${manifest.id}`);
    addLog(`[SYSTEM] Status: Awaiting Antigravity confirmation.`);
  }, [addLog, manifest.id]);

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
    exportManifest,
    exportOmegaPack,
    handleDeploy,
    addLog,
    reset
  };
};
