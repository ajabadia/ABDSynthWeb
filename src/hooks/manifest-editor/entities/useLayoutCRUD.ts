'use client';

import { useCallback } from 'react';
import { OMEGA_Manifest, LayoutContainer } from '../../../types/manifest';

export const useLayoutCRUD = (
  manifest: OMEGA_Manifest,
  updateManifest: (updates: Partial<OMEGA_Manifest>) => void,
  addLog: (msg: string) => void
) => {

  const addContainer = useCallback(() => {
    const id = `CONTAINER_${Date.now().toString().slice(-4)}`;
    const newContainer: LayoutContainer = {
      id,
      label: 'New Section',
      pos: { x: 0, y: 0 },
      size: { w: 'full', h: 100 },
      variant: 'default'
    };

    const nextLayout = {
      ...(manifest.ui.layout || { containers: [], gridSnap: 5 }),
      containers: [...(manifest.ui.layout?.containers || []), newContainer]
    };

    updateManifest({ ui: { ...manifest.ui, layout: nextLayout } });
    addLog(`Added new layout container: ${id}`);
    return id;
  }, [manifest, updateManifest, addLog]);

  const updateContainer = useCallback((id: string, updates: any) => {
    const nextContainers = manifest.ui.layout?.containers.map(c => c.id === id ? { ...c, ...updates } : c) || [];
    const nextLayout = {
      ...(manifest.ui.layout || { containers: [], gridSnap: 5 }),
      containers: nextContainers
    };
    updateManifest({ ui: { ...manifest.ui, layout: nextLayout } });
  }, [manifest, updateManifest]);

  const removeContainer = useCallback((id: string) => {
    const nextContainers = manifest.ui.layout?.containers.filter(c => c.id !== id) || [];
    const nextLayout = {
      ...(manifest.ui.layout || { containers: [], gridSnap: 5 }),
      containers: nextContainers
    };
    
    // Also clear references in items
    const nextControls = manifest.ui.controls.map(c => c.presentation?.container === id ? { ...c, presentation: { ...c.presentation, container: undefined } } : c);
    const nextJacks = manifest.ui.jacks.map(j => j.presentation?.container === id ? { ...j, presentation: { ...j.presentation, container: undefined } } : j);

    updateManifest({ ui: { ...manifest.ui, layout: nextLayout, controls: nextControls, jacks: nextJacks } });
    addLog(`Removed container: ${id}`);
  }, [manifest, updateManifest, addLog]);

  return {
    addContainer,
    updateContainer,
    removeContainer
  };
};
