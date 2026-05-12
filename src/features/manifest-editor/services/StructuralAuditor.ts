import { OMEGA_Manifest, OMEGA_Contract, OmegaNode } from '@/omega-ui-core/types/manifest';
import { DiagnosticSource, TabDiagnostics, createEmptyDiagnostics, DiagnosticContext } from '../types/diagnostics';

/**
 * OMEGA ERA 7.2.3 - Structural Auditor
 * Semantic analysis of manifest integrity and coherence.
 * Phase 15: Recursive UCA Tree Support.
 */
export class StructuralAuditor implements DiagnosticSource {
  id = 'structural-auditor';
  name = 'Structural';

  extractDiagnostics(manifest: OMEGA_Manifest, context?: DiagnosticContext): TabDiagnostics {
    const results = createEmptyDiagnostics();
    const contract = context?.contract as OMEGA_Contract | null;

    // 1. LEGACY PROJECTIONS (Controls & Jacks)
    const allEntities = [
      ...(manifest.ui.controls || []),
      ...(manifest.ui.jacks || [])
    ];

    const containerIds = new Set((manifest.ui.layout?.containers || []).map(c => c.id));
    const entityIds = new Set(allEntities.map(e => e.id));
    const paramIds = new Set(contract?.parameters?.map(p => p.id) || []);
    const portIds = new Set(contract?.ports?.map(p => p.id) || []);
    const assetIds = new Set((manifest.resources.assets || []).map(a => a.id));

    // A. ID Collision Check (Legacy)
    const idCounts = new Map<string, number>();
    [...containerIds, ...allEntities.map(e => e.id)].forEach(id => {
      idCounts.set(id, (idCounts.get(id) || 0) + 1);
    });

    idCounts.forEach((count, id) => {
      if (count > 1) {
        results.errors.push({
          id: `collision-${id}`,
          source: this.name,
          message: `ID Collision: '${id}' is defined multiple times.`,
          severity: 'error',
          code: 'ID_COLLISION',
          entityId: id
        });
      }
    });

    // B. Legacy Entity Validation
    allEntities.forEach(entity => {
      const containerId = entity.presentation?.container;
      if (containerId && !containerIds.has(containerId)) {
        results.errors.push({
          id: `broken-container-${entity.id}`,
          source: this.name,
          message: `Entity '${entity.id}' references non-existent container '${containerId}'.`,
          severity: 'error',
          code: 'BROKEN_CONTAINER_REF',
          entityId: entity.id
        });
      }

      if (entity.bind && entity.bind !== 'none') {
        const isParam = paramIds.has(entity.bind);
        const isPort = portIds.has(entity.bind);
        if (!isParam && !isPort) {
          results.warnings.push({
            id: `broken-bind-${entity.id}`,
            source: this.name,
            message: `Broken Bind: Entity '${entity.id}' binds to unknown target '${entity.bind}'.`,
            severity: 'warning',
            code: 'BROKEN_BIND',
            entityId: entity.id
          });
        }
      }

      const assetId = entity.presentation?.asset;
      if (assetId && assetId !== 'none' && !assetIds.has(assetId)) {
        results.warnings.push({
          id: `broken-asset-${entity.id}`,
          source: this.name,
          message: `Missing Asset: Entity '${entity.id}' references unknown asset '${assetId}'.`,
          severity: 'warning',
          code: 'BROKEN_ASSET_REF',
          entityId: entity.id
        });
      }
    });

    // 2. RECURSIVE UCA TREE AUDIT (Phase 15)
    if (manifest.ui.tree && manifest.ui.useUCA) {
      this.auditUCATree(manifest.ui.tree, manifest, results, paramIds, portIds, assetIds);
    }

    // 3. Modulation Integrity & Circularity
    this.auditModulations(manifest, entityIds, results);

    // 4. Parameter & Range Integrity (Contract Audit)
    if (contract?.parameters) {
      contract.parameters.forEach(param => {
        if (param.min >= param.max) {
          results.errors.push({
            id: `invalid-range-${param.id}`,
            source: this.name,
            message: `Invalid Range: Parameter '${param.id}' has min (${param.min}) >= max (${param.max}).`,
            severity: 'error',
            code: 'INVALID_PARAM_RANGE'
          });
        }
        if (param.default < param.min || param.default > param.max) {
          results.errors.push({
            id: `invalid-default-${param.id}`,
            source: this.name,
            message: `Out of Bounds: Parameter '${param.id}' default (${param.default}) is outside [${param.min}, ${param.max}].`,
            severity: 'error',
            code: 'INVALID_PARAM_DEFAULT'
          });
        }
      });
    }

    results.errorCount = results.errors.length;
    results.warningCount = results.warnings.length;
    results.infoCount = results.infos.length;

    return results;
  }

