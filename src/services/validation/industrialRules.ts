import { OMEGA_Manifest, ManifestEntity } from '../../types/manifest';
import { ValidationIssue } from '../../types/validation';
import { OmegaContract } from '../wasmLoader';

export class IndustrialRules {
  static validate(manifest: OMEGA_Manifest, contract: OmegaContract | null): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (!manifest.schemaVersion?.startsWith('7')) return issues;

    const hp = manifest.metadata?.rack?.hp || 12;
    const rackWidth = hp * 15;
    const rackHeight = manifest.ui.dimensions?.height || 420;
    
    const containers = manifest.ui.layout?.containers || [];
    const usedIds = new Set<string>();

    if (hp % 2 !== 0) {
      issues.push({
        path: '/metadata/rack/hp',
        message: `PRO-MASTER: HP impar (${hp}). Se recomienda HP par para estética Eurorack.`,
        keyword: 'era7_style',
        severity: 'audit'
      });
    }

    const containerTabMap = new Map(containers.map(c => [c.id, c.tab || 'MAIN']));

    const validateEntity = (entity: ManifestEntity, path: string) => {
      const entityTab = containerTabMap.get(entity.presentation?.container || '') || 'MAIN';

      // Golden Rule 1: Identity
      if (usedIds.has(entity.id)) {
        issues.push({ path: `${path}/id`, message: `DOUBLE IDENTITY: ID '${entity.id}' duplicado.`, keyword: 'era7_identity', severity: 'error' });
      }
      usedIds.add(entity.id);

      // Pro-Master: Rule of 5px
      if (entity.pos.x % 5 !== 0 || entity.pos.y % 5 !== 0) {
        issues.push({
          path: `${path}/pos`,
          message: `PRO-MASTER: Desalineado. La posición (${entity.pos.x}, ${entity.pos.y}) debe ser múltiplo de 5 (Regla de los 5px).`,
          keyword: 'era7_alignment',
          severity: 'audit'
        });
      }

      // Pro-Master: Port Normalization
      if (path.includes('/jacks/')) {
        const color = entity.presentation?.color;
        if (!color) {
          issues.push({
            path: `${path}/presentation/color`,
            message: `PRO-MASTER: Puerto sin color. Usa B_cyan (Audio/CV), neon_amber (Mod), white (Gate) u orange (MIDI).`,
            keyword: 'era7_port_norm',
            severity: 'audit'
          });
        }
      }

      // Pro-Master: Missing Units
      const isIndicator = entity.role === 'telemetry' || entity.presentation?.component === 'led' || entity.presentation?.component === 'display';
      const isMidiOrString = entity.type === 'string' || manifest.metadata?.family === 'midi';
      if (!entity.unit && entity.role !== 'output' && !isIndicator && !isMidiOrString) {
        issues.push({ path: `${path}/unit`, message: `PRO-MASTER: Falta unidad (Hz, dB, ms, semi, %). Requerido para parámetros de control.`, keyword: 'era7_ux', severity: 'audit' });
      }

      // Advanced: Out of Bounds
      if (entity.pos.x < 0 || entity.pos.x > rackWidth || entity.pos.y < 0 || entity.pos.y > rackHeight) {
        issues.push({ path: `${path}/pos`, message: `OUT OF BOUNDS: '${entity.id}' fuera del metal.`, keyword: 'era7_integrity', severity: 'error' });
      }

      // Advanced: Orphan Binds
      if (contract && entity.bind) {
        const cleanBind = String(entity.bind).trim().toLowerCase();
        const allBinds = [
          ...(contract.parameters?.map(p => String(p.id).trim().toLowerCase()) || []),
          ...(contract.ports?.map(p => String(p.id).trim().toLowerCase()) || [])
        ];
        
        if (!allBinds.includes(cleanBind)) {
          issues.push({ 
            path: `${path}/bind`, 
            message: `ORPHAN BIND: '${entity.bind}' no existe en el contrato WASM.`, 
            keyword: 'era7_binding', 
            severity: 'error' 
          });
        }
      }

      // Pro-Master: Overlapping & Ergonomics
      const allEntities = [
        ...(manifest.ui?.controls || []),
        ...(manifest.ui?.jacks || [])
      ];

      allEntities.forEach((other) => {
        if (entity.id === other.id) return;
        
        const otherTab = containerTabMap.get(other.presentation?.container || 'STATUS') || 'MAIN';
        if (entityTab !== otherTab) return;

        const dist = Math.sqrt(Math.pow(entity.pos.x - other.pos.x, 2) + Math.pow(entity.pos.y - other.pos.y, 2));
        if (dist < 5) {
          issues.push({ path: `${path}/pos`, message: `PRO-MASTER: Colisión crítica con '${other.id}'. Componentes solapados en pestaña '${entityTab}'.`, keyword: 'era7_collision', severity: 'error' });
        }
      });

      // Pro-Master: Unit Consistency
      const label = (entity.label || '').toLowerCase();
      if ((label.includes('freq') || label.includes('cut') || label.includes('pich')) && entity.unit !== 'Hz' && entity.unit !== 'kHz' && entity.unit !== 'semi') {
        issues.push({ path: `${path}/unit`, message: `PRO-MASTER: Consistencia de unidades. Parámetro tonal detectado, se recomienda 'Hz' o 'semi'.`, keyword: 'era7_ux_context', severity: 'audit' });
      }
    };

    (manifest.ui?.controls || []).forEach((e, idx) => validateEntity(e, `/ui/controls/${idx}`));
    (manifest.ui?.jacks || []).forEach((e, idx) => validateEntity(e, `/ui/jacks/${idx}`));

    return issues;
  }
}
