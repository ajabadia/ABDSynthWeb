import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';
import { HistoryState, HistoryEntry } from './history';

/**
 * OMEGA Document State (v7.2.3 -> v8.0.0 History Engine)
 * Represents the complete state of a single manifest document.
 */
export interface DocumentState {
  id: string;
  manifest: OMEGA_Manifest;
  contract: OmegaContract | null;
  wasmBuffer: ArrayBuffer | null;
  extraResources: { name: string, data: ArrayBuffer, type: string }[];
  isDirty: boolean;
  lastStableHash: string | null;
  isInitializing: boolean;
  history: HistoryState;
}

export interface DocumentOrchestrator {
  documentsById: Record<string, DocumentState>;
  activeDocumentId: string;
  activeDocument: DocumentState;
  openDocument: (id: string, manifest: OMEGA_Manifest) => void;
  closeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Omit<DocumentState, 'manifest' | 'history'>> & { manifest?: Partial<OMEGA_Manifest> }) => void;
  setActiveDocument: (id: string) => void;
  captureStableSnapshot: (id: string) => Promise<void>;
  resetDocument: (id: string) => void;
  // History API
  undo: (id: string) => void;
  redo: (id: string) => void;
  undoTo: (id: string, index: number) => void;
  pushHistory: (id: string, entry: HistoryEntry) => void;
}