  /**
   * Recursive walk through the UCA tree.
   */
  private auditUCATree(
    root: OmegaNode, 
    manifest: OMEGA_Manifest, 
    results: TabDiagnostics,
    paramIds: Set<string>,
    portIds: Set<string>,
    assetIds: Set<string>
  ) {
    const visited = new Set<string>();
    const cellLibrary = manifest.ui.cellLibrary || {};

    const walk = (node: OmegaNode, depth: number) => {
      if (depth > 32) {
        results.errors.push({
          id: `max-depth-${node.id}`,
          source: this.name,
          message: `UCA ERROR: Max recursion depth exceeded at node '${node.id}'.`,
          severity: 'error',
          code: 'MAX_DEPTH_EXCEEDED',
          entityId: node.id
        });
        return;
      }

      if (visited.has(node.id)) {
        results.errors.push({
          id: `circular-tree-${node.id}`,
          source: this.name,
          message: `UCA ERROR: Circular reference detected at node '${node.id}'.`,
          severity: 'error',
          code: 'CIRCULAR_TREE_REF',
          entityId: node.id
        });
        return;
      }
      visited.add(node.id);

      // A. Template Reference Check
      if (node.kind === 'cell' && node.cellRef) {
        if (!cellLibrary[node.cellRef]) {
          results.errors.push({
            id: `broken-cellref-${node.id}`,
            source: this.name,
            message: `UCA ERROR: Cell '${node.id}' references unknown template '${node.cellRef}'.`,
            severity: 'error',
            code: 'BROKEN_CELL_REF',
            entityId: node.id
          });
        }
      }

      // B. Bind Integrity
      if (node.bind && node.bind !== 'none') {
        const isParam = paramIds.has(node.bind);
        const isPort = portIds.has(node.bind);
        if (!isParam && !isPort) {
          results.warnings.push({
            id: `uca-broken-bind-${node.id}`,
            source: this.name,
            message: `UCA Warning: Node '${node.id}' binds to unknown target '${node.bind}'.`,
            severity: 'warning',
            code: 'BROKEN_BIND',
            entityId: node.id
          });
        }
      }

      // C. Asset Integrity (Style Node)
      const assetId = node.style?.asset;
      if (assetId && assetId !== 'none' && !assetIds.has(assetId)) {
        results.warnings.push({
          id: `uca-broken-asset-${node.id}`,
          source: this.name,
          message: `UCA Missing Asset: Node '${node.id}' references unknown asset '${assetId}'.`,
          severity: 'warning',
          code: 'BROKEN_ASSET_REF',
          entityId: node.id
        });
      }

      // D. Recursive Step
      if (node.children) {
        node.children.forEach(child => walk(child, depth + 1));
      }
    };

    walk(root, 0);
  }

  private auditModulations(manifest: OMEGA_Manifest, entityIds: Set<string>, results: TabDiagnostics) {
    const adjacencyList = new Map<string, string[]>();
    (manifest.modulations || []).forEach((mod, index) => {
      if (!entityIds.has(mod.source)) {
        results.errors.push({
          id: `mod-source-${index}`,
          source: this.name,
          message: `Modulation references unknown source entity '${mod.source}'.`,
          severity: 'error',
          code: 'BROKEN_MOD_SOURCE'
        });
      }
      if (!entityIds.has(mod.target)) {
        results.errors.push({
          id: `mod-target-${index}`,
          source: this.name,
          message: `Modulation references unknown target entity '${mod.target}'.`,
          severity: 'error',
          code: 'BROKEN_MOD_TARGET'
        });
      }

      if (entityIds.has(mod.source) && entityIds.has(mod.target)) {
        const targets = adjacencyList.get(mod.source) || [];
        targets.push(mod.target);
        adjacencyList.set(mod.source, targets);
      }
    });

    // Circular Modulation Detection (Industrial 3-State DFS)
    const states = new Map<string, number>();
    const pathStack: string[] = [];

    const findCycle = (nodeId: string): { cycle: string[] } | null => {
      states.set(nodeId, 1); // Gray
      pathStack.push(nodeId);

      const targets = adjacencyList.get(nodeId) || [];
      for (const targetId of targets) {
        const targetState = states.get(targetId) || 0;
        if (targetState === 1) {
          const cycleStartIdx = pathStack.indexOf(targetId);
          const cyclePath = pathStack.slice(cycleStartIdx);
          return { cycle: [...cyclePath, targetId] };
        }
        if (targetState === 0) {
          const result = findCycle(targetId);
          if (result) return result;
        }
      }

      pathStack.pop();
      states.set(nodeId, 2); // Black
      return null;
    };

    const nodes = Array.from(entityIds);
    nodes.forEach(startNodeId => {
      if ((states.get(startNodeId) || 0) === 0) {
        const result = findCycle(startNodeId);
        if (result) {
          const pathStr = result.cycle.join(' -> ');
          results.errors.push({
            id: `circular-mod-${result.cycle[0]}`,
            source: this.name,
            message: `CIRCULAR_MODULATION: Feedback loop detected: [${pathStr}].`,
            severity: 'error',
            code: 'CIRCULAR_MODULATION',
            entityId: result.cycle[0]
          });
        }
      }
    });
  }
}

export const structuralAuditor = new StructuralAuditor();
