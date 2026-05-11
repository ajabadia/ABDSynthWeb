"use client";

import { useCallback, useMemo, useReducer, useEffect } from "react";
import { LucideIcon } from "lucide-react";

export type WorkbenchTabType =
  | "orbital"
  | "rack"
  | "source"
  | "uca-tree"
  | "inspector";

export type WorkbenchPaneId = "primary" | "secondary";
export type WorkbenchLayoutMode = "single" | "vertical";

import { TabDiagnostics } from "../types/diagnostics";

export interface WorkbenchTab {
  id: string;
  type: WorkbenchTabType;
  title: string;
  icon?: string | LucideIcon;
  closable?: boolean;
  persistent?: boolean;
  payload?: Record<string, unknown>;
  isDirty?: boolean;
  diagnostics?: TabDiagnostics;
}

export interface WorkbenchPane {
  id: WorkbenchPaneId;
  tabIds: string[];
  activeTabId: string | null;
}

export interface WorkbenchLayout {
  mode: WorkbenchLayoutMode;
  ratio: number;
}

export interface RackViewportState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface WorkbenchTabViewState {
  inspectorScrollTop?: number;
  treeScrollTop?: number;
  editorViewState?: unknown; // For Monaco editor view state persistence
  rackViewport?: RackViewportState;
}

export interface WorkbenchState {
  tabsById: Record<string, WorkbenchTab>;
  panesById: Record<WorkbenchPaneId, WorkbenchPane>;
  focusedPaneId: WorkbenchPaneId;
  layout: WorkbenchLayout;
  selectedNodeId: string | null;
  expandedNodeIds: string[];
  tabViewState: Record<string, WorkbenchTabViewState>;
  
  // Legacy UI States (to be refactored later)
  showLogs: boolean;
  isLiveMode: boolean;
  showModGrid: boolean;
  helpState: { isOpen: boolean; sectionId?: string };
  mockupOpen: boolean;
  isAuditModalOpen: boolean;
  isAboutModalOpen: boolean;
  isConfigModalOpen: boolean;
  isCellEditorOpen: boolean;
  uiTheme: "dark" | "light";
  pendingFiles: File[];
}

type OpenTabInput = Omit<WorkbenchTab, "id"> & {
  id?: string;
  targetPaneId?: WorkbenchPaneId;
};

type WorkbenchAction =
  | { type: "OPEN_TAB"; payload: OpenTabInput }
  | { type: "CLOSE_TAB"; payload: { tabId: string } }
  | { type: "FOCUS_TAB"; payload: { paneId: WorkbenchPaneId; tabId: string } }
  | { type: "FOCUS_PANE"; payload: { paneId: WorkbenchPaneId } }
  | { type: "MOVE_TAB_TO_PANE"; payload: { tabId: string; targetPaneId: WorkbenchPaneId; index?: number } }
  | { type: "SET_LAYOUT_MODE"; payload: { mode: WorkbenchLayoutMode } }
  | { type: "SET_LAYOUT_RATIO"; payload: { ratio: number } }
  | { type: "SET_SELECTED_NODE"; payload: { nodeId: string | null } }
  | { type: "SET_EXPANDED_NODE_IDS"; payload: { nodeIds: string[] } }
  | { type: "CAPTURE_TAB_VIEW_STATE"; payload: { tabId: string; viewState: Partial<WorkbenchTabViewState> } }
  | { type: "TOGGLE_UI_STATE"; payload: { key: keyof Pick<WorkbenchState, 'showLogs' | 'isLiveMode' | 'showModGrid' | 'mockupOpen' | 'isAuditModalOpen' | 'isAboutModalOpen' | 'isConfigModalOpen' | 'isCellEditorOpen'> } }
  | { type: "SET_HELP_STATE"; payload: { isOpen: boolean; sectionId?: string } }
  | { type: "SET_UI_THEME"; payload: { theme: "light" | "dark" } }
  | { type: "SET_PENDING_FILES"; payload: { files: File[] } }
  | { type: "HYDRATE_WORKBENCH"; payload: { state: Partial<WorkbenchState> } };

const DEFAULT_TABS: WorkbenchTab[] = [
  { id: "tab-orbital", type: "orbital", title: "Orbital", persistent: true, closable: false, payload: { documentId: 'primary' } },
  { id: "tab-rack", type: "rack", title: "Rack", persistent: true, closable: false, payload: { documentId: 'primary' } },
  { id: "tab-source", type: "source", title: "Source", persistent: true, closable: false, payload: { documentId: 'primary' } },
];

