'use client';

import { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import Header from './Header';
import ModuleHub from './ModuleHub';
import VirtualRack from './VirtualRack';
import NodeCanvas from './NodeCanvas';
import PropertyPanel from './PropertyPanel';
import SourceViewer from './SourceViewer';
import WorkbenchFooter from './WorkbenchFooter';
import WorkbenchLogs from './WorkbenchLogs';
import EditorModals from './EditorModals';
import ViewportControls from './ViewportControls';
import ModulationGrid from './ModulationGrid';
import { HiddenFileHandlers } from './HiddenFileHandlers';

// Hooks
import { useManifestEditor } from '@/hooks/useManifestEditor';
import { useViewport } from '@/hooks/manifest-editor/useViewport';
import { useAudit } from '@/hooks/manifest-editor/useAudit';
import { useWorkbenchState } from '@/hooks/manifest-editor/useWorkbenchState';
import { useAuditNavigator } from '@/hooks/manifest-editor/useAuditNavigator';

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

  // 3. Effects & Synchronization
  useEffect(() => {
    if (manifest.ui?.layout?.activeTab !== ui.activeTab) {
      updateManifest({ 
        ui: { 
          ...manifest.ui, 
          layout: { 
            containers: manifest.ui?.layout?.containers || [],
            ...manifest.ui?.layout, 
            activeTab: ui.activeTab as any 
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
    ...(contract.parameters?.map((p: any) => p.id) || []),
    ...(contract.ports?.map((p: any) => p.id) || [])
  ] : [];

  const selectedItem = ui.selectedItemId ? editor.findItem(ui.selectedItemId) : manifest;

  return (
    <div className="h-screen flex flex-col wb-bg wb-text font-sans overflow-hidden relative transition-colors duration-500" data-ui-theme={ui.uiTheme}>
      <HiddenFileHandlers onBulkUpload={editor.handleBulkUpload} setPendingFiles={ui.setPendingFiles} />
      
      <Header 
        onReset={editor.reset} onExportManifest={editor.exportManifest} onExportPack={editor.exportOmegaPack}
        onExportCAD={() => editor.exportCADBlueprint()} onExportContract={handleExportContract}
        onGenerateMockup={() => ui.setMockupOpen(true)} onDeploy={onDeploy}
        onToggleLogs={() => ui.setShowLogs(!ui.showLogs)} showLogs={ui.showLogs}
        viewMode={ui.viewMode} setViewMode={ui.setViewMode} onHelp={() => ui.openHelp()}
        uiTheme={ui.uiTheme} setUiTheme={ui.setUiTheme} audit={auditResult}
      />

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 border-r wb-outline wb-surface flex flex-col min-w-[320px] transition-colors duration-500">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <ModuleHub manifest={manifest} contract={contract} triggerUpload={(id) => document.getElementById(id)?.click()} onDeploy={onDeploy} />
          </div>
        </aside>

        <section className="flex-1 relative wb-bg overflow-hidden transition-colors duration-500">
          {ui.viewMode !== 'source' && (
            <ViewportControls zoom={zoom} onZoom={handleZoom} onPan={handlePan} onReset={handleResetViewport} onFit={() => handleFitViewport(ui.viewMode)} />
          )}

          <AnimatePresence mode="wait">
            {ui.viewMode === 'orbital' ? (
              <motion.div key="orbital" initial={{ opacity: 0 }} animate={{ opacity: 1, scale: zoom, x: pan.x, y: pan.y }} exit={{ opacity: 0 }} className="h-full origin-center">
                <NodeCanvas manifest={manifest} contract={contract} selectedItemId={ui.selectedItemId} onSelectItem={handleSelectItem} onUpdateItem={editor.updateItem} audit={auditResult} />
              </motion.div>
            ) : ui.viewMode === 'rack' ? (
              <motion.div key="rack" initial={{ opacity: 0 }} animate={{ opacity: 1, scale: zoom, x: pan.x, y: pan.y }} exit={{ opacity: 0 }} className="h-full origin-center">
                <VirtualRack manifest={manifest} contract={contract} onSelectItem={handleSelectItem} selectedItemId={ui.selectedItemId} onUpdateItem={editor.updateItem} zoom={zoom} isLiveMode={ui.isLiveMode} setIsLiveMode={ui.setIsLiveMode} audit={auditResult} activeTab={ui.activeTab} setActiveTab={ui.setActiveTab} onUpdateContainer={editor.updateContainer} />
              </motion.div>
            ) : (
              <motion.div key="source" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <SourceViewer manifest={manifest} selectedItemId={ui.selectedItemId} onUpdate={updateManifest} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <AnimatePresence>
          {(ui.selectedItemId || !ui.isLiveMode) && !ui.isLiveMode && (
            <motion.aside key="inspector" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="w-[400px] shrink-0 h-full border-l wb-outline transition-colors duration-500">
              <PropertyPanel 
                uiTheme={ui.uiTheme} manifest={manifest} item={selectedItem!} highlightPath={gps.highlightPath}
                onUpdate={ui.selectedItemId ? (updates: any) => {
                  editor.updateItem(ui.selectedItemId!, updates);
                  if (updates.id && updates.id !== ui.selectedItemId) ui.setSelectedItemId(updates.id);
                } : updateManifest}
                onClose={() => ui.setSelectedItemId(null)} availableBinds={availableBinds}
                onSelectItem={handleSelectItem} onAddEntity={handleAddEntity} onDuplicateItem={handleDuplicateItem} onRemoveItem={handleRemoveItem}
                onAddModulation={editor.addModulation} onRemoveModulation={editor.removeModulation} onUpdateModulation={editor.updateModulation} onOpenGrid={() => ui.setShowModGrid(true)}
                addContainer={editor.addContainer} updateContainer={editor.updateContainer} removeContainer={editor.removeContainer}
                onHelp={ui.openHelp} extraResources={editor.extraResources} onTriggerUpload={(id) => document.getElementById(id)?.click()} onRemoveResource={editor.handleRemoveResource}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {ui.showModGrid && <ModulationGrid manifest={manifest} onAdd={editor.addModulation} onRemove={editor.removeModulation} onUpdate={editor.updateModulation} onClose={() => ui.setShowModGrid(false)} />}
      </main>

      <EditorModals 
        manifest={manifest} pendingFiles={ui.pendingFiles} setPendingFiles={ui.setPendingFiles} handleBulkUpload={editor.handleBulkUpload}
        helpState={ui.helpState} closeHelp={ui.closeHelp} isAuditModalOpen={ui.isAuditModalOpen} setIsAuditModalOpen={ui.setIsAuditModalOpen}
        handleNavigateToIssue={gps.handleNavigateToIssue} auditResult={auditResult} mockupOpen={ui.mockupOpen} setMockOpen={ui.setMockupOpen}
      />

      <WorkbenchLogs showLogs={ui.showLogs} setShowLogs={ui.setShowLogs} logs={editor.logs} />
      <WorkbenchFooter auditResult={auditResult} manifest={manifest} onOpenAudit={() => ui.setIsAuditModalOpen(true)} />
    </div>
  );
}
