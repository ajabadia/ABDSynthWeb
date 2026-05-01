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

    // GOBERNANZA ERA 7.1: Validación de Roles Obligatorios
    if (manifest.schemaVersion?.startsWith('7')) {
      const allEntities = [
        ...(manifest.ui?.controls || []),
        ...(manifest.ui?.jacks || [])
      ];

      allEntities.forEach((entity, idx) => {
        if (!entity.role) {
          issues.push({
            path: `/ui/${(entity as any).isJack ? 'jacks' : 'controls'}/${idx}`,
            message: 'ERROR DE GOBERNANZA: Falta el Registry Role obligatorio.',
            keyword: 'era7_governance'
          });
        }
      });
    }

    return issues;
  }
}
