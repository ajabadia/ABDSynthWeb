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

    // 3. Modulation Integrity
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
    });

    results.errorCount = results.errors.length;
    results.warningCount = results.warnings.length;
    results.infoCount = results.infos.length;

    return results;
  }
}

export const structuralAuditor = new StructuralAuditor();
