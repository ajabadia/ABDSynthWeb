import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';

/**
 * OMEGA Document State (v7.2.3)
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
}

export interface DocumentOrchestrator {
  documentsById: Record<string, DocumentState>;
  activeDocumentId: string;
  openDocument: (id: string, manifest: OMEGA_Manifest) => void;
  closeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Omit<DocumentState, 'manifest'>> & { manifest?: Partial<OMEGA_Manifest> }) => void;
  setActiveDocument: (id: string) => void;
  captureStableSnapshot: (id: string) => Promise<void>;
  resetDocument: (id: string) => void;
}
