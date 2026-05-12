'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

// UI Components
import Header from './layout/Header';
import WorkbenchFooter from './layout/WorkbenchFooter';
import WorkbenchLogs from './layout/WorkbenchLogs';
import EditorModals from './modals/EditorModals';
import ModulationGrid from './modulation/ModulationGrid';
import { HiddenFileHandlers } from './shared/HiddenFileHandlers';
import TemplateGallery from './gallery/TemplateGallery';
import { WorkbenchInspector } from './inspector/WorkbenchInspector';
import WorkbenchPane from './workspace/WorkbenchPane';
import { SplitDivider } from './workspace/SplitDivider';

// Hooks
import { useWorkbenchShortcuts } from '@/features/manifest-editor/hooks/useWorkbenchShortcuts';

// Types
import { ManifestEntity, ModuleTemplate, OMEGA_Manifest, OMEGA_Contract } from '@/omega-ui-core/types/manifest';
import { useManifestEditor } from '@/features/manifest-editor/hooks/useManifestEditor';
import { useViewport } from '@/features/manifest-editor/hooks/useViewport';
import { useAudit } from '@/features/manifest-editor/hooks/useAudit';
import { useWorkbenchState, WorkbenchTabType, WorkbenchPaneId } from '@/features/manifest-editor/hooks/useWorkbenchState';
import { useAuditNavigator } from '@/features/manifest-editor/hooks/useAuditNavigator';
import { useWatchdog } from '@/features/manifest-editor/hooks/useWatchdog';
import { adaptModuleTemplateToBlueprintDefinition } from '../utils/blueprintUtils';
import { useDynamicFonts } from '@/features/manifest-editor/hooks/useDynamicFonts';
import { TabDiagnostics, createEmptyDiagnostics, Diagnostic } from '../types/diagnostics';
import { mergeDiagnostics } from '../utils/diagnosticUtils';
import { structuralAuditor } from '../services/StructuralAuditor';
import { DocumentState } from '../types/document';

// Services
import { ContractService } from '@/services/contractService';

// --- Components ---

interface WorkbenchContainerProps {
  onOpenCellEditor?: () => void;
  onOpenAudit?: () => void;
  onOpenGovernance?: () => void;
  
  // External state overrides
  isAuditOpen?: boolean;
  setIsAuditOpen?: (open: boolean) => void;
  isGovernanceOpen?: boolean;
  setIsGovernanceOpen?: (open: boolean) => void;
  isCellEditorOpen?: boolean;
  setIsCellEditorOpen?: (open: boolean) => void;
  isCellLibraryOpen?: boolean;
  setIsCellLibraryOpen?: (open: boolean) => void;
}

