import type { OmegaNode } from '@/omega-ui-core/types/manifest';

export function cloneAndRegenerateNodeIds(node: OmegaNode) {
  const cloned = JSON.parse(JSON.stringify(node)) as OmegaNode;
  cloned.id = `${cloned.id}_copy_${Math.random().toString(36).substring(2, 9)}`;
  return { node: cloned };
}
