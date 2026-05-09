import { OMEGA_Manifest, ManifestEntity, OmegaNode } from '@/omega-ui-core/types/manifest';
import { manifestToTree } from '@/omega-ui-core/uca/ucaBridge';

export type SelectionRef = 
  | { source: 'legacy'; id: string }
  | { source: 'uca'; id: string; path?: string[] };

/**
 * findLegacyItem
 * Searches for an item only in legacy arrays.
 */
export function findLegacyItem(manifest: OMEGA_Manifest, id: string): ManifestEntity | undefined {
  return [...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].find((i: ManifestEntity) => i.id === id);
}

/**
 * findNodeInTree
 * Performs a deep DFS search in the UCA tree.
 */
export function findNodeInTree(root: OmegaNode, id: string): OmegaNode | undefined {
  if (root.id === id) return root;

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeInTree(child, id);
      if (found) return found;
    }
  }
  
  return undefined;
}

/**
 * adaptNodeToManifestEntity
 * Momentary in-flight projection from OmegaNode to ManifestEntity so that
 * PropertyPanel can display the node's properties.
 */
export function adaptNodeToManifestEntity(node: OmegaNode): ManifestEntity {
  const isJack = node.role === 'port' || node.cellRef === 'port';
  return {
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
      tab: 'MAIN',
      style: {
        ...node.style
      },
      size: node.layout?.size ? { w: node.layout.size.width, h: node.layout.size.height } : undefined
    }
  };
}

/**
 * findEditableItem
 * Orchestrator to find an item either in legacy or UCA.
 * Returns the item and the inferred SelectionRef.
 */
export function findEditableItem(manifest: OMEGA_Manifest, id: string): { item: ManifestEntity, ref: SelectionRef } | undefined {
  // 1. Try legacy first
  const legacyItem = findLegacyItem(manifest, id);
  if (legacyItem) {
    return { item: legacyItem, ref: { source: 'legacy', id } };
  }

  // 2. Try UCA deep search if it exists or use projection as fallback
  const treeToSearch = manifest.ui?.tree || manifestToTree(manifest);
  if (treeToSearch) {
    const deepNode = findNodeInTree(treeToSearch, id);
    if (deepNode) {
      return { 
        item: adaptNodeToManifestEntity(deepNode), 
        ref: { source: manifest.ui?.tree ? 'uca' : 'legacy', id } 
      };
    }
  }

  return undefined;
}

/**
 * applyUpdatesToNode
 * Maps updates back to the OmegaNode contract. Supports both legacy ManifestEntity and native OmegaNode patches.
 */
export function applyUpdatesToNode(node: OmegaNode, updates: Partial<ManifestEntity> | Partial<OmegaNode>): OmegaNode {
  const next = { ...node };

  // 1. Direct OmegaNode Update (Native)
  if ('kind' in updates || 'layout' in updates || 'style' in updates) {
    const nodePatch = updates as Partial<OmegaNode>;
    if (nodePatch.layout) {
      next.layout = { 
        ...next.layout, 
        ...nodePatch.layout,
        pos: nodePatch.layout.pos 
          ? { ...(next.layout?.pos || { x: 0, y: 0 }), ...nodePatch.layout.pos } 
          : (next.layout?.pos || { x: 0, y: 0 }),
        size: nodePatch.layout.size 
          ? { ...(next.layout?.size || { width: 48, height: 48 }), ...nodePatch.layout.size } 
          : (next.layout?.size || { width: 48, height: 48 })
      };
    }
    if (nodePatch.style) next.style = { ...next.style, ...nodePatch.style };
    if (nodePatch.role) next.role = nodePatch.role;
    if (nodePatch.bind) next.bind = nodePatch.bind;
    if (nodePatch.cellRef) next.cellRef = nodePatch.cellRef;
    if (nodePatch.children) next.children = nodePatch.children;
    return next;
  }

  // 2. Legacy ManifestEntity Update (Translation)
  const entityPatch = updates as Partial<ManifestEntity>;
  if (entityPatch.pos) {
    next.layout = { ...next.layout, pos: entityPatch.pos };
  }
  
  if (entityPatch.presentation?.style) {
    next.style = { ...next.style, ...entityPatch.presentation.style };
  }

  if (entityPatch.presentation?.variant) {
    next.cellRef = entityPatch.presentation.variant;
  }
  
  if (entityPatch.bind !== undefined) {
    next.bind = entityPatch.bind;
  }

  if (entityPatch.role) {
    next.role = entityPatch.role;
  }

  return next;
}

/**
 * updateNodeInTree
 * Immutable DFS update of an OmegaNode tree.
 */
export function updateNodeInTree(root: OmegaNode, id: string, updates: Partial<ManifestEntity> | Partial<OmegaNode>): OmegaNode {
  if (root.id === id) {
    return applyUpdatesToNode(root, updates);
  }
  
  if (root.children) {
    let changed = false;
    const nextChildren = root.children.map(child => {
      const updated = updateNodeInTree(child, id, updates);
      if (updated !== child) changed = true;
      return updated;
    });
    if (changed) return { ...root, children: nextChildren };
  }
  
  return root;
}

/**
 * findParentInTree
 * Finds the parent node of a target node ID.
 */
export function findParentInTree(root: OmegaNode, targetId: string): OmegaNode | undefined {
  if (!root.children) return undefined;
  
  if (root.children.some(c => c.id === targetId)) return root;
  
  for (const child of root.children) {
    const found = findParentInTree(child, targetId);
    if (found) return found;
  }
  return undefined;
}

/**
 * calculateWorldPosition
 * Recursively sums local offsets to find the absolute rack position.
 */
export function calculateWorldPosition(root: OmegaNode, targetId: string, currentOffset: { x: number, y: number } = { x: 0, y: 0 }): { x: number, y: number } | undefined {
  const absoluteX = currentOffset.x + (root.layout?.pos?.x || 0);
  const absoluteY = currentOffset.y + (root.layout?.pos?.y || 0);

  if (root.id === targetId) {
    return { x: absoluteX, y: absoluteY };
  }

  if (root.children) {
    for (const child of root.children) {
      const found = calculateWorldPosition(child, targetId, { x: absoluteX, y: absoluteY });
      if (found) return found;
    }
  }

  return undefined;
}



