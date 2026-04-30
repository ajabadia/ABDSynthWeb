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

export interface ValidationIssue {
  path: string;
  message: string;
  keyword: string;
}

export class ValidationService {
  static validate(manifest: any): ValidationIssue[] {
    const isV7 = manifest?.schemaVersion?.startsWith('7') || manifest?.schemaVersion === '7.0';
    const validator = isV7 ? validateV7 : validateV6;
    
    const isValid = validator(manifest);
    if (isValid) return [];

    return (validator.errors || []).map(err => ({
      // Normalizamos instancePath a path para nuestra UI
      path: err.instancePath || '',
      message: err.message || 'Invalid value',
      keyword: err.keyword || 'schema'
    }));
  }
}
