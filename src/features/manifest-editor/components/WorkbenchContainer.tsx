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

// Types
import { ManifestEntity, ModuleTemplate } from '@/omega-ui-core/types/manifest';
import { useManifestEditor } from '@/features/manifest-editor/hooks/useManifestEditor';
import { useViewport } from '@/features/manifest-editor/hooks/useViewport';
import { useAudit } from '@/features/manifest-editor/hooks/useAudit';
import { useWorkbenchState } from '@/features/manifest-editor/hooks/useWorkbenchState';
import { useAuditNavigator } from '@/features/manifest-editor/hooks/useAuditNavigator';
import { useWatchdog } from '@/features/manifest-editor/hooks/useWatchdog';
import { useDynamicFonts } from '@/features/manifest-editor/hooks/useDynamicFonts';

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
  const { zoom, pan, handleZoom, handlePan, handleResetViewport, handleFitViewport } = useViewport();
  const { auditResult } = useAudit(manifest, contract);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  
  const handleApplyTemplate = useCallback((template: ModuleTemplate) => {
    editor.applyTemplate(template);
    setIsGalleryOpen(false);
  }, [editor]);
  
  const handleSelectItem = useCallback((id: string | null) => {
    actions.setSelectedNode(id);
  }, [actions]);

  const selectedItemId = state.selectedNodeId;
  const activeTab = uiLegacy.activeTab;
  const setActiveTab = uiLegacy.setActiveTab;

  const gps = useAuditNavigator(manifest, handleSelectItem, setActiveTab);
  
  // 3. Watchdog Integration (Hot-Reload)
  const watchdog = useWatchdog((content) => {
    editor.handleBulkUpload([new File([content], 'auto-reload.acemm')]);
  });
 
  // 4. Dynamic Typography Integration
  useDynamicFonts(manifest, editor.resolveAsset);
 
  // 5. Effects & Synchronization (Aseptic Sync)
  useEffect(() => {
    const manifestTab = manifest.ui?.layout?.activeTab;
    if (manifestTab !== activeTab) {
      updateManifest({ 
        ui: { 
          ...manifest.ui, 
          layout: { 
            containers: manifest.ui?.layout?.containers || [],
            ...manifest.ui?.layout, 
            activeTab: activeTab
          } 
        } 
      });
    }
  }, [activeTab, manifest.ui, updateManifest]);
 
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

  // View Mapper
  const renderPaneContent = (paneId: 'primary' | 'secondary') => {
    const pane = state.panesById[paneId];
    const activeTabId = pane.activeTabId;
    const tab = activeTabId ? state.tabsById[activeTabId] : null;
    const paneTabs = pane.tabIds.map(id => state.tabsById[id]);

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <MultiTabHeader 
          paneId={paneId}
          tabs={paneTabs}
          activeTabId={activeTabId}
          isFocused={state.focusedPaneId === paneId}
          onTabSelect={(tabId) => actions.focusTab(paneId, tabId)}
          onTabClose={(tabId) => actions.closeTab(tabId)}
          onPaneFocus={() => actions.focusPane(paneId)}
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
              activeTab={uiLegacy.activeTab} setActiveTab={uiLegacy.setActiveTab}
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
              activeTab={uiLegacy.activeTab} setActiveTab={uiLegacy.setActiveTab}
              resolveAsset={editor.resolveAsset}
            />
          )}
          
          {(tab?.type === 'inspector' || tab?.type === 'uca-tree') && (
            <WorkbenchInspector 
              isVisible={true}
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
              activeTab={uiLegacy.activeTab}
              onOpenConfig={onOpenGovernance || (() => uiLegacy.toggleUIState('isConfigModalOpen'))}
              onOpenLibrary={() => setIsCellLibraryOpen(true)}
            />
          )}

          {tab?.type === 'source' && (
            <div className="flex-1 bg-black/40 flex items-center justify-center">
              <span className="text-10px font-mono opacity-20 uppercase tracking-widest">
                [ Source Editor Integration Pending ]
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col wb-bg wb-text font-sans overflow-hidden select-none relative transition-colors duration-500" data-ui-theme={uiLegacy.uiTheme}>
      <HiddenFileHandlers onResourceUpload={editor.handleResourceUpload} setPendingFiles={uiLegacy.setPendingFiles} />
      
      <Header 
        onReset={editor.reset} onExportManifest={editor.exportManifest} onExportPack={editor.exportOmegaPack}
        onExportCAD={() => editor.exportCADBlueprint()} onExportContract={handleExportContract}
        onGenerateMockup={() => uiLegacy.toggleUIState('mockupOpen')} onDeploy={onDeploy}
        onToggleLogs={() => uiLegacy.toggleUIState('showLogs')} showLogs={uiLegacy.showLogs}
        viewMode={derived.viewModeCompat as 'orbital' | 'rack' | 'source'} setViewMode={actions.setViewMode} onHelp={() => uiLegacy.setHelpState(true)}
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
          
          // Smart Docking: If opening split and secondary is empty, open inspector there
          if (nextMode === 'vertical' && state.panesById.secondary.tabIds.length === 0) {
            actions.openTab({
              id: 'tab-inspector-secondary',
              type: 'inspector',
              title: 'Inspector',
              targetPaneId: 'secondary'
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
