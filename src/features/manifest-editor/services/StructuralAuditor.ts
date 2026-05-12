/**
 * OMEGA ERA 7.2.3 - Structural Auditor
 * Semantic analysis of manifest integrity and coherence.
 */

import { OMEGA_Manifest, OMEGA_Contract } from '@/omega-ui-core/types/manifest';
import { DiagnosticSource, TabDiagnostics, createEmptyDiagnostics, DiagnosticContext } from '../types/diagnostics';

export class StructuralAuditor implements DiagnosticSource {
  id = 'structural-auditor';
  name = 'Structural';

  extractDiagnostics(manifest: OMEGA_Manifest, context?: DiagnosticContext): TabDiagnostics {
    const results = createEmptyDiagnostics();
    const contract = context?.contract as OMEGA_Contract | null;

    const allEntities = [
      ...(manifest.ui.controls || []),
      ...(manifest.ui.jacks || [])
    ];

    const containerIds = new Set((manifest.ui.layout?.containers || []).map(c => c.id));
    const entityIds = new Set(allEntities.map(e => e.id));
    const paramIds = new Set(contract?.parameters?.map(p => p.id) || []);
    const portIds = new Set(contract?.ports?.map(p => p.id) || []);

    // 1. ID Collision Check
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

    // 2. Entity Validation
    allEntities.forEach(entity => {
      // A. Broken Container Reference
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

      // B. Broken Binding (Signal/Parameter)
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

      // C. Invalid Coordinates
      if (entity.pos && (entity.pos.x < 0 || entity.pos.y < 0)) {
        results.warnings.push({
          id: `invalid-pos-${entity.id}`,
          source: this.name,
          message: `Entity '${entity.id}' has negative coordinates (${entity.pos.x}, ${entity.pos.y}).`,
          severity: 'warning',
          code: 'INVALID_COORDS',
          entityId: entity.id
        });
      }
    });

    // 3. Modulation Integrity & Circularity
    const adjacencyList = new Map<string, string[]>();
    (manifest.modulations || []).forEach((mod, index) => {
      // Basic connectivity checks
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

      // Build graph for circularity check
      if (entityIds.has(mod.source) && entityIds.has(mod.target)) {
        const targets = adjacencyList.get(mod.source) || [];
        targets.push(mod.target);
        adjacencyList.set(mod.source, targets);
      }
    });

    // 4. Circular Modulation Detection (Industrial 3-State DFS)
    // States: 0 = Unvisited (White), 1 = Visiting (Gray), 2 = Visited (Black)
    const states = new Map<string, number>();
    const pathStack: string[] = [];

    const findCycle = (nodeId: string): { cycle: string[] } | null => {
      states.set(nodeId, 1); // Gray
      pathStack.push(nodeId);

      const targets = adjacencyList.get(nodeId) || [];
      for (const targetId of targets) {
        const targetState = states.get(targetId) || 0;
        
        if (targetState === 1) {
          // Cycle detected! Back-edge to a Gray node.
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

    // Run DFS from each potential root
    const nodes = Array.from(entityIds);
    nodes.forEach(startNodeId => {
      if ((states.get(startNodeId) || 0) === 0) {
        const result = findCycle(startNodeId);
        if (result) {
          const pathStr = result.cycle.join(' -> ');
          results.errors.push({
            id: `circular-mod-${result.cycle[0]}`,
            source: this.name,
            message: `CIRCULAR_MODULATION: Feedback loop detected: [${pathStr}]. This topology is unstable and blocked.`,
            severity: 'error',
            code: 'CIRCULAR_MODULATION',
            entityId: result.cycle[0]
          });
        }
      }
    });

    // 5. Asset Resolution Audit
    const assetIds = new Set((manifest.resources.assets || []).map(a => a.id));
    allEntities.forEach(entity => {
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

    // 6. Parameter & Range Integrity (Contract Audit)
    if (contract?.parameters) {
      contract.parameters.forEach(param => {
        // A. Inverted Range
        if (param.min >= param.max) {
          results.errors.push({
            id: `invalid-range-${param.id}`,
            source: this.name,
            message: `Invalid Range: Parameter '${param.id}' has min (${param.min}) >= max (${param.max}).`,
            severity: 'error',
            code: 'INVALID_PARAM_RANGE'
          });
        }
        // B. Default Out of Bounds
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
}

export const structuralAuditor = new StructuralAuditor();
