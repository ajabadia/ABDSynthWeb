'use client';

import { useCallback, useMemo, useReducer, useEffect, useRef } from 'react';
import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { DocumentState } from '../types/document';
import { IntegrityService } from '@/services/integrityService';
import { HistoryEntry, INITIAL_HISTORY_STATE } from '../types/history';

type DocumentAction = 
  | { type: 'OPEN_DOCUMENT'; id: string; manifest: OMEGA_Manifest }
  | { type: 'CLOSE_DOCUMENT'; id: string }
  | { type: 'UPDATE_DOCUMENT'; id: string; updates: Partial<Omit<DocumentState, 'manifest'>> & { manifest?: Partial<OMEGA_Manifest> } }
  | { type: 'SET_ACTIVE_DOCUMENT'; id: string }
  | { type: 'CAPTURE_HASH'; id: string; hash: string }
  | { type: 'SET_DIRTY'; id: string; isDirty: boolean }
  | { type: 'SET_INITIALIZED'; id: string }
  | { type: 'HYDRATE_SESSION'; state: OrchestratorState }
  | { type: 'RESET_DOCUMENT'; id: string }
  | { type: 'UNDO_DOCUMENT'; id: string }
  | { type: 'REDO_DOCUMENT'; id: string }
  | { type: 'PUSH_HISTORY'; id: string; entry: HistoryEntry };

interface OrchestratorState {
  documentsById: Record<string, DocumentState>;
  activeDocumentId: string;
}

const createInitialDocument = (id: string, manifest: OMEGA_Manifest): DocumentState => ({
  id,
  manifest,
  contract: null,
  wasmBuffer: null,
  extraResources: [],
  isDirty: false,
  lastStableHash: null,
  isInitializing: true,
  history: INITIAL_HISTORY_STATE
});

function orchestratorReducer(state: OrchestratorState, action: DocumentAction): OrchestratorState {
  switch (action.type) {
    case 'OPEN_DOCUMENT':
      if (state.documentsById[action.id]) return state; // Already open
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: createInitialDocument(action.id, action.manifest)
        },
        activeDocumentId: action.id
      };
    case 'CLOSE_DOCUMENT': {
      const remaining = { ...state.documentsById };
      delete remaining[action.id];
      const nextActiveId = state.activeDocumentId === action.id 
        ? Object.keys(remaining)[0] || 'primary'
        : state.activeDocumentId;
      return {
        ...state,
        documentsById: remaining,
        activeDocumentId: nextActiveId
      };
    }
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...state.documentsById[action.id],
            ...action.updates,
            // If manifest is updated, ensure we merge properly
            manifest: action.updates.manifest 
              ? { ...state.documentsById[action.id].manifest, ...action.updates.manifest }
              : state.documentsById[action.id].manifest
          }
        }
      };
    case 'SET_ACTIVE_DOCUMENT':
      if (state.activeDocumentId === action.id) return state;
      return { ...state, activeDocumentId: action.id };
    case 'CAPTURE_HASH':
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...state.documentsById[action.id],
            lastStableHash: action.hash,
            isDirty: false
          }
        }
      };
    case 'SET_DIRTY':
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...state.documentsById[action.id],
            isDirty: action.isDirty
          }
        }
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...state.documentsById[action.id],
            isInitializing: false
          }
        }
      };
    case 'HYDRATE_SESSION':
      return {
        ...action.state
      };
    case 'RESET_DOCUMENT': {
      const doc = state.documentsById[action.id];
      if (!doc) return state;
      // Push current state to history before resetting to make it undoable
      const resetEntry: HistoryEntry = {
        manifest: doc.manifest,
        timestamp: Date.now(),
        label: 'Reset Document (Automatic Snapshot)'
      };
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...createInitialDocument(action.id, DEFAULT_MANIFEST),
            isInitializing: false,
            history: {
              ...doc.history,
              past: [...doc.history.past, resetEntry],
              future: []
            }
          }
        }
      };
    }
    case 'UNDO_DOCUMENT': {
      const doc = state.documentsById[action.id];
      if (!doc || doc.history.past.length === 0) return state;
      
      const newPast = [...doc.history.past];
      const previousEntry = newPast.pop()!;
      
      const currentAsFutureEntry: HistoryEntry = {
        manifest: doc.manifest,
        timestamp: Date.now(),
        label: 'Undo Action'
      };

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            manifest: previousEntry.manifest,
            history: {
              past: newPast,
              future: [currentAsFutureEntry, ...doc.history.future]
            }
          }
        }
      };
    }
    case 'REDO_DOCUMENT': {
      const doc = state.documentsById[action.id];
      if (!doc || doc.history.future.length === 0) return state;
      
      const newFuture = [...doc.history.future];
      const nextEntry = newFuture.shift()!;
      
      const currentAsPastEntry: HistoryEntry = {
        manifest: doc.manifest,
        timestamp: Date.now(),
        label: 'Redo Action'
      };

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            manifest: nextEntry.manifest,
            history: {
              past: [...doc.history.past, currentAsPastEntry],
              future: newFuture
            }
          }
        }
      };
    }
    case 'PUSH_HISTORY': {
      const doc = state.documentsById[action.id];
      if (!doc) return state;
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            history: {
              past: [...doc.history.past, action.entry].slice(-50), // Cap history at 50 entries
              future: []
            }
          }
        }
      };
    }
    default:
      return state;
  }
}

