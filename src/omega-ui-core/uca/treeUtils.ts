import { OmegaNode, OverridePolicy, ModuleTemplate } from '../types/manifest';

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

/**
 * mergeWithOverrides
 * Deeply merges a base object with overrides, respecting a set of locked/editable paths.
 * Following Era 7.2.3 Genetic Merge standards.
 */
export function mergeWithOverrides(base: unknown, overrides: Record<string, unknown>, policy: OverridePolicy[]): unknown {
  const result = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;

  for (const [path, value] of Object.entries(overrides)) {
    // Find matching policies, sorted by path length descending (most specific first)
    const matchingRules = policy
      .filter(p => path === p.path || path.startsWith(p.path + '.'))
      .sort((a, b) => b.path.length - a.path.length);

    const activeRule = matchingRules[0];

    // Era 7.2.3 Enforcement Logic
    if (activeRule) {
      if (activeRule.mode === 'locked') {
        console.warn(`[UCA] Path is locked by policy: ${path}`);
        continue;
      }
      if (activeRule.mode === 'hidden') {
        continue;
      }
    }

    // Default: If no rule exists, or rule is editable/extendable, apply override
    setPathValue(result, path, value);
  }

  return result;
}

/**
 * setPathValue
 * Helper to set a value in a nested object using a dot-notation path.
 */
function setPathValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * applySlotMappings
 * Recursively replaces logical slot IDs with concrete bindings.
 */
export function applySlotMappings(node: OmegaNode, mappings: Record<string, string>) {
  if (node.bind && mappings[node.bind]) {
    node.bind = mappings[node.bind];
  }
  
  if (node.children) {
    node.children.forEach(child => applySlotMappings(child, mappings));
  }
}

/**
 * congealSnapshot
 * Creates a "frozen" version of a template root with overrides applied and slots resolved.
 * This is the version that will be embedded in the .acepack.
 * Following Era 7.2.3 Portability Standards.
 */
export function congealSnapshot(node: OmegaNode, template: ModuleTemplate): OmegaNode {
  // 1. Deep clone the blueprint root
  const blueprint = JSON.parse(JSON.stringify(template.root));

  // 2. Apply Genetic Overrides
  const congealed = mergeWithOverrides(blueprint, node.overrides || {}, template.policy) as OmegaNode;
  
  // 3. Resolve Slot Bindings permanently
  if (node.slotMappings) {
    applySlotMappings(congealed, node.slotMappings);
  }

  return congealed as OmegaNode;
}
