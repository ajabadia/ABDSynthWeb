/**
 * OMEGA ERA 7.2.3 - Diagnostic System Types
 * Formal contracts for multi-source validation aggregation.
 */

import { OMEGA_Manifest, OMEGA_Contract } from '@/omega-ui-core/types/manifest';

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  id: string;          // Unique ID for the diagnostic (e.g., 'broken-bind-osc1')
  source: string;      // Name of the source (e.g., 'Monaco', 'Structural', 'Layout')
  message: string;     // Human-readable message
  severity: DiagnosticSeverity;
  line?: number;       // Optional line number (primarily for Monaco)
  column?: number;     // Optional column number
  entityId?: string;   // Optional ID of the affected manifest entity
  code?: string;       // Machine-readable error code
}

export interface TabDiagnostics {
  errors: Diagnostic[];
  warnings: Diagnostic[];
  infos: Diagnostic[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export interface DiagnosticContext {
  contract: OMEGA_Contract | null;
  [key: string]: unknown;
}

export interface DiagnosticSource {
  id: string;
  name: string;
  /**
   * Evaluates the manifest and returns diagnostic issues.
   * For Monaco, this might involve reading external markers.
   * For others, it involves semantic analysis of the manifest object.
   */
  extractDiagnostics: (manifest: OMEGA_Manifest, context?: DiagnosticContext) => TabDiagnostics;
}

/**
 * Empty diagnostics factory
 */
export const createEmptyDiagnostics = (): TabDiagnostics => ({
  errors: [],
  warnings: [],
  infos: [],
  errorCount: 0,
  warningCount: 0,
  infoCount: 0
});
