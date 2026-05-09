'use client';

import { useCallback } from 'react';
import { OMEGA_Manifest, ManifestEntity, OmegaNode } from '../../../omega-ui-core/types/manifest';
import { findNodeInTree, updateNodeInTree, findLegacyItem, applyUpdatesToNode } from './ucaInspectorAdapter';
import { treeToManifest, manifestToTree } from '../../../omega-ui-core/uca/ucaBridge';

export const useEntityCRUD = (
  manifest: OMEGA_Manifest,
  updateManifest: (updates: Partial<OMEGA_Manifest>) => void,
  addLog: (msg: string) => void
) => {
  
  const findItem = useCallback((id: string): ManifestEntity | OmegaNode | undefined => {
    // 1. UCA Priority (Industrial Rule - Phase 4.2)
    if (manifest.ui?.useUCA !== false) {
      const tree = manifest.ui?.tree || manifestToTree(manifest);
      const ucaNode = findNodeInTree(tree, id);
      if (ucaNode) return ucaNode;
    }
    
    // 2. Legacy Fallback
    return findLegacyItem(manifest, id);
  }, [manifest]);

  const updateItem = useCallback((id: string, updates: Partial<ManifestEntity> | Partial<OmegaNode>) => {
    const isUCA = manifest.ui?.useUCA !== false;
    const nodeInTree = isUCA && manifest.ui?.tree ? findNodeInTree(manifest.ui.tree, id) : undefined;
    
    if (nodeInTree && manifest.ui?.tree) {
      // Direct UCA tree update
      let finalUpdates: Partial<OmegaNode>;
      
      if (!('kind' in updates) && ('presentation' in updates || 'pos' in updates)) {
        // Translation from unmigrated section (Partial<ManifestEntity>)
        const translated = applyUpdatesToNode(nodeInTree, updates as Partial<ManifestEntity>);
        finalUpdates = { 
          layout: translated.layout, 
          style: translated.style, 
          bind: translated.bind, 
          role: translated.role, 
          cellRef: translated.cellRef 
        };
      } else {
        // Direct OmegaNode updates from migrated section
        finalUpdates = updates as Partial<OmegaNode>;
      }

      // Update node
      const nextTree = updateNodeInTree(manifest.ui.tree, id, finalUpdates);
      const legacyProjections = treeToManifest(nextTree);
      
      updateManifest({ 
        ui: { 
          ...manifest.ui, 
          tree: nextTree,
          controls: legacyProjections.controls || manifest.ui?.controls,
          jacks: legacyProjections.jacks || manifest.ui?.jacks,
          layout: {
            ...(manifest.ui?.layout || { planes: ['MAIN'], containers: [] }),
            containers: legacyProjections.layout?.containers || manifest.ui?.layout?.containers || []
          }
        } 
      });
    } else {
      // Legacy edit
      const isJack = manifest.ui?.jacks?.some((j: ManifestEntity) => j.id === id);
      
      if (isJack) {
        const nextJacks = manifest.ui.jacks.map((j: ManifestEntity) => j.id === id ? { ...j, ...(updates as Partial<ManifestEntity>) } : j);
        updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
      } else {
        const nextControls = manifest.ui.controls.map((c: ManifestEntity) => c.id === id ? { ...c, ...(updates as Partial<ManifestEntity>) } : c);
        updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
      }
    }
  }, [manifest, updateManifest]);

  const duplicateItem = useCallback((id: string) => {
    const item = findItem(id);
    if (!item) return;

    const isControl = manifest.ui?.controls?.some((c: ManifestEntity) => c.id === id);
    const newItem = JSON.parse(JSON.stringify(item)) as ManifestEntity | OmegaNode;
    
    const baseId = `${item.id}_copy`;
    let counter = 1;
    let newId = baseId;
    while ([...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].some((i: ManifestEntity) => i.id === newId)) {
      newId = `${baseId}_${counter++}`;
    }
    
    newItem.id = newId;
    
    if (isControl) {
      const newList = [...(manifest.ui?.controls || []), newItem as ManifestEntity];
      updateManifest({ ui: { ...manifest.ui, controls: newList } });
    } else {
      const newList = [...(manifest.ui?.jacks || []), newItem as ManifestEntity];
      updateManifest({ ui: { ...manifest.ui, jacks: newList } });
    }
    
    addLog(`Duplicated entity: ${newId}`);
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

  const addEntity = useCallback((type: 'control' | 'jack', template?: Partial<ManifestEntity>) => {
    const id = `new_${type}_${Date.now().toString().slice(-4)}`;
    
    // Default base structure
    const baseEntity: ManifestEntity = {
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
    
    // Merge template if provided (Aseptic Ingestion)
    const newEntity: ManifestEntity = template ? {
      ...baseEntity,
      ...template,
      id, // Preserve generated ID
      pos: baseEntity.pos, // Reset position for placement
      presentation: {
        ...baseEntity.presentation,
        ...(template.presentation || {}),
        tab: 'MAIN' // Force to current plane context
      }
    } as ManifestEntity : baseEntity;

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

  return {
    findItem,
    updateItem,
    duplicateItem,
    removeItem,
    addEntity
  };
};