const createInitialState = (): WorkbenchState => {
  const baseState: WorkbenchState = {
    tabsById: Object.fromEntries(DEFAULT_TABS.map((tab) => [tab.id, tab])),
    panesById: {
      primary: {
        id: "primary",
        tabIds: DEFAULT_TABS.map((tab) => tab.id),
        activeTabId: "tab-rack",
      },
      secondary: {
        id: "secondary",
        tabIds: [],
        activeTabId: null,
      },
    },
    focusedPaneId: "primary",
    layout: { mode: "single", ratio: 0.62 },
    selectedNodeId: null,
    expandedNodeIds: [],
    tabViewState: {},
    showLogs: false,
    isLiveMode: false,
    showModGrid: false,
    helpState: { isOpen: false },
    mockupOpen: false,
    isAuditModalOpen: false,
    isAboutModalOpen: false,
    isConfigModalOpen: false,
    isCellEditorOpen: false,
    uiTheme: "dark",
    pendingFiles: [],
  };

  return baseState;
};

const clampRatio = (ratio: number) => Math.min(0.8, Math.max(0.2, ratio));

const findPaneContainingTab = (
  panesById: WorkbenchState["panesById"],
  tabId: string
): WorkbenchPaneId | null => {
  if (panesById.primary.tabIds.includes(tabId)) return "primary";
  if (panesById.secondary.tabIds.includes(tabId)) return "secondary";
  return null;
};

const ensureActiveTab = (pane: WorkbenchPane): WorkbenchPane => {
  if (pane.activeTabId && pane.tabIds.includes(pane.activeTabId)) return pane;
  return {
    ...pane,
    activeTabId: pane.tabIds[0] ?? null,
  };
};

const insertAt = (items: string[], value: string, index?: number) => {
  const next = items.filter((item) => item !== value);
  if (index == null || index < 0 || index > next.length) return [...next, value];
  return [...next.slice(0, index), value, ...next.slice(index)];
};

function workbenchReducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  switch (action.type) {
    case "OPEN_TAB": {
      const paneId = action.payload.targetPaneId ?? state.focusedPaneId;
      const tabId =
        action.payload.id ??
        `${action.payload.type}-${Math.random().toString(36).slice(2, 10)}`;

      if (state.tabsById[tabId]) {
        const pane = state.panesById[paneId];
        return {
          ...state,
          focusedPaneId: paneId,
          panesById: {
            ...state.panesById,
            [paneId]: ensureActiveTab({
              ...pane,
              tabIds: pane.tabIds.includes(tabId) ? pane.tabIds : [...pane.tabIds, tabId],
              activeTabId: tabId,
            }),
          },
        };
      }

      const nextTab: WorkbenchTab = {
        id: tabId,
        type: action.payload.type,
        title: action.payload.title,
        closable: action.payload.closable ?? true,
        persistent: action.payload.persistent ?? false,
        payload: action.payload.payload,
      };

      const nextPane = ensureActiveTab({
        ...state.panesById[paneId],
        tabIds: [...state.panesById[paneId].tabIds, tabId],
        activeTabId: tabId,
      });

      return {
        ...state,
        tabsById: {
          ...state.tabsById,
          [tabId]: nextTab,
        },
        panesById: {
          ...state.panesById,
          [paneId]: nextPane,
        },
        focusedPaneId: paneId,
      };
    }

    case "CLOSE_TAB": {
      const { tabId } = action.payload;
      const tab = state.tabsById[tabId];
      if (!tab || tab.persistent || tab.closable === false) return state;

      const sourcePaneId = findPaneContainingTab(state.panesById, tabId);
      if (!sourcePaneId) return state;

      const sourcePane = state.panesById[sourcePaneId];
      const nextSourcePane = ensureActiveTab({
        ...sourcePane,
        tabIds: sourcePane.tabIds.filter((id) => id !== tabId),
        activeTabId: sourcePane.activeTabId === tabId ? null : sourcePane.activeTabId,
      });

      const nextTabsById = { ...state.tabsById };
      delete nextTabsById[tabId];

      const nextViewState = { ...state.tabViewState };
      delete nextViewState[tabId];

      return {
        ...state,
        tabsById: nextTabsById,
        panesById: {
          ...state.panesById,
          [sourcePaneId]: nextSourcePane,
        },
        tabViewState: nextViewState,
      };
    }

    case "FOCUS_TAB": {
      const { paneId, tabId } = action.payload;
      if (!state.panesById[paneId].tabIds.includes(tabId)) return state;

      return {
        ...state,
        focusedPaneId: paneId,
        panesById: {
          ...state.panesById,
          [paneId]: {
            ...state.panesById[paneId],
            activeTabId: tabId,
          },
        },
      };
    }

    case "FOCUS_PANE":
      return {
        ...state,
        focusedPaneId: action.payload.paneId,
      };

    case "MOVE_TAB_TO_PANE": {
      const { tabId, targetPaneId, index } = action.payload;
      const sourcePaneId = findPaneContainingTab(state.panesById, tabId);
      if (!sourcePaneId) return state;
      if (sourcePaneId === targetPaneId) {
        const samePane = state.panesById[targetPaneId];
        return {
          ...state,
          panesById: {
            ...state.panesById,
            [targetPaneId]: {
              ...samePane,
              tabIds: insertAt(samePane.tabIds, tabId, index),
              activeTabId: tabId,
            },
          },
          focusedPaneId: targetPaneId,
        };
      }

      const sourcePane = ensureActiveTab({
        ...state.panesById[sourcePaneId],
        tabIds: state.panesById[sourcePaneId].tabIds.filter((id) => id !== tabId),
        activeTabId:
          state.panesById[sourcePaneId].activeTabId === tabId
            ? null
            : state.panesById[sourcePaneId].activeTabId,
      });

      const targetPane = ensureActiveTab({
        ...state.panesById[targetPaneId],
        tabIds: insertAt(state.panesById[targetPaneId].tabIds, tabId, index),
        activeTabId: tabId,
      });

      return {
        ...state,
        panesById: {
          ...state.panesById,
          [sourcePaneId]: sourcePane,
          [targetPaneId]: targetPane,
        },
        focusedPaneId: targetPaneId,
        layout:
          state.layout.mode === "single"
            ? { ...state.layout, mode: "vertical" }
            : state.layout,
      };
    }

    case "SET_LAYOUT_MODE":
      return {
        ...state,
        layout: {
          ...state.layout,
          mode: action.payload.mode,
        },
      };

    case "SET_LAYOUT_RATIO":
      return {
        ...state,
        layout: {
          ...state.layout,
          ratio: clampRatio(action.payload.ratio),
        },
      };

    case "SET_SELECTED_NODE":
      return {
        ...state,
        selectedNodeId: action.payload.nodeId,
      };

    case "SET_EXPANDED_NODE_IDS":
      return {
        ...state,
        expandedNodeIds: action.payload.nodeIds,
      };

    case "CAPTURE_TAB_VIEW_STATE": {
      const { tabId, viewState } = action.payload;
      return {
        ...state,
        tabViewState: {
          ...state.tabViewState,
          [tabId]: {
            ...state.tabViewState[tabId],
            ...viewState,
          },
        },
      };
    }



    case "TOGGLE_UI_STATE": {
      return {
        ...state,
        [action.payload.key]: !state[action.payload.key]
      };
    }

    case "SET_HELP_STATE": {
      return {
        ...state,
        helpState: { isOpen: action.payload.isOpen, sectionId: action.payload.sectionId }
      };
    }
    case "SET_UI_THEME":
      return { ...state, uiTheme: action.payload.theme };
    case "SET_PENDING_FILES":
      return { ...state, pendingFiles: action.payload.files };
    case "HYDRATE_WORKBENCH":
      return { ...state, ...action.payload.state };

    default:
      return state;
  }
}