export default function WorkbenchContainer({ 
  onOpenGovernance,
  setIsCellLibraryOpen: setIsCellLibraryOpenProp,
  isCellLibraryOpen: isCellLibraryOpenProp
}: WorkbenchContainerProps) {
  // 1. Core Data & Operations
  const editor = useManifestEditor();
  const { manifest, contract, updateManifest } = editor;

  // 2. Workspace State
  const { state, actions, derived } = useWorkbenchState();
  const { auditResult } = useAudit(manifest, contract);
  
  // 3. Diff & History Operations (Consolidated in useWorkbenchState)
  const handleCompareWithHistory = useCallback((index: number) => {
    const diff = editor.compareWithHistory(index);
    if (diff) {
      actions.setActiveDiff(diff);
      actions.setIsDiffModalOpen(true);
    }
  }, [editor, actions]);

  const activeTabId = state.panesById[state.focusedPaneId].activeTabId;
  const activeTab = activeTabId ? state.tabsById[activeTabId] : null;

  const currentTabViewState = activeTabId ? state.tabViewState[activeTabId] : undefined;
  
  const { zoom, pan, handleZoom, handlePan, handleResetViewport, handleFitViewport } = useViewport(currentTabViewState?.rackViewport);
  
  // Sync viewport changes back to tab state
  useEffect(() => {
    if (activeTabId && (activeTab?.type === 'rack' || activeTab?.type === 'orbital')) {
      const t = setTimeout(() => {
        actions.captureTabViewState(activeTabId, { rackViewport: { zoom, offsetX: pan.x, offsetY: pan.y } });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [zoom, pan.x, pan.y, activeTabId, activeTab?.type, actions]);
  
  // Sync Active Document with Focused Tab
  useEffect(() => {
    const docId = activeTab?.payload?.documentId as string;
    if (docId && docId !== editor.orchestrator.activeDocumentId) {
      editor.orchestrator.setActiveDocument(docId);
    }
  }, [activeTab?.payload?.documentId, editor.orchestrator.activeDocumentId, editor.orchestrator]);

  const isGalleryOpen = state.mockupOpen; 
  const setIsGalleryOpen = useCallback((open?: boolean) => {
    if (typeof open === 'boolean') {
      if (open !== state.mockupOpen) actions.toggleUIState('mockupOpen');
    } else {
      actions.toggleUIState('mockupOpen');
    }
  }, [state.mockupOpen, actions]);
  
  // 3. Diagnostics Surface (Phase 6.3 Aggregation)
  const [tabDiagnostics, setTabDiagnostics] = useState<Record<string, TabDiagnostics>>({});

  // Memoize Structural Diagnostics (Global)
  const structuralDiagnostics = useMemo(() => 
    structuralAuditor.extractDiagnostics(manifest as OMEGA_Manifest, { contract: contract as OMEGA_Contract }), 
    [manifest, contract]
  );

  const handleDiagnosticsUpdate = useCallback((tabId: string, diagnosticsRaw: unknown) => {
    const diagnostics = diagnosticsRaw as TabDiagnostics;
    setTabDiagnostics(prev => {
      const current = prev[tabId];
      if (current && 
          current.errorCount === diagnostics.errorCount && 
          current.warningCount === diagnostics.warningCount &&
          current.infoCount === diagnostics.infoCount) return prev;
      
      return { ...prev, [tabId]: diagnostics };
    });
  }, []);

  const handleApplyTemplate = useCallback((template: ModuleTemplate) => {
    try {
      const blueprint = adaptModuleTemplateToBlueprintDefinition(template);
      editor.applyTemplate(blueprint);
      setIsGalleryOpen(false);
    } catch (err) {
      console.error("[BLUEPRINT] Failed to adapt legacy template:", err);
    }
  }, [editor, setIsGalleryOpen]);
  
  const handleSelectItem = useCallback((id: string | null) => {
    actions.setSelectedNode(id);
  }, [actions]);

  const selectedItemId = state.selectedNodeId;

  const setActiveTab = useCallback((tabId: string) => {
    if (['orbital', 'rack', 'source'].includes(tabId)) {
      actions.focusTab('primary', `tab-${tabId}`);
    }
  }, [actions]);

  const gps = useAuditNavigator(manifest as OMEGA_Manifest, handleSelectItem, setActiveTab);
  const handleNavigateToIssue = gps.handleNavigateToIssue;
  
  // 3. Watchdog Integration (Hot-Reload)
  const handleWatchdogUpdate = useCallback((content: string) => {
    editor.handleBulkUpload([new File([content], 'auto-reload.acemm')]);
  }, [editor]);

  const watchdog = useWatchdog(handleWatchdogUpdate);
  useDynamicFonts(manifest as OMEGA_Manifest, editor.resolveAsset);
  
  // 5. Exit Guards
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const docs = editor.orchestrator.documentsById as Record<string, DocumentState>;
      const hasDirty = Object.values(docs).some(doc => doc.isDirty);
      if (hasDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor.orchestrator.documentsById]);

  // 6. Keyboard Shortcuts Modularized
  useWorkbenchShortcuts(editor, selectedItemId);

  // 7. Effects & Synchronization (Aseptic Sync)
  useEffect(() => {
    const m = manifest as OMEGA_Manifest;
    const manifestTab = m.ui?.layout?.activeTab;
    const currentTabType = activeTab?.type || 'rack';
    if (manifestTab !== currentTabType && ['rack', 'orbital'].includes(currentTabType)) {
      updateManifest({ 
        ui: { 
          ...m.ui, 
          layout: { 
            containers: m.ui?.layout?.containers || [],
            ...m.ui?.layout, 
            activeTab: currentTabType as WorkbenchTabType
          } 
        } 
      });
    }
  }, [activeTab?.type, manifest, updateManifest]);
  
  const handleAddEntity = useCallback((type: 'control' | 'jack') => {
    const id = editor.addEntity(type);
    if (id) handleSelectItem(id);
  }, [editor, handleSelectItem]);
  
  const handleDuplicateItem = useCallback((id: string) => {
    const newId = editor.duplicateItem(id);
    if (newId) handleSelectItem(newId);
  }, [editor, handleSelectItem]);
  
  const handleRemoveItem = useCallback((id: string) => {
    editor.removeItem(id);
    if (selectedItemId === id) handleSelectItem(null);
  }, [editor, selectedItemId, handleSelectItem]);
  
  const onDeploy = useCallback(async () => {
    if (await editor.handleDeploy() === 'AUDIT_FAIL') actions.toggleUIState('isAuditModalOpen');
  }, [editor, actions]);

  const onReset = useCallback(() => {
    editor.reset();
  }, [editor]);
  
  const handleExportContract = (format: 'ts' | 'cpp') => {
    ContractService.downloadContract(manifest as OMEGA_Manifest, format);
  };
  
  const triggerUpload = (id: string) => document.getElementById(id)?.click();

  const availableBinds = useMemo(() => {
    const c = contract as OMEGA_Contract | null;
    if (!c) return [];
    return [
      ...(c.parameters?.map((p: { id: string }) => p.id) || []),
      ...(c.ports?.map((p: { id: string }) => p.id) || [])
    ];
  }, [contract]);
  
  const [localIsCellLibraryOpen, setLocalIsCellLibraryOpen] = useState(false);
  const isCellLibraryOpen = isCellLibraryOpenProp ?? localIsCellLibraryOpen;
  const setIsCellLibraryOpen = setIsCellLibraryOpenProp ?? setLocalIsCellLibraryOpen;

  const handleAddFromLibrary = useCallback((dna: Record<string, unknown>) => {
    // Detect type based on dna
    const type: 'control' | 'jack' = dna.type === 'port' ? 'jack' : 'control';
    editor.addEntity(type, dna as unknown as Partial<ManifestEntity>);
  }, [editor]);

  const selectedItem = useMemo(() => 
    (selectedItemId ? editor.findItem(selectedItemId) : manifest) || null
  , [selectedItemId, editor, manifest]);

  const handleDragRatio = useCallback((delta: number) => {
    actions.setLayoutRatio(state.layout.ratio + delta);
  }, [actions, state.layout.ratio]);

  const handleDiagnosticClick = useCallback((tabId: string, diagRaw: unknown) => {
    const diag = diagRaw as Diagnostic;
    // 1. If it's a Monaco error, switch to source tab and highlight
    if (diag.source === 'Monaco' || diag.line) {
      actions.focusTab('primary', 'tab-source');
    } 
    // 2. If it's a structural error with an entityId, we could select the item
    else if (diag.entityId) {
      handleSelectItem(diag.entityId);
    }
  }, [actions, handleSelectItem]);

  const handleCaptureViewState = useCallback((tabId: string, viewState: unknown) => {
    actions.captureTabViewState(tabId, { editorViewState: viewState });
  }, [actions]);

  // 7. Render Helper
  const renderPane = (paneId: WorkbenchPaneId) => {
    const pane = state.panesById[paneId];
    const activeId = pane.activeTabId;
    
    const paneTabs = pane.tabIds.map(id => {
      const t = state.tabsById[id];
      const monacoDiags = tabDiagnostics[id] || createEmptyDiagnostics();
      const isManifestView = ['source', 'rack', 'orbital', 'inspector', 'uca-tree'].includes(t.type);
      const diagnostics = isManifestView ? mergeDiagnostics([monacoDiags, structuralDiagnostics]) : monacoDiags;
      const documentId = (t.payload?.documentId as string) || 'primary';
      const docs = editor.orchestrator.documentsById as Record<string, DocumentState>;
      const isDocumentDirty = docs[documentId]?.isDirty ?? false;

      return { ...t, isDirty: isDocumentDirty, diagnostics };
    });

    return (
      <WorkbenchPane 
        paneId={paneId}
        tabs={paneTabs}
        activeTabId={activeId}
        isFocused={state.focusedPaneId === paneId}
        onTabSelect={(tabId) => actions.focusTab(paneId, tabId)}
        onTabClose={(tabId) => {
          const t = state.tabsById[tabId];
          const isManifestView = ['source', 'rack', 'orbital', 'inspector', 'uca-tree'].includes(t.type);
          const documentId = (t.payload?.documentId as string) || 'primary';
          const docs = editor.orchestrator.documentsById as Record<string, DocumentState>;
          const isTabDirty = isManifestView && docs[documentId]?.isDirty;
          if (isTabDirty && !confirm(`Tab "${t.title}" has unsaved changes. Close anyway?`)) return;
          actions.closeTab(tabId);
        }}
        onPaneFocus={() => actions.focusPane(paneId)}
        onDiagnosticClick={handleDiagnosticClick}
        simulationBridge={editor.simulationBridge}
        manifest={manifest as OMEGA_Manifest}
        contract={contract as OMEGA_Contract | null}
        orchestrator={editor.orchestrator}
        activeId={editor.activeId}
        tabViewState={state.tabViewState}
        onCaptureViewState={handleCaptureViewState}
        onDiagnosticsUpdate={handleDiagnosticsUpdate}
        selectedItemId={selectedItemId}
        onSelectItem={handleSelectItem}
        updateItem={editor.updateItem}
        updateContainer={editor.updateContainer}
        auditResult={auditResult}
        resolveAsset={editor.resolveAsset}
        zoom={zoom}
        pan={pan}
        handleZoom={handleZoom}
        handlePan={handlePan}
        handleResetViewport={handleResetViewport}
        handleFitViewport={handleFitViewport}
        isLiveMode={state.isLiveMode}
        setIsLiveMode={() => actions.toggleUIState('isLiveMode')}
        onUndoTo={editor.undoTo}
        onCompareWithHistory={handleCompareWithHistory}
      />
    );
  };

  return (
    <div className="h-screen flex flex-col wb-bg wb-text font-sans overflow-hidden select-none relative transition-colors duration-500" data-ui-theme={state.uiTheme}>
      <HiddenFileHandlers onResourceUpload={editor.handleResourceUpload} setPendingFiles={actions.setPendingFiles} />
      
      <Header 
        onReset={onReset} 
        onUndo={editor.undo}
        onRedo={editor.redo}
        onExportManifest={editor.exportManifest} 
        onExportPack={editor.exportOmegaPack}
        onExportCAD={() => editor.exportCADBlueprint()} onExportContract={handleExportContract}
        onGenerateMockup={() => actions.toggleUIState('mockupOpen')} onDeploy={onDeploy}
        onToggleLogs={() => actions.toggleUIState('showLogs')} showLogs={state.showLogs}
        activeTabType={(activeTab?.type && ['orbital', 'rack', 'source', 'history'].includes(activeTab.type)) ? (activeTab.type as 'orbital' | 'rack' | 'source' | 'history') : 'rack'}
        onTabFocus={(type) => actions.openTab({ 
          id: `tab-${type}`,
          type: type as WorkbenchTabType, 
          title: type.charAt(0).toUpperCase() + type.slice(1) 
        })}
        uiTheme={state.uiTheme}
        setUiTheme={actions.setUiTheme}
        onHelp={() => actions.setHelpState(true)}
        audit={auditResult}
        onOpenAudit={() => actions.toggleUIState('isAuditModalOpen')}
        onTriggerUpload={triggerUpload}
        onOpenAbout={() => actions.toggleUIState('isAboutModalOpen')}
        onOpenConfig={() => actions.toggleUIState('isConfigModalOpen')}
        onOpenCellEditor={() => actions.toggleUIState('isCellEditorOpen')}
        onOpenGallery={() => setIsGalleryOpen(true)}
        isSplit={derived.isSplit}
        onToggleSplit={() => actions.setLayoutMode(derived.isSplit ? 'single' : 'vertical')}
      />

      {isGalleryOpen && (
        <TemplateGallery 
          onSelect={handleApplyTemplate}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      <main className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE: PANES */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* PRIMARY PANE */}
          <div 
            className="flex flex-col overflow-hidden" 
            style={{ width: derived.isSplit ? `${state.layout.ratio * 100}%` : '100%' }}
          >
            {renderPane('primary')}
          </div>

          {/* SPLIT DIVIDER */}
          {derived.isSplit && <SplitDivider onDrag={handleDragRatio} />}

          {/* SECONDARY PANE (SPLIT) */}
          {derived.isSplit && (
            <div className="flex-1 border-l wb-outline flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
              {renderPane('secondary')}
            </div>
          )}
        </div>

        {/* RIGHT WORKSPACE: DOCKED INSPECTOR */}
        <div className="w-[340px] flex-shrink-0 border-l wb-outline flex flex-col bg-black/10 overflow-hidden">
            <WorkbenchInspector 
              isLiveMode={state.isLiveMode} uiTheme={state.uiTheme}
              manifest={manifest as OMEGA_Manifest} selectedItem={selectedItem}
              selectedItemId={selectedItemId} highlightPath={gps.highlightPath}
              availableBinds={availableBinds} extraResources={editor.extraResources}
              audit={auditResult}
              onUpdateItem={editor.updateItem} onUpdateManifest={updateManifest}
              onSelectItem={handleSelectItem} onAddEntity={handleAddEntity}
              onDuplicateItem={handleDuplicateItem} onRemoveItem={handleRemoveItem}
              onAddModulation={editor.addModulation} onRemoveModulation={editor.removeModulation}
              onUpdateModulation={editor.updateModulation} onOpenModGrid={() => actions.toggleUIState('showModGrid')}
              addContainer={editor.addContainer} updateContainer={editor.updateContainer}
              removeContainer={editor.removeContainer} onHelp={(sectionId) => actions.setHelpState(true, sectionId)}
              onRemoveResource={editor.handleRemoveResource}
              resolveAsset={editor.resolveAsset}
              onTriggerUpload={triggerUpload}
              onOpenConfig={onOpenGovernance || (() => actions.toggleUIState('isConfigModalOpen'))}
              onOpenLibrary={() => setIsCellLibraryOpen(true)}
              onSelectBlueprint={editor.blueprintInjection.startInjection}
            />
        </div>

        {state.showModGrid && (
          <ModulationGrid 
            manifest={manifest as OMEGA_Manifest} onAdd={editor.addModulation} 
            onRemove={editor.removeModulation} onUpdate={editor.updateModulation} 
            onClose={() => actions.toggleUIState('showModGrid')} 
          />
        )}
      </main>

      <EditorModals 
        manifest={manifest as OMEGA_Manifest}
        pendingFiles={state.pendingFiles}
        setPendingFiles={(files) => actions.setPendingFiles(files || [])}
        handleBulkUpload={editor.handleBulkUpload}
        helpState={state.helpState}
        closeHelp={() => actions.setHelpState(false)}
        isAuditModalOpen={state.isAuditModalOpen}
        setIsAuditModalOpen={() => actions.toggleUIState('isAuditModalOpen')}
        isAboutModalOpen={state.isAboutModalOpen}
        setIsAboutModalOpen={() => actions.toggleUIState('isAboutModalOpen')}
        handleNavigateToIssue={handleNavigateToIssue}
        auditResult={auditResult}
        mockupOpen={state.mockupOpen}
        setMockupOpen={() => actions.toggleUIState('mockupOpen')}
        resolveAsset={editor.resolveAsset}
        onDeploy={onDeploy}
        isConfigModalOpen={state.isConfigModalOpen}
        setIsConfigModalOpen={() => actions.toggleUIState('isConfigModalOpen')}
        onUpdateManifest={updateManifest}
        isCellEditorOpen={state.isCellEditorOpen}
        setIsCellEditorOpen={() => actions.toggleUIState('isCellEditorOpen')}
        isCellLibraryOpen={isCellLibraryOpen}
        setIsCellLibraryOpen={setIsCellLibraryOpen}
        onAddEntityFromLibrary={handleAddFromLibrary}
        
        // Phase 9.2 Diff
        isDiffModalOpen={state.isDiffModalOpen}
        setIsDiffModalOpen={actions.setIsDiffModalOpen}
        activeDiff={state.activeDiff}
        onMergeEntries={editor.handleMergeEntries}
        blueprintInjection={editor.blueprintInjection}
      />

      <WorkbenchLogs showLogs={state.showLogs} setShowLogs={() => actions.toggleUIState('showLogs')} logs={editor.logs} />
      <WorkbenchFooter 
        watchdogStatus={watchdog.status}
        watchdogTime={watchdog.lastUpdate}
      />
    </div>
  );
}
