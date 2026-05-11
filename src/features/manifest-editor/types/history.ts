import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';

/**
 * OMEGA History Engine (v8.0.0)
 * Encapsulates a single reversible action in the editor.
 */
export interface HistoryEntry {
  manifest: OMEGA_Manifest;
  timestamp: number;
  label: string;
  metadata?: {
    selection?: string[];
    focus?: string;
  };
}

/**
 * Per-document history stacks.
 */
export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
}

export const INITIAL_HISTORY_STATE: HistoryState = {
  past: [],
  future: []
};
