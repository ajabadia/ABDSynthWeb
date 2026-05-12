'use client';

import { useCallback, useMemo, useReducer, useEffect, useRef } from 'react';
import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { manifestToTree } from '@/omega-ui-core/uca/ucaBridge';
import { DocumentState } from '../types/document';
import { IntegrityService } from '@/services/integrityService';
import { HistoryEntry, INITIAL_HISTORY_STATE } from '../types/history';
export { type HistoryEntry, INITIAL_HISTORY_STATE };

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
  | { type: 'UNDO_TO_INDEX'; id: string; index: number }
  | { type: 'PUSH_HISTORY'; id: string; entry: HistoryEntry };

export interface OrchestratorState {
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

/**
 * Industrial Deep Merge for OMEGA Manifests (Phase 10.1C)
 * Optimized for recursive UCA trees and legacy array preservation.
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  if (!source) return target;
  if (!target) return source;
  
  // Industrial Rule: Arrays and Primitives are REPLACED
  if (typeof source !== 'object' || Array.isArray(source)) return source;
  if (typeof target !== 'object' || Array.isArray(target)) return source;

  const result: Record<string, unknown> = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      // CRITICAL: If the key is 'tree', we typically want to REPLACEMENT if it's a full tree update,
      // but we allow deep merging if it's a partial node update. 
      // However, our updateItem sends a FULL nextTree, so replacement is safer for 'tree' and 'controls'.
      if (key === 'tree' || key === 'controls' || key === 'jacks') {
        result[key] = sourceValue;
        continue;
      }

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        result[key] = deepMerge((targetValue || {}) as Record<string, unknown>, sourceValue as Record<string, unknown>);
      } else {
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
}

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
          case 'UPDATE_DOCUMENT': {
            const doc = state.documentsById[action.id];
            if (!doc) return state;

            let nextManifest = action.updates.manifest 
              ? deepMerge(doc.manifest as unknown as Record<string, unknown>, action.updates.manifest as unknown as Record<string, unknown>) as unknown as OMEGA_Manifest
              : doc.manifest;

            // ERA 7.2.3 - SELF-HEALING TREE (Phase 10.1C)
            // If UCA is enabled but the update (or merge) resulted in a missing tree, 
            // restore it from the old manifest or re-generate it with old tree as base.
            if (nextManifest.ui?.useUCA !== false && !nextManifest.ui?.tree) {
               console.warn(`[ORCHESTRATOR] Healing missing UCA tree for ${action.id}`);
               nextManifest = {
                 ...nextManifest,
                 ui: {
                   ...nextManifest.ui,
                   tree: manifestToTree(nextManifest, doc.manifest.ui?.tree)
                 }
               };
            }
            
            return {
              ...state,
              documentsById: {
                ...state.documentsById,
                [action.id]: {
                  ...doc,
                  ...action.updates,
                  manifest: nextManifest
                }
              }
            };
          }
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
    case 'UNDO_TO_INDEX': {
      const doc = state.documentsById[action.id];
      if (!doc || action.index < 0 || action.index >= doc.history.past.length) return state;

      const targetEntry = doc.history.past[action.index];
      const newPast = doc.history.past.slice(0, action.index);
      
      // Items from index + 1 to current move to future
      const toFuture = doc.history.past.slice(action.index + 1).map(e => ({
        ...e,
        label: `Reverted: ${e.label}`
      }));
      
      const currentAsFutureEntry: HistoryEntry = {
        manifest: doc.manifest,
        timestamp: Date.now(),
        label: 'State before Jump'
      };

      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            manifest: targetEntry.manifest,
            history: {
              past: newPast,
              future: [...toFuture, currentAsFutureEntry, ...doc.history.future]
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
    useUCA: true,
    tree: {
      id: 'omega_root',
      kind: 'rack',
      role: 'root',
      layout: {
        pos: { x: 0, y: 0 },
        size: { width: 140, height: 420 }
      },
      children: [
        {
          id: 'MAIN_FACE',
          kind: 'face',
          role: 'presentation',
          layout: {
            pos: { x: 0, y: 0 },
            size: { width: 140, height: 420 }
          },
          children: []
        }
      ]
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

import { STORAGE_KEYS } from '../constants/storage';

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
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_DOCS);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Re-hydrate documents with isInitializing: true to trigger fresh hash check
        const hydratedDocs = Object.fromEntries(
          Object.entries(parsed.documentsById).map(([id, doc]) => {
            const d = doc as DocumentState;
            // Migration: If UCA is enabled but tree is missing, hydrate it now
            if (d.manifest.ui?.useUCA !== false && !d.manifest.ui?.tree) {
              d.manifest.ui = {
                ...d.manifest.ui,
                tree: manifestToTree(d.manifest)
              };
            }
            return [
              id, 
              { 
                ...d, 
                isInitializing: true, 
                lastStableHash: null,
                history: INITIAL_HISTORY_STATE 
              }
            ];
          })
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
      localStorage.setItem(STORAGE_KEYS.SESSION_DOCS, JSON.stringify(data, (key, value) => {
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

  const undo = useCallback((id: string) => dispatch({ type: 'UNDO_DOCUMENT', id }), []);
  const redo = useCallback((id: string) => dispatch({ type: 'REDO_DOCUMENT', id }), []);
  const undoTo = useCallback((id: string, index: number) => dispatch({ type: 'UNDO_TO_INDEX', id, index }), []);
  const pushHistory = useCallback((id: string, entry: HistoryEntry) => dispatch({ type: 'PUSH_HISTORY', id, entry }), []);

  // Multi-Document Hashing Effect (Gate 9.0 Hashing Coordination)
  const debouncedHashingRef = useRef<Record<string, NodeJS.Timeout>>({});
  const hashPromisesRef = useRef<Record<string, Promise<void> | null>>({});

  const flushPendingHash = useCallback(async (id: string) => {
    // 1. Clear timeout to prevent duplicate triggers
    if (debouncedHashingRef.current[id]) {
      clearTimeout(debouncedHashingRef.current[id]);
      delete debouncedHashingRef.current[id];
      
      // 2. Perform immediate sync check
      const doc = state.documentsById[id];
      if (doc) {
        const currentHash = await IntegrityService.generateManifestHash(doc.manifest);
        const isNowDirty = currentHash !== doc.lastStableHash;
        dispatch({ type: 'SET_DIRTY', id, isDirty: isNowDirty });
      }
    }

    // 3. Wait for any in-flight async hash operation
    if (hashPromisesRef.current[id]) {
      await hashPromisesRef.current[id];
    }
  }, [state.documentsById]);

  const captureStableSnapshot = useCallback(async (id: string) => {
    await flushPendingHash(id); // Ensure integrity before snapshot (Gate 9.0 requirement)
    const doc = state.documentsById[id];
    if (!doc) return;
    const hash = await IntegrityService.generateManifestHash(doc.manifest);
    dispatch({ type: 'CAPTURE_HASH', id, hash });
  }, [state.documentsById, flushPendingHash]);

  useEffect(() => {
    Object.values(state.documentsById).forEach(doc => {
      if (doc.isInitializing) {
        // Capture baseline after a small delay
        const t = setTimeout(async () => {
          const promise = (async () => {
            const hash = await IntegrityService.generateManifestHash(doc.manifest);
            dispatch({ type: 'CAPTURE_HASH', id: doc.id, hash });
            dispatch({ type: 'SET_INITIALIZED', id: doc.id });
          })();
          
          hashPromisesRef.current[doc.id] = promise;
          await promise;
          if (hashPromisesRef.current[doc.id] === promise) {
            hashPromisesRef.current[doc.id] = null;
          }
        }, 500);
        return () => clearTimeout(t);
      }

      // Debounced dirty check
      if (debouncedHashingRef.current[doc.id]) {
        clearTimeout(debouncedHashingRef.current[doc.id]);
      }

      debouncedHashingRef.current[doc.id] = setTimeout(async () => {
        const promise = (async () => {
          const currentHash = await IntegrityService.generateManifestHash(doc.manifest);
          const isNowDirty = currentHash !== doc.lastStableHash;
          if (isNowDirty !== doc.isDirty) {
            dispatch({ type: 'SET_DIRTY', id: doc.id, isDirty: isNowDirty });
          }
        })();

        hashPromisesRef.current[doc.id] = promise;
        await promise;
        // Only clear if it's still the same promise (prevent race from new edits)
        if (hashPromisesRef.current[doc.id] === promise) {
          hashPromisesRef.current[doc.id] = null;
          delete debouncedHashingRef.current[doc.id];
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
    flushPendingHash,
    resetDocument,
    undo,
    redo,
    undoTo,
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
    flushPendingHash,
    resetDocument,
    undo,
    redo,
    undoTo,
    pushHistory
  ]);
};
