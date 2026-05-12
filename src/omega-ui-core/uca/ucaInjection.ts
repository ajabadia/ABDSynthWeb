/**
 * OMEGA UCA INJECTION SERVICE - Phase 16
 * Canonical Orchestrator for Blueprint Materialization and Integration.
 */

import { 
  OMEGA_Manifest, 
  OmegaNode, 
  BlueprintDefinition,
  CellTemplate
} from '../types/manifest';
import { 
  BlueprintInjectionRequest, 
  BlueprintInjectionResult, 
  BlueprintInjectionReport,
  BlueprintInsertionStrategy
} from '../types/blueprint';
import { blueprintToTree, treeToManifest, manifestToTree } from './ucaBridge';
import { IdManager } from './utils/idManager';
import { AutoWireResolver } from './utils/autoWireResolver';

/**
 * injectBlueprint
 * The Canonical Entry Point for industrial blueprint injection.
 * Implements the 10-step pipeline from ADR-011 §B.2 (Consolidated).
 */
export async function injectBlueprint(
  manifest: OMEGA_Manifest,
  blueprint: BlueprintDefinition,
  request: BlueprintInjectionRequest,
  options?: {
    templates?: Record<string, CellTemplate>;
  }
): Promise<BlueprintInjectionResult> {
  const startTime = Date.now();
  
  // 0. Aseptic Tree Initialization (Ensures UCA mode)
  const activeManifest = { ...manifest };
  if (!activeManifest.ui.tree) {
    activeManifest.ui = {
      ...activeManifest.ui,
      tree: manifestToTree(activeManifest)
    };
  }

  const report: BlueprintInjectionReport = {
    blueprintId: blueprint.blueprintId,
    blueprintVersion: blueprint.version,
    timestamp: new Date().toISOString(),
    mode: request.mode,
    dryRun: request.strategy.dryRun,
    compatibilityStatus: 'unknown',
    validationIssues: [],
    idRemapLog: {},
    autoWireDecisions: [],
    insertedNodeIds: [],
    createdWireIds: [],
    durationMs: 0
  };

  try {
    // 1 & 2 & 3 & 4. Formal Compilation (Bridge handles pre-validation & materialization)
    const targetParent = findNodeById(activeManifest.ui.tree, request.strategy.targetParentNodeId);
    
    const compilation = blueprintToTree(blueprint, {
      placeholders: request.placeholderValues,
      templates: options?.templates,
      targetParent: targetParent || null,
      strict: true
    });

    // Map compilation errors/warnings to blueprint validation issues
    report.validationIssues.push(...compilation.errors.map(err => ({
      severity: 'error' as const,
      code: 'COMPILATION_ERROR',
      message: err
    })));
    report.validationIssues.push(...compilation.warnings.map(warn => ({
      severity: 'warning' as const,
      code: 'COMPILATION_WARNING',
      message: warn
    })));

    report.compatibilityStatus = compilation.errors.length > 0 ? 'incompatible' : 'compatible';
    
    if (compilation.errors.length > 0) {
      return fatal('COMPILATION_FAILURE', 'Blueprint compilation failed.', report);
    }

    let materializedNode = compilation.tree;

    // 5. Identity Governance (ID Remapping)
    const idManager = new IdManager(activeManifest);
    if (request.strategy.forceIdRemap) {
      const { node: remappedNode, remapLog } = idManager.remapSubtree(materializedNode);
      materializedNode = remappedNode;
      report.idRemapLog = remapLog;
    }

    // 7. Tree Integration (Merge)
    let nextManifest = performMerge(activeManifest, materializedNode, request.strategy);

    // 8. Auto-wiring Resolution
    const autoWireResolver = new AutoWireResolver();
    const { decisions, updatedManifest } = autoWireResolver.resolve(
      nextManifest, 
      blueprint
    );
    report.autoWireDecisions = decisions;
    nextManifest = updatedManifest;

    // 10. Finalize Report
    report.durationMs = Date.now() - startTime;
    report.insertedNodeIds = [materializedNode.id];

    return {
      success: true,
      mode: request.mode,
      resultManifest: request.strategy.dryRun ? undefined : nextManifest,
      injectedSubtree: materializedNode,
      report
    };

  } catch (err) {
    report.durationMs = Date.now() - startTime;
    return fatal('INTERNAL_ERROR', err instanceof Error ? err.message : String(err), report);
  }
}

/**
 * performMerge
 * Internal helper to splice the compiled node into the manifest tree.
 */
function performMerge(manifest: OMEGA_Manifest, node: OmegaNode, strategy: BlueprintInsertionStrategy): OMEGA_Manifest {
  const tree = manifest.ui?.tree;
  if (!tree) throw new Error('Manifest tree not found.');

  const targetId = strategy.targetParentNodeId || tree.id;
  
  const updateTree = (root: OmegaNode): OmegaNode => {
    if (root.id === targetId) {
      const children = [...(root.children || [])];
      if (strategy.insertAtIndex !== undefined) {
        children.splice(strategy.insertAtIndex, 0, node);
      } else {
        children.push(node);
      }
      return { ...root, children };
    }
    if (root.children) {
      return { ...root, children: root.children.map(c => updateTree(c)) };
    }
    return root;
  };

  const nextTree = updateTree(tree);
  const legacyProjections = treeToManifest(nextTree);

  return {
    ...manifest,
    ui: { 
      ...manifest.ui, 
      tree: nextTree,
      controls: legacyProjections.controls || manifest.ui.controls || [],
      jacks: legacyProjections.jacks || manifest.ui.jacks || [],
      layout: {
        ...manifest.ui.layout,
        containers: legacyProjections.layout?.containers || manifest.ui.layout?.containers || []
      }
    }
  };
}

/**
 * findNodeById (Utility)
 */
function findNodeById(root: OmegaNode | undefined, id: string | null): OmegaNode | undefined {
  if (!root || !id) return root;
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

function fatal(code: string, message: string, report: BlueprintInjectionReport): BlueprintInjectionResult {
  return {
    success: false,
    mode: report.mode,
    report,
    fatalError: { code, message }
  };
}
