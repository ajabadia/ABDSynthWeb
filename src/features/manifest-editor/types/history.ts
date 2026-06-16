import type { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';

export type HistoryEventType = 'CONTENT_CHANGE' | 'SNAPSHOT' | string;

export interface HistoryEntry {
  id: string;
  type: HistoryEventType;
  label: string;
  timestamp: number;
  correlationId: string;
  manifest: OMEGA_Manifest;
}
