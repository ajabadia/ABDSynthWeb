'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

// UI Components
import Header from './layout/Header';
import WorkbenchFooter from './layout/WorkbenchFooter';
import WorkbenchLogs from './layout/WorkbenchLogs';
import EditorModals from './modals/EditorModals';
import ModulationGrid from './modulation/ModulationGrid';
import { HiddenFileHandlers } from './shared/HiddenFileHandlers';
import { WorkbenchViewport } from './viewport/WorkbenchViewport';
import { WorkbenchInspector } from './inspector/WorkbenchInspector';
import TemplateGallery from './gallery/TemplateGallery';
import MultiTabHeader from './layout/MultiTabHeader';
import { SourceView } from './views/SourceView';

// Types
import { ManifestEntity, ModuleTemplate } from '@/omega-ui-core/types/manifest';
import { useManifestEditor } from '@/features/manifest-editor/hooks/useManifestEditor';
import { useViewport } from '@/features/manifest-editor/hooks/useViewport';
import { useAudit } from '@/features/manifest-editor/hooks/useAudit';
import { useWorkbenchState, WorkbenchTabType } from '@/features/manifest-editor/hooks/useWorkbenchState';
import { useAuditNavigator } from '@/features/manifest-editor/hooks/useAuditNavigator';
import { useWatchdog } from '@/features/manifest-editor/hooks/useWatchdog';
import { useDynamicFonts } from '@/features/manifest-editor/hooks/useDynamicFonts';
import { TabDiagnostics, createEmptyDiagnostics, Diagnostic } from '../types/diagnostics';
import { mergeDiagnostics } from '../utils/diagnosticUtils';
import { structuralAuditor } from '../services/StructuralAuditor';

// Services
import { ContractService } from '@/services/contractService';

// --- Components ---

interface SplitDividerProps {
  onDrag: (delta: number) => void;
}

const SplitDivider = React.memo(({ onDrag }: SplitDividerProps) => {
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const totalWidth = window.innerWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      onDrag(delta / totalWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onDrag]);

  return (
    <div 
      onMouseDown={handleMouseDown}
      className="w-1 bg-white/5 hover:bg-primary/40 cursor-col-resize transition-colors duration-200 z-10"
    />
  );
});

SplitDivider.displayName = 'SplitDivider';

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
}

