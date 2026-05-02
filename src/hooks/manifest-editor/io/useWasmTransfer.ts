'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { OMEGA_Manifest } from '../../../types/manifest';
import { WasmLoaderService, OmegaContract } from '../../../services/wasmLoader';
import { wasmRuntime } from '../../../services/wasmRuntime';

export const useWasmTransfer = (
  setManifest: Dispatch<SetStateAction<OMEGA_Manifest>>,
  setContract: Dispatch<SetStateAction<OmegaContract | null>>,
  setWasmBuffer: Dispatch<SetStateAction<ArrayBuffer | null>>,
  addLog: (msg: string) => void
) => {

  const syncManifestWithContract = useCallback((newContract: OmegaContract, filename: string) => {
    setManifest((prev: OMEGA_Manifest) => ({
      ...prev,
      id: newContract.id || prev.id,
      metadata: {
        ...(prev.metadata || {}),
        name: (prev.metadata?.name === 'New Module' || !prev.metadata?.name) ? (newContract.name || newContract.id) : prev.metadata.name,
        family: newContract.family || prev.metadata?.family || 'oscillator'
      },
      resources: {
        ...(prev.resources || {}),
        wasm: filename,
        contract: filename.replace('.wasm', '.contract.json')
      }
    }));
  }, [setManifest]);

  const handleWasmUpload = useCallback(async (file: File) => {
    addLog(`Loading WASM Binary: ${file.name}...`);
    try {
      const buffer = await file.arrayBuffer();
      setWasmBuffer(buffer);
      const extractedContract = await WasmLoaderService.extractContract(file);
      setContract(extractedContract);
      addLog(`[OK] Contract extracted from binary.`);

      const success = await wasmRuntime.loadWasm(buffer);
      if (success) {
        addLog(`[OK] Simulation engine synchronized with binary logic.`);
      }

      syncManifestWithContract(extractedContract, file.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] WASM Load Failed: ${message}`);
    }
  }, [addLog, setContract, setWasmBuffer, syncManifestWithContract]);

  const handleContractUpload = useCallback(async (file: File) => {
    addLog(`Ingesting Technical Contract: ${file.name}...`);
    try {
      const content = await file.text();
      const rawData = JSON.parse(content);
      const data = rawData.contract || rawData;
      
      if (!data.id || !data.ports) {
        throw new Error("Missing mandatory 'id' or 'ports' fields in contract.");
      }

      const loadedContract: OmegaContract = {
        omega_version: data.omega_version || data.version || "7.0",
        id: String(data.id),
        name: data.name || data.id,
        family: (data.family || "utility").toLowerCase(),
        parameters: data.parameters || [],
        ports: data.ports || []
      };
      
      loadedContract.parameters = (loadedContract.parameters || []).map((p: any) => ({ ...p, id: String(p.id || p.name).toLowerCase() }));
      loadedContract.ports = (loadedContract.ports || []).map((p: any) => ({ ...p, id: String(p.id || p.name).toLowerCase() }));
      
      setContract(loadedContract);
      addLog(`[AUDIT] Contract '${loadedContract.id}' validated.`);
      syncManifestWithContract(loadedContract, 'module.wasm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] Contract Load Failed: ${message}`);
    }
  }, [addLog, setContract, syncManifestWithContract]);

  return {
    handleWasmUpload,
    handleContractUpload
  };
};
