'use client';

import { useState, useCallback } from 'react';
import { OMEGA_Manifest } from '../../types/manifest';
import { OmegaContract } from '../../services/wasmLoader';

export const useManifestState = () => {
  const [manifest, setManifest] = useState<OMEGA_Manifest>({
    schemaVersion: '7.2',
    id: 'new_module',
    metadata: {
      name: 'New Module',
      family: 'oscillator',
      tags: ['era7']
    },
    ui: {
      dimensions: { width: 120, height: 420 },
      controls: [],
      jacks: [],
      layout: {
        containers: [],
        gridSnap: 5
      }
    },
    resources: {
      wasm: 'module.wasm'
    }
  });

  const [contract, setContract] = useState<OmegaContract | null>(null);
  const [wasmBuffer, setWasmBuffer] = useState<ArrayBuffer | null>(null);
  const [extraResources, setExtraResources] = useState<{ name: string, data: ArrayBuffer, type: string }[]>([]);

  const updateManifest = useCallback((updates: Partial<OMEGA_Manifest>) => {
    setManifest((prev: OMEGA_Manifest) => {
      const next = { ...prev, ...updates };
      
      // Ensure metadata is cloned if modified to avoid mutation
      if (next.metadata) {
        next.metadata = { 
          ...next.metadata,
          family: next.metadata.family?.toLowerCase() || next.metadata.family
        };
      }
      
      return next;
    });
  }, []);

  const resetState = useCallback(() => {
    setManifest({
      schemaVersion: '7.1',
      id: 'new_module',
      metadata: { name: 'New Module', family: 'oscillator', tags: ['era7'] },
      ui: { dimensions: { width: 120, height: 420 }, controls: [], jacks: [] },
      resources: { wasm: 'module.wasm' }
    });
    setContract(null);
    setWasmBuffer(null);
    setExtraResources([]);
  }, []);

  return {
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
  };
};