const DEFAULT_MANIFEST: OMEGA_Manifest = {
  schemaVersion: '7.2.3',
  id: 'omega_primary',
  metadata: { 
    name: 'Primary Manifest', 
    family: 'oscillator', 
    tags: ['era7'] 
  },
  ui: { 
    dimensions: { width: 140, height: 420 },
    controls: [],
    jacks: [],
    layout: { 
      containers: [], 
      planes: ['MAIN'], 
      gridSnap: 5 
    },
    ucaDebug: {
      enabled: false
    }
  },
  resources: { 
    wasm: 'module.wasm',
    assets: []
  }
};

export const useDocumentOrchestrator = () => {
  const [state, dispatch] = useReducer(orchestratorReducer, {
    documentsById: {
      'primary': createInitialDocument('primary', DEFAULT_MANIFEST)
    },
    activeDocumentId: 'primary'
  });

  // Client-Side Hydration (Fix for Hydration Mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('omega_session_docs');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Re-hydrate documents with isInitializing: true to trigger fresh hash check
        const hydratedDocs = Object.fromEntries(
          Object.entries(parsed.documentsById).map(([id, doc]) => [
            id, 
            { 
              ...(doc as DocumentState), 
              isInitializing: true, 
              lastStableHash: null,
              history: INITIAL_HISTORY_STATE // History is volatile
            }
          ])
        );
        dispatch({ 
          type: 'HYDRATE_SESSION', 
          state: {
            ...parsed,
            documentsById: hydratedDocs
          } 
        });
      }
    } catch (err) {
      console.error('[OMEGA ORCHESTRATOR] Session restore failed:', err);
    }
  }, []);

  // Session Persistence: Save to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const data = {
        documentsById: state.documentsById,
        activeDocumentId: state.activeDocumentId
      };
      // We only save manifests and IDs, not buffers/contracts/history
      localStorage.setItem('omega_session_docs', JSON.stringify(data, (key, value) => {
        if (key === 'wasmBuffer' || key === 'contract' || key === 'extraResources' || key === 'history') return undefined;
        return value;
      }));
    }
  }, [state.documentsById, state.activeDocumentId]);

  const activeDocument = useMemo(() => 
    state.documentsById[state.activeDocumentId] || state.documentsById['primary']
  , [state.documentsById, state.activeDocumentId]);

  // Actions
  const openDocument = useCallback((id: string, manifest: OMEGA_Manifest) => {
    dispatch({ type: 'OPEN_DOCUMENT', id, manifest });
  }, []);

  const closeDocument = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_DOCUMENT', id });
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Omit<DocumentState, 'manifest'>> & { manifest?: Partial<OMEGA_Manifest> }) => {
    dispatch({ type: 'UPDATE_DOCUMENT', id, updates });
  }, []);

  const setActiveDocument = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_DOCUMENT', id });
  }, []);

  const resetDocument = useCallback((id: string) => {
    dispatch({ type: 'RESET_DOCUMENT', id });
  }, []);

  const undo = useCallback((id: string) => {
    dispatch({ type: 'UNDO_DOCUMENT', id });
  }, []);

  const redo = useCallback((id: string) => {
    dispatch({ type: 'REDO_DOCUMENT', id });
  }, []);

  const pushHistory = useCallback((id: string, entry: HistoryEntry) => {
    dispatch({ type: 'PUSH_HISTORY', id, entry });
  }, []);

  const captureStableSnapshot = useCallback(async (id: string) => {
    const doc = state.documentsById[id];
    if (!doc) return;
    const hash = await IntegrityService.generateManifestHash(doc.manifest);
    dispatch({ type: 'CAPTURE_HASH', id, hash });
  }, [state.documentsById]);

  // Multi-Document Hashing Effect
  const debouncedHashingRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    Object.values(state.documentsById).forEach(doc => {
      if (doc.isInitializing) {
        // Capture baseline after a small delay
        const t = setTimeout(async () => {
          const hash = await IntegrityService.generateManifestHash(doc.manifest);
          dispatch({ type: 'CAPTURE_HASH', id: doc.id, hash });
          dispatch({ type: 'SET_INITIALIZED', id: doc.id });
        }, 500);
        return () => clearTimeout(t);
      }

      // Debounced dirty check
      if (debouncedHashingRef.current[doc.id]) {
        clearTimeout(debouncedHashingRef.current[doc.id]);
      }

      debouncedHashingRef.current[doc.id] = setTimeout(async () => {
        const currentHash = await IntegrityService.generateManifestHash(doc.manifest);
        const isNowDirty = currentHash !== doc.lastStableHash;
        if (isNowDirty !== doc.isDirty) {
          dispatch({ type: 'SET_DIRTY', id: doc.id, isDirty: isNowDirty });
        }
      }, 200);
    });

    const currentDebounced = debouncedHashingRef.current;
    return () => {
      Object.values(currentDebounced).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [state.documentsById]);

  return useMemo(() => ({
    documentsById: state.documentsById,
    activeDocumentId: state.activeDocumentId,
    activeDocument,
    openDocument,
    closeDocument,
    updateDocument,
    setActiveDocument,
    captureStableSnapshot,
    resetDocument,
    undo,
    redo,
    pushHistory,
    // Compat with Phase 7.0 primary accessor
    primaryDocument: activeDocument 
  }), [
    state.documentsById, 
    state.activeDocumentId, 
    activeDocument, 
    openDocument, 
    closeDocument, 
    updateDocument, 
    setActiveDocument, 
    captureStableSnapshot,
    resetDocument,
    undo,
    redo,
    pushHistory
  ]);
};
