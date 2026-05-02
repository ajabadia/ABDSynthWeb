'use client';

import { useCallback } from 'react';
import { OMEGA_Manifest, ManifestEntity, OMEGA_Modulation, LayoutContainer } from '../../types/manifest';

export const useEntityManager = (
  manifest: OMEGA_Manifest, 
  setManifest: React.Dispatch<React.SetStateAction<OMEGA_Manifest>>, 
  updateManifest: (updates: Partial<OMEGA_Manifest>) => void,
  addLog: (msg: string) => void
) => {
  
  const findItem = useCallback((id: string): ManifestEntity | undefined => {
    return [...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].find((i: ManifestEntity) => i.id === id);
  }, [manifest]);

  const updateItem = useCallback((id: string, updates: Partial<ManifestEntity>) => {
    const isJack = manifest.ui?.jacks?.some((j: ManifestEntity) => j.id === id);
    
    if (isJack) {
      const nextJacks = manifest.ui.jacks.map((j: ManifestEntity) => j.id === id ? { ...j, ...updates } : j);
      updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
    } else {
      const nextControls = manifest.ui.controls.map((c: ManifestEntity) => c.id === id ? { ...c, ...updates } : c);
      updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
    }
  }, [manifest, updateManifest]);

  const duplicateItem = useCallback((id: string) => {
    const item = findItem(id);
    if (!item) return;

    const type = manifest.ui?.controls?.some((c: ManifestEntity) => c.id === id) ? 'control' : 'jack';
    const key = type === 'control' ? 'controls' : 'jacks';
    const newItem: ManifestEntity = JSON.parse(JSON.stringify(item));
    
    let baseId = `${item.id}_copy`;
    let counter = 1;
    let newId = baseId;
    while ([...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].some((i: ManifestEntity) => i.id === newId)) {
      newId = `${baseId}_${counter++}`;
    }
    
    newItem.id = newId;
    const newList = [...(manifest.ui[key] || []), newItem];
    updateManifest({ ui: { ...manifest.ui, [key]: newList } });
    addLog(`Duplicated ${type}: ${newId}`);
    return newId;
  }, [manifest, findItem, updateManifest, addLog]);

  const removeItem = useCallback((id: string) => {
    const isJack = manifest.ui?.jacks?.some((j: ManifestEntity) => j.id === id);
    if (isJack) {
      const nextJacks = manifest.ui.jacks.filter((j: ManifestEntity) => j.id !== id);
      updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
    } else {
      const nextControls = manifest.ui.controls.filter((c: ManifestEntity) => c.id !== id);
      updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
    }
    addLog(`Removed entity: ${id}`);
  }, [manifest, updateManifest, addLog]);

  const addEntity = useCallback((type: 'control' | 'jack') => {
    const id = `new_${type}_${Date.now().toString().slice(-4)}`;
    const newEntity: ManifestEntity = {
      id,
      type: type === 'control' ? 'knob' : 'port',
      role: type === 'control' ? 'control' : 'stream',
      bind: '',
      label: type === 'control' ? 'New Control' : 'New Jack',
      pos: type === 'control' ? { x: 50, y: 50 } : { x: 50, y: 350 },
      presentation: {
        tab: 'MAIN',
        component: type === 'control' ? 'knob' : 'port',
        variant: 'B_cyan',
        offsetX: 0,
        offsetY: 0,
        attachments: []
      }
    };

    if (type === 'control') {
      const nextControls = [...(manifest.ui?.controls || []), newEntity];
      updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
    } else {
      const nextJacks = [...(manifest.ui?.jacks || []), newEntity];
      updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
    }
    addLog(`Added new ${type}: ${id}`);
    return id;
  }, [manifest, updateManifest, addLog]);

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
  };
};
