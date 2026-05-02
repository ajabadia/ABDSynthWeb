'use client';

import { useEntityCRUD } from './entities/useEntityCRUD';
import { useModulationCRUD } from './entities/useModulationCRUD';
import { useLayoutCRUD } from './entities/useLayoutCRUD';
import { OMEGA_Manifest } from '../../types/manifest';

/**
 * OMEGA Entity Manager (v7.2.3)
 * Orchestrator hook that composes specialized CRUD operations for entities, 
 * modulations, and layout containers.
 */
export const useEntityManager = (
  manifest: OMEGA_Manifest, 
  setManifest: React.Dispatch<React.SetStateAction<OMEGA_Manifest>>, 
  updateManifest: (updates: Partial<OMEGA_Manifest>) => void,
  addLog: (msg: string) => void
) => {
  
  // 1. Entity CRUD (Controls & Jacks)
  const entityOps = useEntityCRUD(manifest, updateManifest, addLog);

  // 2. Modulation CRUD (Patching)
  const modulationOps = useModulationCRUD(setManifest);

  // 3. Layout CRUD (Containers)
  const layoutOps = useLayoutCRUD(manifest, updateManifest, addLog);

  return {
    ...entityOps,
    ...modulationOps,
    ...layoutOps
  };
};
