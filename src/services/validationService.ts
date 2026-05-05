import { OMEGA_Manifest } from '../types/manifest';
import { OmegaContract } from './wasmLoader';
import { ValidationIssue } from '../types/validation';
import { SchemaValidator } from './validation/schemaValidator';
import { IndustrialRules } from './validation/industrialRules';

export class ValidationService {
  /**
   * Orchestrates the complete validation pipeline (Schema + Industrial Rules).
   */
  static validate(manifest: OMEGA_Manifest, contract: OmegaContract | null = null): ValidationIssue[] {
    // 1. Technical Schema Validation (AJV)
    const schemaIssues = SchemaValidator.validate(manifest);
    
    // 2. Industrial/Business Rules (Era 7)
    const industrialIssues = IndustrialRules.validate(manifest, contract);

    return [...schemaIssues, ...industrialIssues];
  }
}
