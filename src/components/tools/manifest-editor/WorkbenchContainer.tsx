'use client';

import { useCallback, useEffect, useMemo } from 'react';

// UI Components
import Header from './layout/Header';
import WorkbenchFooter from './layout/WorkbenchFooter';
import WorkbenchLogs from './layout/WorkbenchLogs';
import EditorModals from './modals/EditorModals';
import ModulationGrid from './modulation/ModulationGrid';
import { HiddenFileHandlers } from './shared/HiddenFileHandlers';
import { WorkbenchSidebar } from './layout/WorkbenchSidebar';
import { WorkbenchViewport } from './viewport/WorkbenchViewport';
import { WorkbenchInspector } from './inspector/WorkbenchInspector';

// Hooks
import { useManifestEditor } from '@/hooks/useManifestEditor';
import { useViewport } from '@/hooks/manifest-editor/useViewport';
import { useAudit } from '@/hooks/manifest-editor/useAudit';
import { useWorkbenchState } from '@/hooks/manifest-editor/useWorkbenchState';
import { useAuditNavigator } from '@/hooks/manifest-editor/useAuditNavigator';
import { useWatchdog } from '@/hooks/manifest-editor/useWatchdog';

// Services
import { ContractService } from '@/services/contractService';

export default function WorkbenchContainer() {
  // 1. Core Data & Operations
  const editor = useManifestEditor();
  const { manifest, contract, updateManifest } = editor;

  // 2. Specialized State Hooks
  const ui = useWorkbenchState(manifest);
  const { zoom, pan, handleZoom, handlePan, handleResetViewport, handleFitViewport } = useViewport();
  const { auditResult } = useAudit(manifest, contract);
  const gps = useAuditNavigator(manifest, ui.setSelectedItemId, ui.setActiveTab);
  
  // 3. Watchdog Integration (Hot-Reload)
  const watchdog = useWatchdog((content) => {
    editor.handleBulkUpload([new File([content], 'auto-reload.acemm')]);
  });
 
  // 4. Effects & Synchronization (Aseptic Sync)
  useEffect(() => {
    const manifestTab = manifest.ui?.layout?.activeTab;
    if (manifestTab !== ui.activeTab) {
      updateManifest({ 
        ui: { 
          ...manifest.ui, 
          layout: { 
            containers: manifest.ui?.layout?.containers || [],
            ...manifest.ui?.layout, 
            activeTab: ui.activeTab
          } 
        } 
      });
    }
  }, [ui.activeTab, manifest.ui, updateManifest]);
 
  // 5. Handlers (Lightweight Orchestration)
  const handleSelectItem = useCallback((id: string | null) => ui.setSelectedItemId(id), [ui]);
 
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
    if (ui.selectedItemId === id) ui.setSelectedItemId(null);
  }, [editor, ui]);
 
  const onDeploy = useCallback(async () => {
    if (await editor.handleDeploy() === 'AUDIT_FAIL') ui.setIsAuditModalOpen(true);
  }, [editor, ui]);
 
  const handleExportContract = (format: 'ts' | 'cpp') => {
    ContractService.downloadContract(manifest, format);
  };
 
  const availableBinds = useMemo(() => {
    if (!contract) return [];
    return [
      ...(contract.parameters?.map((p) => p.id) || []),
      ...(contract.ports?.map((p) => p.id) || [])
    ];
  }, [contract]);
 
  const selectedItem = useMemo(() => 
    (ui.selectedItemId ? editor.findItem(ui.selectedItemId) : manifest) || null
  , [ui.selectedItemId, editor, manifest]);

  return (
    <div className="h-screen flex flex-col wb-bg wb-text font-sans overflow-hidden select-none relative transition-colors duration-500" data-ui-theme={ui.uiTheme}>
      <HiddenFileHandlers onResourceUpload={editor.handleResourceUpload} setPendingFiles={ui.setPendingFiles} />
      
      <Header 
        onReset={editor.reset} onExportManifest={editor.exportManifest} onExportPack={editor.exportOmegaPack}
        onExportCAD={() => editor.exportCADBlueprint()} onExportContract={handleExportContract}
        onGenerateMockup={() => ui.setMockupOpen(true)} onDeploy={onDeploy}
        onToggleLogs={() => ui.setShowLogs(!ui.showLogs)} showLogs={ui.showLogs}
        viewMode={ui.viewMode} setViewMode={ui.setViewMode} onHelp={() => ui.openHelp()}
        uiTheme={ui.uiTheme} setUiTheme={ui.setUiTheme} audit={auditResult}
        onOpenAudit={() => ui.setIsAuditModalOpen(true)}
      />

      <main className="flex-1 flex overflow-hidden">
        <WorkbenchSidebar 
          manifest={manifest} 
          contract={contract} 
          onDeploy={onDeploy} 
        />

        <WorkbenchViewport 
          viewMode={ui.viewMode} manifest={manifest} contract={contract}
          selectedItemId={ui.selectedItemId} onSelectItem={handleSelectItem}
          updateItem={editor.updateItem} updateManifest={updateManifest}
          updateContainer={editor.updateContainer} auditResult={auditResult}
          zoom={zoom} pan={pan} handleZoom={handleZoom} handlePan={handlePan}
          handleResetViewport={handleResetViewport} handleFitViewport={handleFitViewport}
          isLiveMode={ui.isLiveMode} setIsLiveMode={ui.setIsLiveMode}
          activeTab={ui.activeTab} setActiveTab={ui.setActiveTab}
          resolveAsset={editor.resolveAsset}
        />

        <WorkbenchInspector 
          isVisible={!!(ui.selectedItemId || !ui.isLiveMode)}
          isLiveMode={ui.isLiveMode} uiTheme={ui.uiTheme}
          manifest={manifest} selectedItem={selectedItem}
          selectedItemId={ui.selectedItemId} highlightPath={gps.highlightPath}
          availableBinds={availableBinds} extraResources={editor.extraResources}
          audit={auditResult}
          onUpdateItem={editor.updateItem} onUpdateManifest={updateManifest}
          onSelectItem={handleSelectItem} onAddEntity={handleAddEntity}
          onDuplicateItem={handleDuplicateItem} onRemoveItem={handleRemoveItem}
          onAddModulation={editor.addModulation} onRemoveModulation={editor.removeModulation}
          onUpdateModulation={editor.updateModulation} onOpenModGrid={() => ui.setShowModGrid(true)}
          addContainer={editor.addContainer} updateContainer={editor.updateContainer}
          removeContainer={editor.removeContainer} onHelp={ui.openHelp}
          onRemoveResource={editor.handleRemoveResource}
          resolveAsset={editor.resolveAsset}
        />

        {ui.showModGrid && (
          <ModulationGrid 
            manifest={manifest} onAdd={editor.addModulation} 
            onRemove={editor.removeModulation} onUpdate={editor.updateModulation} 
            onClose={() => ui.setShowModGrid(false)} 
          />
        )}
      </main>

      <EditorModals 
        manifest={manifest} pendingFiles={ui.pendingFiles} setPendingFiles={ui.setPendingFiles} handleBulkUpload={editor.handleBulkUpload}
        helpState={ui.helpState} closeHelp={ui.closeHelp} isAuditModalOpen={ui.isAuditModalOpen} setIsAuditModalOpen={ui.setIsAuditModalOpen}
        handleNavigateToIssue={gps.handleNavigateToIssue} auditResult={auditResult} mockupOpen={ui.mockupOpen} setMockupOpen={ui.setMockupOpen}
        resolveAsset={editor.resolveAsset}
      />

      <WorkbenchLogs showLogs={ui.showLogs} setShowLogs={ui.setShowLogs} logs={editor.logs} />
      <WorkbenchFooter 
        auditResult={auditResult} 
        onOpenAudit={() => ui.setIsAuditModalOpen(true)} 
        watchdogStatus={watchdog.status}
        watchdogTime={watchdog.lastUpdate}
      />
    </div>
  );
}
