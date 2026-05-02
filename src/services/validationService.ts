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

import { OMEGA_Manifest } from '../types/manifest';

export interface ValidationIssue {
  path: string;
  message: string;
  keyword: string;
}

export class ValidationService {
  static validate(manifest: OMEGA_Manifest): ValidationIssue[] {
    const isV7 = manifest.schemaVersion?.startsWith('7') || manifest.schemaVersion === '7.0';
    const validator = isV7 ? validateV7 : validateV6;
    
    const isValid = validator(manifest);
    const issues = (validator.errors || []).map(err => ({
      path: err.instancePath || '',
      message: err.message || 'Invalid value',
      keyword: err.keyword || 'schema'
    }));

    // GOBERNANZA ERA 7.2.3: Integridad Estructural
    if (manifest.schemaVersion?.startsWith('7')) {
      const hp = manifest.metadata?.rack?.hp || 12;
      const rackWidth = hp * 15;
      const rackHeight = manifest.ui.dimensions?.height || 420;
      
      const containers = manifest.ui.layout?.containers || [];
      const containerIds = new Set<string>();
      const containerMap = new Map<string, any>();

      containers.forEach((container, idx) => {
        containerIds.add(container.id);
        containerMap.set(container.id, container);

        // 1. Contenedor vs Rack
        const cw = typeof container.size.w === 'number' ? container.size.w : rackWidth; // Simplificado para validación
        if (container.pos.x < 0 || container.pos.y < 0 || 
            container.pos.x + (typeof container.size.w === 'number' ? container.size.w : 0) > rackWidth || 
            container.pos.y + container.size.h > rackHeight) {
          issues.push({
            path: `/ui/layout/containers/${idx}`,
            message: `INTEGRIDAD: El contenedor '${container.id}' excede los límites físicos del Rack.`,
            keyword: 'era7_integrity'
          });
        }

        // ID Unico
        if (containerIds.has(container.id) && Array.from(containerIds).filter(id => id === container.id).length > 1) {
          issues.push({
            path: `/ui/layout/containers/${idx}`,
            message: `ARQUITECTURA: ID de contenedor duplicado '${container.id}'.`,
            keyword: 'era7_layout'
          });
        }
      });

      const allEntities = [
        ...(manifest.ui?.controls || []).map(e => ({ ...e, isJack: false })),
        ...(manifest.ui?.jacks || []).map(e => ({ ...e, isJack: true }))
      ];

      allEntities.forEach((entity, idx) => {
        const path = `/ui/${entity.isJack ? 'jacks' : 'controls'}/${idx}`;

        // 4. Validación de Roles Obligatorios
        if (!entity.role) {
          issues.push({
            path: path,
            message: 'ERROR DE GOBERNANZA: Falta el Registry Role obligatorio.',
            keyword: 'era7_governance'
          });
        }

        // 2. Cell vs Rack
        if (entity.pos.x < 0 || entity.pos.x > rackWidth || entity.pos.y < 0 || entity.pos.y > rackHeight) {
          issues.push({
            path: `${path}/pos`,
            message: `INTEGRIDAD: La Cell '${entity.id}' está fuera del Rack.`,
            keyword: 'era7_integrity'
          });
        }

        // 3. Cell vs Contenedor
        if (entity.presentation?.container) {
          const container = containerMap.get(entity.presentation.container);
          if (container) {
            const cw = typeof container.size.w === 'number' ? container.size.w : rackWidth;
            const margin = 5; // Margen de seguridad para el centro del componente
            
            if (entity.pos.x < container.pos.x || 
                entity.pos.x > (container.pos.x + cw) || 
                entity.pos.y < container.pos.y || 
                entity.pos.y > (container.pos.y + container.size.h)) {
              issues.push({
                path: `${path}/presentation/container`,
                message: `INTEGRIDAD: La Cell '${entity.id}' se encuentra fuera de los límites de su contenedor '${container.id}'.`,
                keyword: 'era7_integrity'
              });
            }
          } else {
            issues.push({
              path: `${path}/presentation/container`,
              message: `ARQUITECTURA: El contenedor referenciado '${entity.presentation.container}' no existe.`,
              keyword: 'era7_layout'
            });
          }
        }

        // Warning de grupos legacy
        if (entity.presentation?.group && !entity.presentation?.container) {
          issues.push({
            path: `/ui/${(entity as any).isJack ? 'jacks' : 'controls'}/${idx}/presentation/group`,
            message: `LEGACY: Se recomienda migrar el grupo '${entity.presentation.group}' al sistema de contenedores 7.2.`,
            keyword: 'era7_legacy'
          });
        }
      });
    }

    return issues;
  }
}
