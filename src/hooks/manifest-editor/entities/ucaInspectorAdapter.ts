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

const searchCache = new WeakMap<OmegaNode, Map<string, OmegaNode | null>>();

/**
 * findNodeInTree
 * Performs a deep DFS search in the UCA tree, heavily memoized.
 */
export function findNodeInTree(root: OmegaNode, id: string): OmegaNode | undefined {
  if (root.id === id) return root;

  let nodeCache = searchCache.get(root);
  if (!nodeCache) {
    nodeCache = new Map();
    searchCache.set(root, nodeCache);
  } else if (nodeCache.has(id)) {
    const cached = nodeCache.get(id);
    return cached === null ? undefined : cached;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = findNodeInTree(child, id);
      if (found) {
        nodeCache.set(id, found);
        return found;
      }
    }
  }
  
  nodeCache.set(id, null); // Cache misses to avoid redundant deep searches
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
        ...node.style,
        ...(node.layout?.zIndex !== undefined ? { zIndex: node.layout.zIndex } : {})
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
 * Maps ManifestEntity property updates back to the OmegaNode contract.
 */
export function applyUpdatesToNode(node: OmegaNode, updates: Partial<ManifestEntity>): OmegaNode {
  const next = { ...node };

  if (updates.pos) {
    next.layout = { ...next.layout, pos: updates.pos };
  }
  
  if (updates.presentation?.style) {
    next.style = { ...next.style, ...updates.presentation.style };
  }

  if (updates.presentation?.variant) {
    next.cellRef = updates.presentation.variant;
  }
  
  if (updates.bind !== undefined) {
    next.bind = updates.bind;
  }

  if (updates.role) {
    next.role = updates.role;
  }

  return next;
}

/**
 * updateNodeInTree
 * Immutable DFS update of an OmegaNode tree.
 */
export function updateNodeInTree(root: OmegaNode, id: string, updates: Partial<ManifestEntity>): OmegaNode {
  if (root.id === id) {
    return applyUpdatesToNode(root, updates);
  }
  
  if (root.children) {
    const nextChildren = root.children.map(child => updateNodeInTree(child, id, updates));
    return { ...root, children: nextChildren };
  }
  
  return root;
}

