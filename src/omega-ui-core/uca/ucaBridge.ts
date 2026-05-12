/**
 * OMEGA UCA BRIDGE - Phase 10.2
 * Formal Compilation Pipeline & Materialization Engine.
 */

import { 
  OMEGA_Manifest, 
  OmegaNode, 
  BlueprintDefinition, 
  CellTemplate,
  BlueprintPlaceholderValues,
  OmegaBlueprintNode
} from '../types/manifest';
import { manifestToTree as legacyMigrator } from './converters/manifestToTree';
import { treeToManifest as legacySerializer } from './converters/treeToManifest';

/**
 * formalizeUCA (Internal Gateway)
 * Ensures a node tree follows the latest Phase 10.2 constraints.
 */
function formalizeUCA(node: OmegaNode): OmegaNode {
  return {
    ...node,
    children: node.children?.map(formalizeUCA) || []
  };
}

/**
 * applyOverridesToTree
 * Surgical application of manifest-level overrides to a compiled tree.
 */
function applyOverridesToTree(node: OmegaNode, overrides: Record<string, unknown>): OmegaNode {
  const nextNode = { ...node };
  
  // 0. Genetic Guard (Phase 11): Locked nodes cannot be overridden at the instance level
  if (node.locked) {
    return nextNode;
  }

  // 1. Direct ID match (Simple authority)
  if (overrides[node.id]) {
    const patch = overrides[node.id] as Partial<OmegaNode>;
    if (patch.style) nextNode.style = { ...nextNode.style, ...patch.style };
    if (patch.layout) nextNode.layout = { ...nextNode.layout, ...patch.layout };
    if (patch.overrides) nextNode.overrides = { ...nextNode.overrides, ...patch.overrides };
    // Genetic Authority: Instance level can't unlock a blueprint-locked node
    if (patch.locked === false && node.locked) {
      nextNode.locked = true; 
    } else if (patch.locked !== undefined) {
      nextNode.locked = patch.locked;
    }
  }

  // 2. Recursive propagation
  if (nextNode.children) {
    nextNode.children = nextNode.children.map(child => applyOverridesToTree(child, overrides));
  }

  return nextNode;
}

/**
 * blueprintToTree
 * Compiles a declarative Blueprint into a concrete OmegaNode tree.
 */
export function blueprintToTree(
  blueprint: BlueprintDefinition,
  options: {
    placeholders?: BlueprintPlaceholderValues;
    templates?: Record<string, CellTemplate>;
    manifestOverrides?: Record<string, unknown>; 
  }
): OmegaNode {
  const resolvePlaceholders = (node: OmegaBlueprintNode): OmegaNode => {
    let id = node.id;
    if (id.startsWith('{{') && id.endsWith('}}')) {
      const key = id.slice(2, -2);
      id = String(options.placeholders?.[key] || id);
    }

    const materialNode: OmegaNode = {
      ...node,
      id,
      children: node.children?.map(resolvePlaceholders) || []
    } as OmegaNode;

    // Template Expansion
    if (materialNode.kind === 'cell' && materialNode.cellRef) {
      const template = options.templates?.[materialNode.cellRef];
      if (template) {
        return {
          ...template.baseNode,
          ...materialNode,
          style: { ...template.baseNode.style, ...materialNode.style },
          layout: { ...template.baseNode.layout, ...materialNode.layout },
          // Genetic Authority (Phase 11): 
          // 1. Overrides & SlotMappings are merged (Blueprint + Template)
          overrides: { ...template.baseNode.overrides, ...materialNode.overrides },
          slotMappings: { ...template.baseNode.slotMappings, ...materialNode.slotMappings },
          // 2. Deterministic Locking (If template OR instance is locked, the result is locked)
          locked: template.baseNode.locked || materialNode.locked || false,
          // 3. Identification Stability
          id: materialNode.id || template.baseNode.id
        };
      } else {
        console.warn(`[UCA BRIDGE] Missing template: ${materialNode.cellRef}. Generating Fallback.`);
        materialNode.role = 'decor';
        materialNode.style = { ...materialNode.style, color: '#FF00FF', opacity: 0.5 };
      }
    }

    return materialNode;
  };

  const compiledTree = resolvePlaceholders(blueprint.rootNode);

  // Apply Authority Overrides if present
  const finalTree = options.manifestOverrides 
    ? applyOverridesToTree(compiledTree, options.manifestOverrides)
    : compiledTree;

  return formalizeUCA(finalTree);
}

/**
 * manifestToOmegaTree
 * Legacy Migration Bridge.
 */
export function manifestToOmegaTree(manifest: OMEGA_Manifest, existingTree?: OmegaNode): OmegaNode {
  if (manifest.ui.tree && manifest.ui.useUCA) {
    return formalizeUCA(manifest.ui.tree);
  }
  return legacyMigrator(manifest, existingTree);
}

/** Alias for compatibility with existing orchestrator logic */
export { manifestToOmegaTree as manifestToTree };

/** Alias for compatibility with existing logic */
export { omegaTreeToManifest as treeToManifest };

/**
 * omegaTreeToManifest
 * Serialization Bridge.
 */
export function omegaTreeToManifest(tree: OmegaNode): Partial<OMEGA_Manifest['ui']> {
  const legacyProjections = legacySerializer(tree);
  return {
    ...legacyProjections,
    tree,
    useUCA: true
  };
}

export { legacyMigrator as _internalLegacyMigrator };
export { legacySerializer as _internalLegacySerializer };
export { congealSnapshot } from './treeUtils';
