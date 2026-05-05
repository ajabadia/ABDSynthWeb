'use client';
 
import { useMemo } from 'react';
import { OMEGA_Manifest } from '@/types/manifest';
 
export function useRackLayout(manifest: OMEGA_Manifest, activeTab: string) {
  const hp = manifest?.metadata?.rack?.hp || 12;
  const isCompact = manifest?.metadata?.rack?.height_mode === 'compact';
  
  const width = useMemo(() => hp * 15 * 1.5, [hp]);
  const height = useMemo(() => (manifest.ui?.dimensions?.height || (isCompact ? 140 : 420)) * 1.5, [manifest.ui, isCompact]);
 
  const allElements = useMemo(() => [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ], [manifest.ui]);
 
  const containers = useMemo(() => manifest.ui?.layout?.containers || [], [manifest.ui?.layout?.containers]);
 
  const visibleElements = useMemo(() => {
    return allElements.filter(entity => {
      const containerId = entity.presentation?.container;
      const container = containers.find(c => c.id === containerId);
      if (container) {
        if (container.collapsed) return false;
        return !container.tab || container.tab === activeTab;
      }
      return (entity.presentation?.tab || 'MAIN') === activeTab;
    });
  }, [allElements, containers, activeTab]);

  return {
    width,
    height,
    allElements,
    visibleElements,
    containers
  };
}
