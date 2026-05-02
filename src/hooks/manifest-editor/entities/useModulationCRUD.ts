'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import { OMEGA_Manifest, OMEGA_Modulation } from '../../../types/manifest';

export const useModulationCRUD = (
  setManifest: Dispatch<SetStateAction<OMEGA_Manifest>>
) => {
  
  const addModulation = useCallback((mod: OMEGA_Modulation) => {
    setManifest((prev: OMEGA_Manifest) => ({
      ...prev,
      modulations: [...(prev.modulations || []), mod]
    }));
  }, [setManifest]);

  const removeModulation = useCallback((id: string) => {
    setManifest((prev: OMEGA_Manifest) => ({
      ...prev,
      modulations: (prev.modulations || []).filter(m => m.id !== id)
    }));
  }, [setManifest]);

  const updateModulation = useCallback((id: string, updates: Partial<OMEGA_Modulation>) => {
    setManifest((prev: OMEGA_Manifest) => ({
      ...prev,
      modulations: (prev.modulations || []).map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  }, [setManifest]);

  return {
    addModulation,
    removeModulation,
    updateModulation
  };
};
