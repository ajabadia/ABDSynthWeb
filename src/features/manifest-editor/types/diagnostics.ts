import type { ValidationIssue } from '@/types/validation';

export type Diagnostic = ValidationIssue;

export interface AuditResult {
  isCompliant: boolean;
  score: number;
  status: 'CERTIFIED' | 'CRITICAL_FAIL' | 'DRAFT';
  checks: {
    governance: boolean;
    technical: boolean;
    aesthetic: boolean;
    integrity: boolean;
  };
  details: string[];
  issues: Diagnostic[];
  errors: Diagnostic[];
  warnings: Diagnostic[];
  infos: Diagnostic[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}
