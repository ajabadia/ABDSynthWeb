import { OMEGA_Manifest, OmegaNode, LayoutContainer, ManifestEntity } from '../types/manifest';

/**
 * UCA BRIDGE (Phase 1 & 2)
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
 * Flattens a UCA tree back to legacy arrays.
 * NOTE: This is a transitional bridge. It does NOT guarantee a perfect round-trip 
 * for advanced UCA features (like macro-cells with deeply nested layers) that 
 * cannot be represented in the flat model.
 */
export function treeToManifest(root: OmegaNode): Partial<OMEGA_Manifest['ui']> {
  const containers: LayoutContainer[] = [];
  const controls: ManifestEntity[] = [];
  const jacks: ManifestEntity[] = [];

  function walk(node: OmegaNode, parentFace?: string, parentContainer?: string) {
    if (node.kind === 'container') {
      containers.push({
        id: node.id,
        label: node.id,
        pos: node.layout?.pos || { x: 0, y: 0 },
        size: { 
          w: node.layout?.size?.width || 'full', 
          h: node.layout?.size?.height || 100 
        },
        variant: 'default',
        zIndex: node.layout?.zIndex,
        color: node.style?.color,
        indicatorColor: node.style?.indicatorColor,
        rounding: node.style?.rounding,
        borderWidth: node.style?.borderWidth,
        tab: parentFace || 'MAIN'
      });
    } else if (node.kind === 'cell') {
      const isJack = node.role === 'port' || node.cellRef === 'port';
      
      const entity: ManifestEntity = {
        id: node.id,
        type: node.cellRef || 'knob',
        role: node.role || (isJack ? 'port' : 'control'),
        bind: node.bind || 'none',
        pos: node.layout?.pos || { x: 0, y: 0 },
        presentation: {
          component: node.cellRef || 'knob',
          variant: 'default',
          offsetX: 0,
          offsetY: 0,
          attachments: [],
          container: parentContainer,
          tab: parentFace || 'MAIN',
          style: {
            ...node.style,
            ...(node.layout?.zIndex !== undefined ? { zIndex: node.layout.zIndex } : {})
          },
          size: node.layout?.size ? { w: node.layout.size.width, h: node.layout.size.height } : undefined
        }
      };

      if (isJack) {
        jacks.push(entity);
      } else {
        controls.push(entity);
      }
    }

    if (node.children) {
      node.children.forEach(child => {
        // [Transitional Rule] Warn if we encounter structures that Legacy cannot map
        if (node.kind === 'cell' && (child.kind === 'cell' || child.kind === 'layer')) {
          console.warn(`[UCA Bridge] Warning: Nesting detected in cell '${node.id}'. The legacy flat manifest cannot represent child '${child.id}' properly. Data may be lost during round-trip.`);
        }

        const currentFace = node.kind === 'face' ? node.id : parentFace;
        const currentContainer = node.kind === 'container' ? node.id : parentContainer;
        
        walk(child, currentFace, currentContainer);
      });
    }
  }

  walk(root);

  return {
    layout: {
      containers,
      planes: ['MAIN']
    },
    controls,
    jacks
  };
}
