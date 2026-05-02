'use client';

import { useManifestTransfer } from './io/useManifestTransfer';
import { useWasmTransfer } from './io/useWasmTransfer';
import { useBundleTransfer } from './io/useBundleTransfer';
import { OMEGA_Manifest } from '../../types/manifest';
import { OmegaContract } from '../../services/wasmLoader';

/**
 * OMEGA File Operations (v7.2.3)
 * Orchestrator hook that composes manifest, WASM, and bundle I/O operations.
 */
export const useFileOps = (
  manifest: OMEGA_Manifest,
  setManifest: React.Dispatch<React.SetStateAction<OMEGA_Manifest>>,
  setContract: React.Dispatch<React.SetStateAction<OmegaContract | null>>,
  setWasmBuffer: React.Dispatch<React.SetStateAction<ArrayBuffer | null>>,
  wasmBuffer: ArrayBuffer | null,
  setExtraResources: React.Dispatch<React.SetStateAction<{ name: string, data: ArrayBuffer, type: string }[]>>,
  extraResources: { name: string, data: ArrayBuffer, type: string }[],
  addLog: (msg: string) => void,
  issues: any[]
) => {

  // 1. Manifest Operations (Import/Export/CAD)
  const manifestIO = useManifestTransfer(manifest, setManifest, addLog, issues);

  // 2. WASM Operations (Binary/Contract)
  const wasmIO = useWasmTransfer(setManifest, setContract, setWasmBuffer, addLog);

  // 3. Bundle Operations (OmegaPack/Bulk/Resources)
  const bundleIO = useBundleTransfer(
    manifest, 
    wasmBuffer, 
    extraResources, 
    setExtraResources, 
    addLog, 
    issues,
    wasmIO.handleWasmUpload,
    wasmIO.handleContractUpload,
    manifestIO.handleManifestUpload
  );

  return {
    ...manifestIO,
    ...wasmIO,
    ...bundleIO
  };
};
