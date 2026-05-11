import { 
  OMEGA_Manifest,
  BlueprintDefinition, 
  OmegaNode, 
  BlueprintPlaceholderValues,
  BlueprintPlaceholderDefinition,
  OmegaBlueprintNode
} from '@/omega-ui-core/types/manifest';
import { 
  BlueprintInjectionRequest, 
  BlueprintInjectionResult, 
  BlueprintInjectionReport,
  BlueprintValidationIssue,
  BlueprintInsertionStrategy
} from '../types/blueprint';
import { IdManager } from './idManager';
import { AutoWireResolver } from './autoWireResolver';

/**
 * OMEGA Phase 9.4A - Blueprint Injector Engine (Industrial Revision)
 * Implements the 10-step pipeline defined in ADR-011 §B.2.
 */
export class BlueprintInjector {
  private autoWireResolver = new AutoWireResolver();

  /**
   * Main Entry Point - 10-Step Pipeline
   */
  public async inject(
    manifest: OMEGA_Manifest,
    blueprint: BlueprintDefinition,
    request: BlueprintInjectionRequest
  ): Promise<BlueprintInjectionResult> {
    const startTime = Date.now();
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
      // 1. Structural Pre-validation
      if (!blueprint.rootNode) {
        return this.fatal('INVALID_BLUEPRINT', 'Blueprint missing rootNode.', report);
      }

      // 2. Compatibility Check
      const parentNode = this.findNode(manifest.ui?.tree, request.strategy.targetParentNodeId);
      if (request.strategy.targetParentNodeId && !parentNode) {
        return this.fatal('MISSING_PARENT', `Target parent '${request.strategy.targetParentNodeId}' not found.`, report);
      }
      const compIssues = this.validateCompatibility(blueprint, parentNode || null);
      report.validationIssues.push(...compIssues);
      report.compatibilityStatus = compIssues.some(i => i.severity === 'error') ? 'incompatible' : 'compatible';
      
      if (report.compatibilityStatus === 'incompatible') {
        return this.fatal('INCOMPATIBLE_CONTEXT', 'Blueprint compatibility check failed.', report);
      }

      // 3. Placeholder Materialization
      const resolvedValues = this.resolvePlaceholders(blueprint.placeholders, request.placeholderValues);
      let materializedNode = this.materializeSubtree(blueprint.rootNode, resolvedValues);

      // 4. Identity Governance (ID Remapping)
      const idManager = new IdManager(manifest.ui?.tree || { id: 'root', kind: 'rack' });
      if (request.strategy.forceIdRemap) {
        const { node: remappedNode, remapLog } = idManager.remapSubtree(materializedNode as unknown as OmegaNode);
        materializedNode = remappedNode as unknown as OmegaBlueprintNode;
        report.idRemapLog = remapLog;
      }

      // 5. Semantic Validation (Post-materialization)
      const semanticIssues = this.performSemanticValidation(materializedNode);
      report.validationIssues.push(...semanticIssues);
      if (semanticIssues.some(i => i.severity === 'error')) {
        return this.fatal('SEMANTIC_FAILURE', 'Materialized subtree failed semantic validation.', report);
      }

      // 6. Tree Integration (Merge)
      let nextManifest = this.performMerge(manifest, materializedNode as unknown as OmegaNode, request.strategy);

      // 7. Auto-wiring Resolution
      const { decisions, updatedManifest } = this.autoWireResolver.resolve(
        nextManifest, 
        blueprint, 
        materializedNode as unknown as OmegaNode
      );
      report.autoWireDecisions = decisions;
      nextManifest = updatedManifest;

      // 8. Snapshot Generation (Optional Phase 9.4B)
      if (blueprint.materializeSnapshot) {
        // Reserved for Phase 9.4B: Congealing physical snapshots
      }

      // 9. History Prep
      report.durationMs = Date.now() - startTime;
      report.insertedNodeIds = [materializedNode.id];

      // 10. Commit or Dry-Run Return
      return {
        success: true,
        mode: request.mode,
        resultManifest: request.strategy.dryRun ? undefined : nextManifest,
        injectedSubtree: materializedNode as unknown as OmegaNode,
        report
      };

    } catch (err) {
      report.durationMs = Date.now() - startTime;
      return this.fatal('INTERNAL_ERROR', err instanceof Error ? err.message : String(err), report);
    }
  }

  /**
   * Validates compatibility constraints.
   */
  private validateCompatibility(blueprint: BlueprintDefinition, parent: OmegaNode | null): BlueprintValidationIssue[] {
    const issues: BlueprintValidationIssue[] = [];
    const comp = blueprint.compatibility;

    if (parent && comp.allowedParentKinds && comp.allowedParentKinds.length > 0) {
      if (!comp.allowedParentKinds.includes(parent.kind)) {
        issues.push({
          severity: 'error',
          code: 'INCOMPATIBLE_PARENT_KIND',
          message: `Blueprint '${blueprint.name}' cannot be inserted into parent of kind '${parent.kind}'.`,
          suggestion: `Allowed: ${comp.allowedParentKinds.join(', ')}`
        });
      }
    }

    if (parent && comp.deniedParentKinds && comp.deniedParentKinds.includes(parent.kind)) {
      issues.push({
        severity: 'error',
        code: 'DENIED_PARENT_KIND',
        message: `Blueprint '${blueprint.name}' is explicitly denied for parent kind '${parent.kind}'.`
      });
    }

    return issues;
  }

  /**
   * Placeholder resolution logic.
   */
  private resolvePlaceholders(
    definitions: BlueprintPlaceholderDefinition[], 
    provided: BlueprintPlaceholderValues
  ): BlueprintPlaceholderValues {
    const resolved: BlueprintPlaceholderValues = { ...provided };
    definitions.forEach(def => {
      if (resolved[def.id] === undefined) {
        if (def.required) throw new Error(`Missing required parameter: ${def.id}`);
        resolved[def.id] = def.defaultValue;
      }
    });
    return resolved;
  }

  /**
   * Materializes variables into the subtree.
   */
  private materializeSubtree(root: OmegaBlueprintNode, values: BlueprintPlaceholderValues): OmegaBlueprintNode {
    let json = JSON.stringify(root);
    Object.entries(values).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\s*\\}\\}`, 'g');
      json = json.replace(regex, String(value));
    });
    return JSON.parse(json);
  }

  /**
   * Splices the node into the manifest tree.
   */
  private performMerge(manifest: OMEGA_Manifest, node: OmegaNode, strategy: BlueprintInsertionStrategy): OMEGA_Manifest {
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

    return {
      ...manifest,
      ui: { ...manifest.ui, tree: updateTree(tree) }
    };
  }

  /**
   * High-level semantic check.
   */
  private performSemanticValidation(_node: OmegaBlueprintNode): BlueprintValidationIssue[] {
    const issues: BlueprintValidationIssue[] = [];
    // Reserved for Phase 9.4B: Strict UCA structural auditing
    return issues;
  }

  private findNode(root: OmegaNode | undefined, id: string | null): OmegaNode | undefined {
    if (!root || !id) return root;
    if (root.id === id) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = this.findNode(child, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  private fatal(code: string, message: string, report: BlueprintInjectionReport): BlueprintInjectionResult {
    return {
      success: false,
      mode: report.mode,
      report,
      fatalError: { code, message }
    };
  }
}