export default function WorkbenchContainer({ 
  onOpenCellEditor, 
  onOpenAudit, 
  onOpenGovernance,
  isAuditOpen,
  setIsAuditOpen,
  isGovernanceOpen,
  setIsGovernanceOpen,
  isCellEditorOpen,
  setIsCellEditorOpen
}: WorkbenchContainerProps) {
  // 1. Core Data & Operations
  const editor = useManifestEditor();
  const { manifest, contract, updateManifest } = editor;

  // 2. Workspace State
  const { state, actions, derived, ...uiLegacy } = useWorkbenchState();
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

  const { auditResult } = useAudit(manifest, contract);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  // 3. Diagnostics Surface (Phase 6.3 Aggregation)
  const [tabDiagnostics, setTabDiagnostics] = useState<Record<string, TabDiagnostics>>({});

  // Memoize Structural Diagnostics (Global)
  const structuralDiagnostics = useMemo(() => 
    structuralAuditor.extractDiagnostics(manifest, { contract }), 
    [manifest, contract]
  );

  const handleDiagnosticsUpdate = useCallback((tabId: string, diagnostics: TabDiagnostics) => {
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
    editor.applyTemplate(template);
    setIsGalleryOpen(false);
  }, [editor]);
  
  const handleSelectItem = useCallback((id: string | null) => {
    actions.setSelectedNode(id);
  }, [actions]);

  const selectedItemId = state.selectedNodeId;

  const setActiveTab = useCallback((tabId: string) => {
    // Basic compat mapping: if someone asks for 'orbital' etc, we open/focus the default tab
    if (['orbital', 'rack', 'source'].includes(tabId)) {
      actions.focusTab('primary', `tab-${tabId}`);
    }
  }, [actions]);

  const gps = useAuditNavigator(manifest, handleSelectItem, setActiveTab);
  
  // 3. Watchdog Integration (Hot-Reload)
  const handleWatchdogUpdate = useCallback((content: string) => {
    editor.handleBulkUpload([new File([content], 'auto-reload.acemm')]);
  }, [editor]);

  const watchdog = useWatchdog(handleWatchdogUpdate);
 
  // 4. Dynamic Typography Integration
  useDynamicFonts(manifest, editor.resolveAsset);
 
  // 5. Exit Guards (Phase 6.1 Polish & 7.0 Multi-Doc Ready)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasDirty = Object.values(editor.orchestrator.documentsById).some(doc => doc.isDirty);
      if (hasDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [editor.orchestrator.documentsById]);

  // 6. Keyboard Shortcuts (Phase 6.1 Polish)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        editor.addLog("[INPUT] Cmd+S detected. Triggering persistence...");
        editor.exportManifest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // 7. Effects & Synchronization (Aseptic Sync)
  useEffect(() => {
    const manifestTab = manifest.ui?.layout?.activeTab;
    const currentTabType = activeTab?.type || 'rack';
    if (manifestTab !== currentTabType && ['rack', 'orbital'].includes(currentTabType)) {
      updateManifest({ 
        ui: { 
          ...manifest.ui, 
          layout: { 
            containers: manifest.ui?.layout?.containers || [],
            ...manifest.ui?.layout, 
            activeTab: currentTabType as WorkbenchTabType
          } 
        } 
      });
    }
  }, [activeTab?.type, manifest.ui, updateManifest]);
 
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
    if (await editor.handleDeploy() === 'AUDIT_FAIL') uiLegacy.setIsAuditModalOpen();
  }, [editor, uiLegacy]);

  const onReset = useCallback(() => {
    editor.reset();
  }, [editor]);
 
  const handleExportContract = (format: 'ts' | 'cpp') => {
    ContractService.downloadContract(manifest, format);
  };
 
  const triggerUpload = (id: string) => document.getElementById(id)?.click();

  const availableBinds = useMemo(() => {
    if (!contract) return [];
    return [
      ...(contract.parameters?.map((p: { id: string }) => p.id) || []),
      ...(contract.ports?.map((p: { id: string }) => p.id) || [])
    ];
  }, [contract]);
 
  const [isCellLibraryOpen, setIsCellLibraryOpen] = useState(false);

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

  const handleSourceChange = useCallback((next: string) => {
    try {
      const updated = JSON.parse(next);
      updateManifest(updated);
    } catch {
      // Silent catch for invalid JSON during typing
    }
  }, [updateManifest]);

  const handleDiagnosticClick = useCallback((tabId: string, diag: Diagnostic) => {
    // 1. If it's a Monaco error, switch to source tab and highlight
    if (diag.source === 'Monaco' || diag.line) {
      actions.focusTab('primary', 'tab-source');
      // Monaco handles the highlight via its internal markers once we switch
    } 
    // 2. If it's a structural error with an entityId, we could select the item
    else if (diag.entityId) {
      handleSelectItem(diag.entityId);
    }
  }, [actions, handleSelectItem]);

  const handleCaptureViewState = useCallback((tabId: string, viewState: unknown) => {
    actions.captureTabViewState(tabId, { editorViewState: viewState });
  }, [actions]);

  // View Mapper
  const renderPaneContent = (paneId: 'primary' | 'secondary') => {
    const pane = state.panesById[paneId];
    const activeTabId = pane.activeTabId;
    const tab = activeTabId ? state.tabsById[activeTabId] : null;
    
    // Inject global dirty state and diagnostic badges for manifest-related views
    const paneTabs = pane.tabIds.map(id => {
      const t = state.tabsById[id];
      const monacoDiags = tabDiagnostics[id] || createEmptyDiagnostics();
      
      // Merge structural diagnostics with specific tab diagnostics
      // Structural diagnostics are global to the manifest, so they affect all manifest views
      const isManifestView = ['source', 'rack', 'orbital', 'inspector', 'uca-tree'].includes(t.type);
      const diagnostics = isManifestView 
        ? mergeDiagnostics([monacoDiags, structuralDiagnostics])
        : monacoDiags;
      
      const documentId = (t.payload?.documentId as string) || 'primary';
      const isDocumentDirty = (editor.orchestrator.documentsById as Record<string, { isDirty: boolean }>)[documentId]?.isDirty ?? false;

      if (isManifestView) {
        return { ...t, isDirty: isDocumentDirty, diagnostics };
      }
      return { ...t, diagnostics };
    });

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <MultiTabHeader 
          paneId={paneId}
          tabs={paneTabs}
          activeTabId={activeTabId}
          isFocused={state.focusedPaneId === paneId}
          onTabSelect={(tabId) => actions.focusTab(paneId, tabId)}
          onTabClose={(tabId) => {
            const t = state.tabsById[tabId];
            const isManifestView = ['source', 'rack', 'orbital', 'inspector', 'uca-tree'].includes(t.type);
            const documentId = (t.payload?.documentId as string) || 'primary';
            const isTabDirty = isManifestView && (editor.orchestrator.documentsById as Record<string, { isDirty: boolean }>)[documentId]?.isDirty;
            if (isTabDirty) {
              if (!confirm(`Tab "${t.title}" has unsaved changes. Close anyway?`)) return;
            }
            actions.closeTab(tabId);
          }}
          onPaneFocus={() => actions.focusPane(paneId)}
          onDiagnosticClick={handleDiagnosticClick}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {!tab && (
            <div className="flex-1 flex items-center justify-center bg-black/20">
              <span className="text-[10px] font-black wb-text-muted uppercase tracking-[0.2em] opacity-30">
                Empty Workspace Pane
              </span>
            </div>
          )}

          {tab?.type === 'orbital' && (
            <WorkbenchViewport 
              viewMode="orbital" manifest={manifest} contract={contract}
              selectedItemId={selectedItemId} onSelectItem={handleSelectItem}
              updateItem={editor.updateItem} updateManifest={updateManifest}
              updateContainer={editor.updateContainer} auditResult={auditResult}
              zoom={zoom} pan={pan} handleZoom={handleZoom} handlePan={handlePan}
              handleResetViewport={handleResetViewport} handleFitViewport={handleFitViewport}
              isLiveMode={uiLegacy.isLiveMode} setIsLiveMode={uiLegacy.setIsLiveMode}
              resolveAsset={editor.resolveAsset}
            />
          )}

          {tab?.type === 'rack' && (
            <WorkbenchViewport 
              viewMode="rack" manifest={manifest} contract={contract}
              selectedItemId={selectedItemId} onSelectItem={handleSelectItem}
              updateItem={editor.updateItem} updateManifest={updateManifest}
              updateContainer={editor.updateContainer} auditResult={auditResult}
              zoom={zoom} pan={pan} handleZoom={handleZoom} handlePan={handlePan}
              handleResetViewport={handleResetViewport} handleFitViewport={handleFitViewport}
              isLiveMode={uiLegacy.isLiveMode} setIsLiveMode={uiLegacy.setIsLiveMode}
              resolveAsset={editor.resolveAsset}
            />
          )}
          


          {tab?.type === 'source' && (
            <SourceView 
              tabId={tab.id}
              manifestId={manifest.id || 'default'}
              value={JSON.stringify(manifest, null, 2)}
              language="json"
              editorViewState={state.tabViewState[tab.id]?.editorViewState}
              onChange={handleSourceChange}
              onCaptureViewState={(viewState) => handleCaptureViewState(tab.id, viewState)}
              onDiagnosticsUpdate={(diagnostics) => handleDiagnosticsUpdate(tab.id, diagnostics)}
              selectedItemId={selectedItemId}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col wb-bg wb-text font-sans overflow-hidden select-none relative transition-colors duration-500" data-ui-theme={uiLegacy.uiTheme}>
      <HiddenFileHandlers onResourceUpload={editor.handleResourceUpload} setPendingFiles={uiLegacy.setPendingFiles} />
      
      <Header 
        onReset={onReset} onExportManifest={editor.exportManifest} onExportPack={editor.exportOmegaPack}
        onExportCAD={() => editor.exportCADBlueprint()} onExportContract={handleExportContract}
        onGenerateMockup={() => uiLegacy.toggleUIState('mockupOpen')} onDeploy={onDeploy}
        onToggleLogs={() => uiLegacy.toggleUIState('showLogs')} showLogs={uiLegacy.showLogs}
        activeTabType={(activeTab?.type as 'orbital' | 'rack' | 'source') || 'rack'} 
        onTabFocus={(v) => actions.focusTab(state.focusedPaneId, `tab-${v}`)} 
        onHelp={() => uiLegacy.setHelpState(true)}
        uiTheme={uiLegacy.uiTheme} setUiTheme={uiLegacy.setUiTheme} audit={auditResult}
        onOpenAudit={onOpenAudit || (() => uiLegacy.toggleUIState('isAuditModalOpen'))}
        onTriggerUpload={triggerUpload}
        onOpenAbout={() => uiLegacy.toggleUIState('isAboutModalOpen')}
        onOpenConfig={onOpenGovernance || (() => uiLegacy.toggleUIState('isConfigModalOpen'))}
        onOpenCellEditor={onOpenCellEditor}
        onOpenGallery={() => setIsGalleryOpen(true)}
        isSplit={derived.isSplit}
        onToggleSplit={() => {
          const nextMode = derived.isSplit ? 'single' : 'vertical';
          actions.setLayoutMode(nextMode);
          
          // If opening split, let's open Rack or Orbital by default if secondary is empty
          if (nextMode === 'vertical' && state.panesById.secondary.tabIds.length === 0) {
            actions.openTab({
              id: `tab-rack-${Math.random().toString(36).slice(2, 6)}`,
              type: 'rack',
              title: 'Rack View',
              targetPaneId: 'secondary',
              payload: { documentId: 'primary' }
            });
          }
        }}
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
            {renderPaneContent('primary')}
          </div>

          {/* SPLIT DIVIDER */}
          {derived.isSplit && <SplitDivider onDrag={handleDragRatio} />}

          {/* SECONDARY PANE (SPLIT) */}
          {derived.isSplit && (
            <div className="flex-1 border-l wb-outline flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
              {renderPaneContent('secondary')}
            </div>
          )}
        </div>

        {/* RIGHT WORKSPACE: DOCKED INSPECTOR */}
        <div className="w-[340px] flex-shrink-0 border-l wb-outline flex flex-col bg-black/10 overflow-hidden">
            <WorkbenchInspector 
              isLiveMode={uiLegacy.isLiveMode} uiTheme={uiLegacy.uiTheme}
              manifest={manifest} selectedItem={selectedItem}
              selectedItemId={selectedItemId} highlightPath={gps.highlightPath}
              availableBinds={availableBinds} extraResources={editor.extraResources}
              audit={auditResult}
              onUpdateItem={editor.updateItem} onUpdateManifest={updateManifest}
              onSelectItem={handleSelectItem} onAddEntity={handleAddEntity}
              onDuplicateItem={handleDuplicateItem} onRemoveItem={handleRemoveItem}
              onAddModulation={editor.addModulation} onRemoveModulation={editor.removeModulation}
              onUpdateModulation={editor.updateModulation} onOpenModGrid={() => uiLegacy.toggleUIState('showModGrid')}
              addContainer={editor.addContainer} updateContainer={editor.updateContainer}
              removeContainer={editor.removeContainer} onHelp={(sectionId) => uiLegacy.setHelpState(true, sectionId)}
              onRemoveResource={editor.handleRemoveResource}
              resolveAsset={editor.resolveAsset}
              onTriggerUpload={triggerUpload}
              onOpenConfig={onOpenGovernance || (() => uiLegacy.toggleUIState('isConfigModalOpen'))}
              onOpenLibrary={() => setIsCellLibraryOpen(true)}
            />
        </div>

        {state.showModGrid && (
          <ModulationGrid 
            manifest={manifest} onAdd={editor.addModulation} 
            onRemove={editor.removeModulation} onUpdate={editor.updateModulation} 
            onClose={() => uiLegacy.toggleUIState('showModGrid')} 
          />
        )}
      </main>

      <EditorModals 
        manifest={manifest} pendingFiles={uiLegacy.pendingFiles} setPendingFiles={(files) => uiLegacy.setPendingFiles(files || [])} handleBulkUpload={editor.handleBulkUpload}
        helpState={uiLegacy.helpState} closeHelp={() => uiLegacy.setHelpState(false)} 
        isAuditModalOpen={isAuditOpen !== undefined ? isAuditOpen : uiLegacy.isAuditModalOpen} 
        setIsAuditModalOpen={setIsAuditOpen || (() => actions.toggleUIState('isAuditModalOpen'))}
        isAboutModalOpen={uiLegacy.isAboutModalOpen} setIsAboutModalOpen={() => actions.toggleUIState('isAboutModalOpen')}
        handleNavigateToIssue={gps.handleNavigateToIssue}
        auditResult={auditResult}
        mockupOpen={uiLegacy.mockupOpen} setMockupOpen={() => actions.toggleUIState('mockupOpen')}
        resolveAsset={editor.resolveAsset}
        onDeploy={() => editor.exportOmegaPack()}
        isConfigModalOpen={isGovernanceOpen !== undefined ? isGovernanceOpen : uiLegacy.isConfigModalOpen}
        setIsConfigModalOpen={setIsGovernanceOpen || (() => actions.toggleUIState('isConfigModalOpen'))}
        onUpdateManifest={updateManifest}
        isCellEditorOpen={isCellEditorOpen !== undefined ? isCellEditorOpen : uiLegacy.isCellEditorOpen}
        setIsCellEditorOpen={setIsCellEditorOpen || (() => actions.toggleUIState('isCellEditorOpen'))}
        isCellLibraryOpen={isCellLibraryOpen}
        setIsCellLibraryOpen={setIsCellLibraryOpen}
        onAddEntityFromLibrary={handleAddFromLibrary}
      />

      <WorkbenchLogs showLogs={uiLegacy.showLogs} setShowLogs={() => actions.toggleUIState('showLogs')} logs={editor.logs} />
      <WorkbenchFooter 
        watchdogStatus={watchdog.status}
        watchdogTime={watchdog.lastUpdate}
      />
    </div>
  );
}
