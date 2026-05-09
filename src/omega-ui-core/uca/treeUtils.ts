import { OmegaNode } from '../types/manifest';

/**
 * reorderChildren
 * Move a node within its parent's children array.
 */
export function moveChildInTree(root: OmegaNode, parentId: string, nodeId: string, targetIndex: number): OmegaNode {
  if (root.id === parentId) {
    const children = [...(root.children || [])];
    const currentIndex = children.findIndex(c => c.id === nodeId);
    if (currentIndex === -1) return root;

    const [item] = children.splice(currentIndex, 1);
    children.splice(targetIndex, 0, item);

    return {
      ...root,
      children
    };
  }

  if (root.children) {
    return {
      ...root,
      children: root.children.map(c => moveChildInTree(c, parentId, nodeId, targetIndex))
    };
  }

  return root;
}

/**
 * calculateTargetIndex
 * Determines the insertion index based on pointer position relative to siblings.
 */
export function calculateTargetIndex(
  nodeId: string,
  pointerPos: { x: number; y: number },
  siblings: OmegaNode[],
  mode: 'stack-v' | 'stack-h'
): number {
  if (siblings.length === 0) return 0;

  const axis = mode === 'stack-v' ? 'y' : 'x';
  const sizeAxis = mode === 'stack-v' ? 'height' : 'width';

  // Filter out the node itself to avoid jumpiness during calculation
  const otherSiblings = siblings.filter(s => s.id !== nodeId);
  
  for (let i = 0; i < otherSiblings.length; i++) {
    const sibling = otherSiblings[i];
    const pos = sibling.layout?.pos?.[axis] || 0;
    const size = sibling.layout?.size?.[sizeAxis] || 48;
    const midpoint = pos + size / 2;

    if (pointerPos[axis] < midpoint) {
      return i;
    }
  }

  return otherSiblings.length;
}
