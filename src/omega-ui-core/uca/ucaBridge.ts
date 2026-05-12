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

export interface CompilationResult {
  tree: OmegaNode;
  errors: string[];
  warnings: string[];
  metadata: {
    nodeCount: number;
    unresolvedPlaceholders: string[];
    missingTemplates: string[];
    depth: number;
  };
}

/**
 * materializePlaceholders
 * Industrial substitution engine for blueprints.
 * Supports:
 * 1. Literal Substitution: {{key}}
 * 2. Arithmetic Expressions: {{x + 10}}, {{y * 2}}
 */
function materializePlaceholders(root: OmegaBlueprintNode, values: BlueprintPlaceholderValues): OmegaBlueprintNode {
  let json = JSON.stringify(root);
  
  // 1. Literal Substitution
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\\\{\\\\{${key}\\\\s*\\\\}\\\\}`, 'g');
    json = json.replace(regex, String(value));
  });

  // 2. Expression Evaluation (e.g. {{x + 10}})
  const exprRegex = /\\{\\{\\s*([a-zA-Z0-9_]+)\\s*([\\+\\-\\*\\/])\\s*([0-9\\.]+)\\s*\\}\\}/g;
  json = json.replace(exprRegex, (match, varName, op, valStr) => {
    const baseVal = Number(values[varName]);
    const modifier = Number(valStr);
    if (isNaN(baseVal) || isNaN(modifier)) return match;
    
    switch(op) {
      case '+': return String(baseVal + modifier);
      case '-': return String(baseVal - modifier);
      case '*': return String(baseVal * modifier);
      case '/': return String(baseVal / modifier);
      default: return match;
    }
  });

  return JSON.parse(json);
}

/**
 * blueprintToTree
 * Compiles a declarative Blueprint into a concrete OmegaNode tree.
 * Refactored for Phase 15/16 industrial reporting and unified materialization.
 */
export function blueprintToTree(
  blueprint: BlueprintDefinition,
  options: {
    placeholders?: BlueprintPlaceholderValues;
    templates?: Record<string, CellTemplate>;
    manifestOverrides?: Record<string, unknown>;
    targetParent?: OmegaNode | null; // For compatibility checks
    strict?: boolean; // If true, missing placeholders are errors
  }
): CompilationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unresolvedPlaceholders = new Set<string>();
  const missingTemplates = new Set<string>();
  let nodeCount = 0;
  let maxDepth = 0;

  // 0. Compatibility Check (Genetic Guard)
  if (options.targetParent && blueprint.compatibility) {
    const comp = blueprint.compatibility;
    if (comp.allowedParentKinds && comp.allowedParentKinds.length > 0) {
      if (!comp.allowedParentKinds.includes(options.targetParent.kind)) {
        errors.push(`[UCA BRIDGE] Incompatible parent kind: '${options.targetParent.kind}'. Allowed: ${comp.allowedParentKinds.join(', ')}`);
      }
    }
    if (comp.deniedParentKinds && comp.deniedParentKinds.includes(options.targetParent.kind)) {
      errors.push(`[UCA BRIDGE] Explicitly denied parent kind: '${options.targetParent.kind}'`);
    }
  }

  // 1. Materialize Placeholders (Preprocessing)
  const materialBlueprintRoot = options.placeholders 
    ? materializePlaceholders(blueprint.rootNode, options.placeholders)
    : blueprint.rootNode;

  const resolveNodes = (node: OmegaBlueprintNode, depth: number, visited: Set<string>): OmegaNode => {
    nodeCount++;
    maxDepth = Math.max(maxDepth, depth);

    // Circular detection (Genetic Guard)
    if (node.id && visited.has(node.id)) {
      errors.push(`[UCA BRIDGE] Circular reference detected at node: ${node.id}`);
      return { ...node, id: `${node.id}_ERR_CIRCULAR` } as unknown as OmegaNode;
    }
    const nextVisited = new Set(visited);
    if (node.id) nextVisited.add(node.id);

    const id = node.id;
    // Check for leftover placeholders (if not materialized)
    if (typeof id === 'string' && id.startsWith('{{') && id.endsWith('}}')) {
      const key = id.slice(2, -2);
      unresolvedPlaceholders.add(key);
      if (options.strict) {
        errors.push(`[UCA BRIDGE] Unresolved required placeholder: {{${key}}}`);
      } else {
        warnings.push(`[UCA BRIDGE] Unresolved placeholder: {{${key}}}`);
      }
    }

    const materialNode: OmegaNode = {
      ...node,
      id,
      children: node.children?.map(child => resolveNodes(child, depth + 1, nextVisited)) || []
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
          overrides: { ...template.baseNode.overrides, ...materialNode.overrides },
          slotMappings: { ...template.baseNode.slotMappings, ...materialNode.slotMappings },
          locked: template.baseNode.locked || materialNode.locked || false,
          id: materialNode.id || template.baseNode.id,
        };
      } else {
        missingTemplates.add(materialNode.cellRef);
        errors.push(`[UCA BRIDGE] Missing template: ${materialNode.cellRef}`);
        materialNode.role = 'decor';
        materialNode.style = { ...materialNode.style, color: '#FF00FF', opacity: 0.5 };
      }
    }

    return materialNode;
  };

  const compiledTree = resolveNodes(materialBlueprintRoot, 0, new Set());

  // Apply Authority Overrides if present
  const finalTree = options.manifestOverrides 
    ? applyOverridesToTree(compiledTree, options.manifestOverrides)
    : compiledTree;

  return {
    tree: formalizeUCA(finalTree),
    errors,
    warnings,
    metadata: {
      nodeCount,
      unresolvedPlaceholders: Array.from(unresolvedPlaceholders),
      missingTemplates: Array.from(missingTemplates),
      depth: maxDepth
    }
  };
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

export { legacyMigrator as _rawManifestToTree };
export { legacySerializer as _rawTreeToManifest };
export { congealSnapshot } from './treeUtils';
