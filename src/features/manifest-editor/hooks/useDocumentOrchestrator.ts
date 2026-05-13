'use client';

import { useCallback, useMemo, useReducer, useEffect, useRef } from 'react';
import type { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { manifestToTree } from '@/omega-ui-core/uca/ucaBridge';
import type { DocumentState } from '../types/document';
import { IntegrityService } from '@/services/integrityService';
import { persistenceService } from '@/services/persistenceService';
import { observabilityService } from '@/services/observabilityService';
import { BlueprintValidator } from '@/omega-ui-core/uca/blueprintValidator';
import { historyService } from '@/services/historyService';
import { HistoryRestoreEngine } from '@/services/historyRestore';
import type { HistoryEntry } from '../types/history';
import { INITIAL_HISTORY_STATE } from '../types/history';
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
  | { type: 'PUSH_HISTORY'; id: string; entry: HistoryEntry }
  | { type: 'START_TRANSACTION'; id: string; label: string; correlationId: string }
  | { type: 'COMMIT_TRANSACTION'; id: string }
  | { type: 'ABORT_TRANSACTION'; id: string };

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
  history: INITIAL_HISTORY_STATE,
  activeTransaction: null
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

      // CRITICAL: If the key is 'tree', we typically want to REPLACEMENT if it's a full tree update
      if (key === 'tree') {
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

            // PURGE LEGACY ARRAYS (Aggressive Demolition)
            if (nextManifest.ui) {
              delete (nextManifest.ui as Record<string, unknown>).controls;
              delete (nextManifest.ui as Record<string, unknown>).jacks;
            }

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
    case 'CAPTURE_HASH': {
      const doc = state.documentsById[action.id];
      if (!doc) return state;
      // Do not capture stable hash if a transaction is mid-flight
      if (doc.activeTransaction) return state;
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: { ...doc, lastStableHash: action.hash, isDirty: false }
        }
      };
    }
    case 'START_TRANSACTION': {
      const doc = state.documentsById[action.id];
      if (!doc || doc.activeTransaction) return state;
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            activeTransaction: {
              label: action.label,
              baseManifest: JSON.parse(JSON.stringify(doc.manifest)), // Deep copy for rollback
              correlationId: action.correlationId
            }
          }
        }
      };
    }
    case 'COMMIT_TRANSACTION': {
      const doc = state.documentsById[action.id];
      if (!doc || !doc.activeTransaction) return state;
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            activeTransaction: null
          }
        }
      };
    }
    case 'ABORT_TRANSACTION': {
      const doc = state.documentsById[action.id];
      if (!doc || !doc.activeTransaction) return state;
      return {
        ...state,
        documentsById: {
          ...state.documentsById,
          [action.id]: {
            ...doc,
            manifest: doc.activeTransaction.baseManifest,
            activeTransaction: null
          }
        }
      };
    }
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
    version: '1.0.0',
    family: 'oscillator', 
    tags: ['era7'] 
  },
  ui: { 
    dimensions: { width: 140, height: 420 },
    layout: { 
      width: 140,
      height: 420,
      containers: [], 
      planes: ['MAIN'], 
      grid: { enabled: true, spacingX: 5, spacingY: 5, snapMode: 'center' }
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
      enabled: false,
      showLabels: false,
      hideDecorative: false,
      showCADOverlay: false
    }
  },
  entities: [],
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

  // Client-Side Hydration (Phase 20.6 - Persistence & Recovery)
  useEffect(() => {
    try {
      const persisted = persistenceService.loadCanonicalState();
      
      if (persisted) {
        // Mandatory Validation before rehydration
        try {
          BlueprintValidator.validate(persisted.graph, { id: persisted.id } as any);
          
          observabilityService.trackEvent({
            correlationId: persisted.metadata.lastCorrelationId,
            phase: 'PHASE_20_RECOVERY',
            component: 'ORCHESTRATOR',
            state: 'SUCCESS',
            message: `Rehydrated canonical state for ${persisted.id} (Hash: ${persisted.metadata.syncHash})`
          });

          // Open the recovered document
          const recoveredManifest: OMEGA_Manifest = {
            ...DEFAULT_MANIFEST,
            id: persisted.id,
            ui: {
              ...DEFAULT_MANIFEST.ui,
              tree: persisted.graph
            }
          };

          dispatch({ 
            type: 'OPEN_DOCUMENT', 
            id: persisted.id, 
            manifest: recoveredManifest
          });

          // Phase 21.1: Capture as historical revision
          historyService.captureRevision(
            persisted.graph as any,
            'RECOVERY_POINT',
            persisted.metadata.lastCorrelationId,
            'Session Recovery Point'
          );
          
          return; // Skip general session hydration if canonical recovery succeeds
        } catch (valErr: any) {
          observabilityService.trackEvent({
            correlationId: persisted.metadata.lastCorrelationId,
            phase: 'PHASE_20_RECOVERY',
            component: 'ORCHESTRATOR',
            state: 'FAILURE',
            code: 'RECOVERY_VALIDATION_FAILED',
            message: `Persisted state invalid: ${valErr.message}`
          });
          persistenceService.clearPersistedState();
        }
      }

      // Fallback to legacy session hydration if no canonical state or validation failed
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION_DOCS);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'HYDRATE_SESSION', state: parsed });
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
      // We only save manifests and IDs, not large binary buffers or contracts
      localStorage.setItem(STORAGE_KEYS.SESSION_DOCS, JSON.stringify(data, (key, value) => {
        if (key === 'wasmBuffer' || key === 'contract' || key === 'extraResources') return undefined;
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
  
  const startTransaction = useCallback((id: string, label: string) => {
    const correlationId = observabilityService.generateCorrelationId();
    dispatch({ type: 'START_TRANSACTION', id, label, correlationId });
    observabilityService.trackEvent({
      correlationId,
      phase: 'PHASE_20_TRANSACTION',
      component: 'ORCHESTRATOR',
      state: 'START',
      message: `Transaction started: ${label}`
    });
  }, []);

  const commitTransaction = useCallback((id: string) => {
    const doc = state.documentsById[id];
    if (!doc || !doc.activeTransaction) return;
    
    const correlationId = doc.activeTransaction.correlationId;
    const label = doc.activeTransaction.label;

    try {
      // 1. Validation (Blocking)
      if (doc.manifest.ui?.tree) {
        BlueprintValidator.validate(doc.manifest.ui.tree, doc.manifest);
      }

      // Phase 21.1: Capture as historical revision
      historyService.captureRevision(
        doc.manifest.nodes || [],
        'TRANSACTION_COMMIT',
        doc.activeTransaction.correlationId,
        doc.activeTransaction.label
      );

      dispatch({ type: 'COMMIT_TRANSACTION', id: id });
      
      observabilityService.trackEvent({
        correlationId,
        phase: 'PHASE_20_TRANSACTION',
        component: 'ORCHESTRATOR',
        state: 'SUCCESS',
        message: `Transaction committed: ${label}`
      });
    } catch (err: any) {
      observabilityService.trackEvent({
        correlationId,
        phase: 'PHASE_20_TRANSACTION',
        component: 'ORCHESTRATOR',
        state: 'FAILURE',
        code: 'TRANSACTION_COMMIT_FAILED',
        message: `Validation failed for transaction '${label}': ${err.message}`
      });
      // Automatic Rollback on failure
      dispatch({ type: 'ABORT_TRANSACTION', id });
    }
  }, [state.documentsById]);

  const abortTransaction = useCallback((id: string) => {
    const doc = state.documentsById[id];
    if (!doc || !doc.activeTransaction) return;

    observabilityService.trackEvent({
      correlationId: doc.activeTransaction.correlationId,
      phase: 'PHASE_20_TRANSACTION',
      component: 'ORCHESTRATOR',
      state: 'ROLLBACK',
      message: `Transaction aborted: ${doc.activeTransaction.label}`
    });
    dispatch({ type: 'ABORT_TRANSACTION', id });
  }, [state.documentsById]);

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

  const restoreHistoricalRevision = useCallback(async (id: string, revisionId: string) => {
    const graph = await HistoryRestoreEngine.prepareRestore(revisionId);
    if (!graph) return;

    // Promote historical state to active manifest
    dispatch({
      type: 'UPDATE_DOCUMENT',
      id,
      updates: {
        manifest: {
          nodes: graph
        }
      }
    });

    // Capture the restore action as a new recovery point in history
    historyService.captureRevision(
      graph,
      'RECOVERY_POINT',
      `restore_${Date.now()}_${revisionId}`,
      `Restored Revision: ${revisionId}`
    );
  }, []);

  const captureStableSnapshot = useCallback(async (id: string) => {
    await flushPendingHash(id); // Ensure integrity before snapshot (Gate 9.0 requirement)
    const doc = state.documentsById[id];
    if (!doc) return;
    const hash = await IntegrityService.generateManifestHash(doc.manifest);
    dispatch({ type: 'CAPTURE_HASH', id, hash });

    // Phase 21.1: Capture as historical revision
    historyService.captureRevision(
      doc.manifest.nodes || [],
      'SNAPSHOT_SYNC',
      `sync_${Date.now()}_${hash.substring(0, 8)}`,
      'Structural Sync Point'
    );
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
      Object.values(currentDebounced).forEach((timer: NodeJS.Timeout) => {
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
    startTransaction,
    commitTransaction,
    abortTransaction,
    restoreHistoricalRevision,
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
    pushHistory,
    startTransaction,
    commitTransaction,
    abortTransaction
  ]);
};
