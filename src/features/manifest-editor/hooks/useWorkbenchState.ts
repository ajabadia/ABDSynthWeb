"use client";

import { useCallback, useMemo, useReducer } from "react";
import { 
  WorkbenchState, 
  WorkbenchPaneId, 
  WorkbenchLayoutMode, 
  WorkbenchTabViewState,
  OpenTabInput 
} from "../types/workbench";
import { workbenchReducer, createInitialState } from "./workbench/workbenchReducer";
import { useWorkbenchPersistence } from "./workbench/useWorkbenchPersistence";

// Re-export types for backward compatibility
export * from "../types/workbench";

/**
 * OMEGA ERA 7.2.3 - WORKBENCH STATE ORCHESTRATOR
 * Industrial state engine for multi-pane, multi-tab manifest authoring.
 */
export function useWorkbenchState() {
  const [state, dispatch] = useReducer(
    workbenchReducer,
    undefined,
    () => createInitialState()
  );

  // 1. Persistence & Hydration (Offloaded)
  useWorkbenchPersistence(state, dispatch);

  // 2. Action Dispatchers
  const actions = useMemo(
    () => ({
      openTab: (input: OpenTabInput) =>
        dispatch({ type: "OPEN_TAB", payload: input }),

      closeTab: (tabId: string) =>
        dispatch({ type: "CLOSE_TAB", payload: { tabId } }),

      focusTab: (paneId: WorkbenchPaneId, tabId: string) =>
        dispatch({ type: "FOCUS_TAB", payload: { paneId, tabId } }),

      reorderTabs: (paneId: WorkbenchPaneId, tabIds: string[]) =>
        dispatch({ type: "REORDER_TABS", payload: { paneId, tabIds } }),

      focusPane: (paneId: WorkbenchPaneId) =>
        dispatch({ type: "FOCUS_PANE", payload: { paneId } }),

      moveTabToPane: (tabId: string, targetPaneId: WorkbenchPaneId, index?: number) =>
        dispatch({
          type: "MOVE_TAB_TO_PANE",
          payload: { tabId, targetPaneId, index },
        }),

      setLayoutMode: (mode: WorkbenchLayoutMode) =>
        dispatch({ type: "SET_LAYOUT_MODE", payload: { mode } }),

      setLayoutRatio: (ratio: number) =>
        dispatch({ type: "SET_LAYOUT_RATIO", payload: { ratio } }),

      setSelectedNode: (nodeId: string | null) =>
        dispatch({ type: "SET_SELECTED_NODE", payload: { nodeId } }),

      setExpandedNodeIds: (nodeIds: string[]) =>
        dispatch({ type: "SET_EXPANDED_NODE_IDS", payload: { nodeIds } }),

      captureTabViewState: (tabId: string, viewState: Partial<WorkbenchTabViewState>) =>
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
        
      setActiveDiff: (diff: import("../types/diff").ManifestDiffResult | null) =>
        dispatch({ type: "SET_ACTIVE_DIFF", payload: { diff } }),
        
      setIsDiffModalOpen: (open: boolean) =>
        dispatch({ type: "TOGGLE_UI_STATE", payload: { key: 'isDiffModalOpen', value: open } }),
    }),
    []
);

  // 3. Derived State (Selectors)
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

  // 4. Legacy API & Flat Accessors (Backward Compatibility)
  return {
    state,
    actions,
    derived,
    getTabViewState,
    
    // Flat accessors for legacy compatibility
    selectionRef: state.selectedNodeId,
    showLogs: state.showLogs,
    isLiveMode: state.isLiveMode,
    showModGrid: state.showModGrid,
    helpState: state.helpState,
    mockupOpen: state.mockupOpen,
    isAuditModalOpen: state.isAuditModalOpen,
    isAboutModalOpen: state.isAboutModalOpen,
    isConfigModalOpen: state.isConfigModalOpen,
    isCellEditorOpen: state.isCellEditorOpen,
    isDiffModalOpen: state.isDiffModalOpen,
    activeDiff: state.activeDiff,
    uiTheme: state.uiTheme,
    pendingFiles: state.pendingFiles,
    
    // Setters (via actions)
    setUiTheme: actions.setUiTheme,
    setIsLiveMode: actions.setIsLiveMode,
    setHelpState: actions.setHelpState,
    toggleUIState: actions.toggleUIState,
    setPendingFiles: actions.setPendingFiles,
    setIsAuditModalOpen: () => actions.toggleUIState('isAuditModalOpen'),
    setIsDiffModalOpen: actions.setIsDiffModalOpen,
    setActiveDiff: actions.setActiveDiff,
  };
}