export function useWorkbenchState() {
  const [state, dispatch] = useReducer(
    workbenchReducer,
    undefined,
    () => createInitialState()
  );

  // Client-Side Hydration (Fix for Hydration Mismatch)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("omega_workbench_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ 
          type: "HYDRATE_WORKBENCH", 
          payload: { 
            state: {
              ...parsed,
              // Merge tabs to ensure default tabs are always present if missing
              tabsById: { ...createInitialState().tabsById, ...parsed.tabsById }
            }
          } 
        });
      }
    } catch (err) {
      console.warn("[OMEGA WORKBENCH] Session restore failed:", err);
    }
  }, []);

  // Persistence Layer: Industrial Sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = {
        tabsById: state.tabsById,
        panesById: state.panesById,
        focusedPaneId: state.focusedPaneId,
        layout: state.layout,
        tabViewState: state.tabViewState
      };
      window.localStorage.setItem("omega_workbench_session", JSON.stringify(data));
    }
  }, [state.tabsById, state.panesById, state.focusedPaneId, state.layout, state.tabViewState]);

  const actions = useMemo(
    () => ({
      openTab: (input: OpenTabInput) =>
        dispatch({ type: "OPEN_TAB", payload: input }),

      closeTab: (tabId: string) =>
        dispatch({ type: "CLOSE_TAB", payload: { tabId } }),

      focusTab: (paneId: WorkbenchPaneId, tabId: string) =>
        dispatch({ type: "FOCUS_TAB", payload: { paneId, tabId } }),

      focusPane: (paneId: WorkbenchPaneId) =>
        dispatch({ type: "FOCUS_PANE", payload: { paneId } }),

      moveTabToPane: (
        tabId: string,
        targetPaneId: WorkbenchPaneId,
        index?: number
      ) =>
        dispatch({
          type: "MOVE_TAB_TO_PANE",
          payload: { tabId, targetPaneId, index },
        }),

      setLayoutMode: (mode: WorkbenchLayoutMode) => {
        dispatch({ type: "SET_LAYOUT_MODE", payload: { mode } });
      },

      setLayoutRatio: (ratio: number) => {
        dispatch({ type: "SET_LAYOUT_RATIO", payload: { ratio } });
      },

      setSelectedNode: (nodeId: string | null) =>
        dispatch({ type: "SET_SELECTED_NODE", payload: { nodeId } }),

      setExpandedNodeIds: (nodeIds: string[]) =>
        dispatch({ type: "SET_EXPANDED_NODE_IDS", payload: { nodeIds } }),

      captureTabViewState: (
        tabId: string,
        viewState: Partial<WorkbenchTabViewState>
      ) =>
        dispatch({
          type: "CAPTURE_TAB_VIEW_STATE",
          payload: { tabId, viewState },
        }),

      toggleUIState: (key: keyof Pick<WorkbenchState, 'showLogs' | 'isLiveMode' | 'showModGrid' | 'mockupOpen' | 'isAuditModalOpen' | 'isAboutModalOpen' | 'isConfigModalOpen' | 'isCellEditorOpen'>) =>
        dispatch({ type: "TOGGLE_UI_STATE", payload: { key } }),

      setHelpState: (isOpen: boolean, sectionId?: string) =>
        dispatch({ type: "SET_HELP_STATE", payload: { isOpen, sectionId } }),
        

      setUiTheme: (theme: "dark" | "light") =>
        dispatch({ type: "SET_UI_THEME", payload: { theme } }),
      setPendingFiles: (files: File[]) =>
        dispatch({ type: "SET_PENDING_FILES", payload: { files } }),
      setIsLiveMode: () =>
        dispatch({ type: "TOGGLE_UI_STATE", payload: { key: 'isLiveMode' } }),
    }),
    []
  );

  const derived = useMemo(() => {
    const primaryActiveTabId = state.panesById.primary.activeTabId;
    const secondaryActiveTabId = state.panesById.secondary.activeTabId;

    return {
      primaryActiveTab: primaryActiveTabId ? state.tabsById[primaryActiveTabId] : null,
      secondaryActiveTab: secondaryActiveTabId ? state.tabsById[secondaryActiveTabId] : null,
      focusedTabId: state.panesById[state.focusedPaneId].activeTabId,
      isSplit: state.layout.mode !== "single"
    };
  }, [state]);

  const getTabViewState = useCallback(
    (tabId: string) => state.tabViewState[tabId] ?? null,
    [state.tabViewState]
  );

  return {
    state,
    actions,
    derived,
    getTabViewState,
    // Flat accessors for legacy compatibility
    selectionRef: state.selectedNodeId, // Mapping selectedNodeId to selectionRef for compatibility
    showLogs: state.showLogs,
    isLiveMode: state.isLiveMode,
    showModGrid: state.showModGrid,
    helpState: state.helpState,
    mockupOpen: state.mockupOpen,
    isAuditModalOpen: state.isAuditModalOpen,
    isAboutModalOpen: state.isAboutModalOpen,
    isConfigModalOpen: state.isConfigModalOpen,
    isCellEditorOpen: state.isCellEditorOpen,
    uiTheme: state.uiTheme,
    pendingFiles: state.pendingFiles,
    
    // Setters (via actions)
    setUiTheme: actions.setUiTheme,
    setIsLiveMode: actions.setIsLiveMode,
    setHelpState: actions.setHelpState,
    toggleUIState: actions.toggleUIState,
    setPendingFiles: actions.setPendingFiles,
    setIsAuditModalOpen: () => actions.toggleUIState('isAuditModalOpen'),
  };
}
