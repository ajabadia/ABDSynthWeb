'use client';

import { useCallback, useEffect } from 'react';

// UI Components
import Header from './Header';
import WorkbenchFooter from './WorkbenchFooter';
import WorkbenchLogs from './WorkbenchLogs';
import EditorModals from './EditorModals';
import ModulationGrid from './ModulationGrid';
import { HiddenFileHandlers } from './HiddenFileHandlers';
import { WorkbenchSidebar } from './WorkbenchSidebar';
import { WorkbenchViewport } from './WorkbenchViewport';
import { WorkbenchInspector } from './WorkbenchInspector';

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

  // 4. Effects & Synchronization
  useEffect(() => {
    if (manifest.ui?.layout?.activeTab !== ui.activeTab) {
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

  // 4. Handlers (Lightweight Orchestration)
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
    const content = format === 'ts' 
      ? ContractService.generateTypeScriptContract(manifest)
      : ContractService.generateCppContract(manifest);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'ts' ? 'schema_ids.ts' : 'OmegaRegistry.h';
    a.click();
    URL.revokeObjectURL(url);
  };

  const availableBinds = contract ? [
    ...(contract.parameters?.map((p) => p.id) || []),
    ...(contract.ports?.map((p) => p.id) || [])
  ] : [];

  const selectedItem = (ui.selectedItemId ? editor.findItem(ui.selectedItemId) : manifest) || null;

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
