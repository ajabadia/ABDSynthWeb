import AJV from 'ajv';
import addFormats from 'ajv-formats';
import era6Schema from '../data/omega-schema.json';
import era7Schema from '../data/omega-schema-v7.json';

const ajv = new AJV({ 
  allErrors: true,
  strict: false,
  verbose: true
});

addFormats(ajv);

const validateV6 = ajv.compile(era6Schema);
const validateV7 = ajv.compile(era7Schema);

import { OMEGA_Manifest, ManifestEntity } from '../types/manifest';
import { OmegaContract } from './wasmLoader';

export interface ValidationIssue {
  path: string;
  message: string;
  keyword: string;
  severity: 'error' | 'warning' | 'audit'; 
}

export class ValidationService {
  static validate(manifest: OMEGA_Manifest, contract: OmegaContract | null = null): ValidationIssue[] {
    const isV7 = manifest.schemaVersion?.startsWith('7') || manifest.schemaVersion === '7.0';
    const validator = isV7 ? validateV7 : validateV6;
    
    validator(manifest);
    const issues: ValidationIssue[] = (validator.errors || []).map(err => ({
      path: err.instancePath || '',
      message: err.message || 'Invalid value',
      keyword: err.keyword || 'schema',
      severity: 'error'
    }));

    if (manifest.schemaVersion?.startsWith('7')) {
      const hp = manifest.metadata?.rack?.hp || 12;
      const rackWidth = hp * 15;
      const rackHeight = manifest.ui.dimensions?.height || 420;
      
      const containers = manifest.ui.layout?.containers || [];
      const containerIds = new Set(containers.map(c => c.id));
      const tabs = new Set(containers.map(c => c.tab).filter(Boolean));

      const usedIds = new Set<string>();
      const telemetryIndices = new Set<number>();

      if (hp % 2 !== 0) {
        issues.push({
          path: '/metadata/rack/hp',
          message: `PRO-MASTER: HP impar (${hp}). Se recomienda HP par para estética Eurorack.`,
          keyword: 'era7_style',
          severity: 'audit'
        });
      }

      const allEntities = [
        ...(manifest.ui?.controls || []).map(e => ({ ...e, isJack: false })),
        ...(manifest.ui?.jacks || []).map(e => ({ ...e, isJack: true }))
      ];

      allEntities.forEach((entity, idx) => {
        const path = `/ui/${entity.isJack ? 'jacks' : 'controls'}/${idx}`;

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
        if (entity.isJack) {
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
        if (!entity.unit && entity.role !== 'output') {
          issues.push({ path: `${path}/unit`, message: `PRO-MASTER: Falta unidad (Hz, dB, ms, semi, %).`, keyword: 'era7_ux', severity: 'audit' });
        }

        // Advanced: Out of Bounds
        if (entity.pos.x < 0 || entity.pos.x > rackWidth || entity.pos.y < 0 || entity.pos.y > rackHeight) {
          issues.push({ path: `${path}/pos`, message: `OUT OF BOUNDS: '${entity.id}' fuera del metal.`, keyword: 'era7_integrity', severity: 'error' });
        }

        // Advanced: Orphan Binds
        if (contract && entity.bind) {
          const allBinds = [
            ...(contract.parameters?.map(p => p.id?.toLowerCase()) || []),
            ...(contract.ports?.map(p => p.id?.toLowerCase()) || [])
          ];
          if (!allBinds.includes(entity.bind.toLowerCase())) {
            issues.push({ path: `${path}/bind`, message: `ORPHAN BIND: '${entity.bind}' no existe en el contrato WASM.`, keyword: 'era7_binding', severity: 'error' });
          }
        }
      });
    }

    return issues;
  }
}
