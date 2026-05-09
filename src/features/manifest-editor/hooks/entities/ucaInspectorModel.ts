import { ManifestEntity, OmegaNode, OmegaStyleNode, Position, Presentation, OverrideMode, OverridePolicy, ModuleTemplate } from '@/omega-ui-core/types/manifest';
import { findParentInTree } from './ucaInspectorAdapter';

export interface InspectorViewModel {
  id: string;
  role: string;
  bind: string;
  pos: Position;
  style?: OmegaStyleNode;
  component: string;
  container?: string;
  colSpan?: number;
  constraints?: {
    clampToParent?: boolean;
    margin?: number;
  };
  governance?: Record<string, OverrideMode>; // [Phase 5.1] Map of property path -> mode
}

export function isUcaNode(item: unknown): item is OmegaNode {
  return !!item && typeof item === 'object' && 'kind' in (item as object);
}

export function getInspectorModel(
  item: ManifestEntity | OmegaNode, 
  rootTree?: OmegaNode,
  moduleTemplates?: Record<string, ModuleTemplate> // [Phase 5.1]
): InspectorViewModel {
  if (isUcaNode(item)) {
    // Freshness is now handled by PropertyPanel (Phase 4.2)
    const parent = rootTree ? findParentInTree(rootTree, item.id) : undefined;
    
    // Resolve Governance (Phase 5.1)
    let governance: Record<string, OverrideMode> = {};
    if (item.templateRef && moduleTemplates?.[item.templateRef]) {
      const template = moduleTemplates[item.templateRef];
      governance = resolveGovernance(template.policy);
    }

    return {
      id: item.id,
      role: item.role || 'control',
      bind: item.bind || 'none',
      pos: item.layout?.pos || { x: 0, y: 0 },
      style: item.style,
      component: item.cellRef || (item.kind !== 'cell' ? item.kind : 'knob'),
      container: parent?.id,
      colSpan: undefined,
      constraints: item.constraints,
      governance
    };
  }

  // Legacy ManifestEntity
  const pres = item.presentation || {} as Presentation;
  return {
    id: item.id,
    role: item.role || 'control',
    bind: item.bind || 'none',
    pos: item.pos || { x: 0, y: 0 },
    style: pres.style,
    component: pres.component || 'knob',
    container: pres.container,
    colSpan: pres.colSpan
  };
}

export function buildInspectorPatch(
  item: ManifestEntity | OmegaNode, 
  patch: Partial<InspectorViewModel>
): Partial<ManifestEntity> | Partial<OmegaNode> {
  if (isUcaNode(item)) {
    const nodePatch: Partial<OmegaNode> = {};
    if (patch.pos !== undefined) {
      nodePatch.layout = { ...item.layout, pos: patch.pos };
    }
    if (patch.style !== undefined) {
      nodePatch.style = { ...item.style, ...patch.style };
    }
    if (patch.role !== undefined) nodePatch.role = patch.role;
    if (patch.bind !== undefined) nodePatch.bind = patch.bind;
    if (patch.component !== undefined) nodePatch.cellRef = patch.component;
    if (patch.constraints !== undefined) nodePatch.constraints = patch.constraints;
    
    return nodePatch;
  }

  // Legacy ManifestEntity Patch
  const entityPatch: Partial<ManifestEntity> = {};
  if (patch.pos !== undefined) entityPatch.pos = patch.pos;
  if (patch.role !== undefined) entityPatch.role = patch.role;
  if (patch.bind !== undefined) entityPatch.bind = patch.bind;
  
  if (patch.component !== undefined || patch.container !== undefined || patch.colSpan !== undefined || patch.style !== undefined) {
    const prevPres = item.presentation || {} as Presentation;
    entityPatch.presentation = { ...prevPres };
    if (patch.component !== undefined) entityPatch.presentation.component = patch.component;
    if (patch.container !== undefined) entityPatch.presentation.container = patch.container;
    if (patch.colSpan !== undefined) entityPatch.presentation.colSpan = patch.colSpan;
    if (patch.style !== undefined) entityPatch.presentation.style = patch.style;
  }
  
  return entityPatch;
}

/**
 * resolveGovernance
 * Flattens the policy array into a direct path-to-mode map for the Inspector.
 */
function resolveGovernance(policy: OverridePolicy[]): Record<string, OverrideMode> {
  const gov: Record<string, OverrideMode> = {};
  policy.forEach(p => {
    gov[p.path] = p.mode;
  });
  return gov;
}
