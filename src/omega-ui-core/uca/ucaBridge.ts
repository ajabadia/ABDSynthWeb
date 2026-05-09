import { OMEGA_Manifest, OmegaNode } from '../types/manifest';

/**
 * UCA BRIDGE (Phase 1)
 * Bidirectional translation between flat legacy arrays and hierarchical UCA tree.
 */

/**
 * manifestToTree
 * Hydrates a recursive OmegaNode tree from flat manifest arrays.
 */
export function manifestToTree(manifest: OMEGA_Manifest): OmegaNode {
  const ui = manifest.ui;
  const containers = ui.layout?.containers || [];
  const controls = ui.controls || [];
  const jacks = ui.jacks || [];

  // 1. Create the Root Rack
  const root: OmegaNode = {
    id: manifest.id,
    kind: 'rack',
    role: 'root',
    layout: {
      pos: { x: 0, y: 0 },
      size: ui.dimensions
    },
    children: []
  };

  // 2. Create the Primary Face (MAIN)
  const mainFace: OmegaNode = {
    id: 'MAIN_FACE',
    kind: 'face',
    role: 'presentation',
    layout: {
      pos: { x: 0, y: 0 },
      size: ui.dimensions
    },
    children: []
  };
  root.children?.push(mainFace);

  // 3. Map Containers
  const containerMap = new Map<string, OmegaNode>();
  containers.forEach(c => {
    const node: OmegaNode = {
      id: c.id,
      kind: 'container',
      role: 'infrastructure',
      layout: {
        pos: c.pos,
        size: typeof c.size.w === 'number' 
          ? { width: c.size.w, height: c.size.h } 
          : undefined, // Units like 'full' will be resolved by the renderer
        zIndex: c.zIndex
      },
      style: {
        color: c.color,
        indicatorColor: c.indicatorColor,
        rounding: c.rounding,
        borderWidth: c.borderWidth
      },
      children: []
    };
    containerMap.set(c.id, node);
    mainFace.children?.push(node);
  });

  // 4. Map Entities (Controls & Jacks)
  const allEntities = [...controls, ...jacks];
  allEntities.forEach(entity => {
    const node: OmegaNode = {
      id: entity.id,
      kind: 'cell',
      role: entity.role || 'control',
      bind: entity.bind,
      layout: {
        pos: entity.pos,
        size: entity.presentation?.size ? {
          width: entity.presentation.size.w,
          height: entity.presentation.size.h
        } : undefined,
        zIndex: entity.presentation?.style?.zIndex
      },
      style: entity.presentation?.style,
      // We assume legacy 'type' maps to a template ref for now
      cellRef: entity.type as string
    };

    const containerId = entity.presentation?.container;
    const targetParent = containerId ? containerMap.get(containerId) : mainFace;
    
    if (targetParent) {
      targetParent.children = targetParent.children || [];
      targetParent.children.push(node);
    } else {
      mainFace.children?.push(node);
    }
  });

  return root;
}

/**
 * treeToManifest
 * (Stub) Flattens a UCA tree back to legacy arrays.
 */
export function treeToManifest(): Partial<OMEGA_Manifest['ui']> {
  // Implementation will follow in Phase 2
  return {};
}
