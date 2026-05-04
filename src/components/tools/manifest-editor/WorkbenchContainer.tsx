'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import ModuleHub from './ModuleHub';
import VirtualRack from './VirtualRack';
import NodeCanvas from './NodeCanvas';
import PropertyPanel from './PropertyPanel';
import SourceViewer from './SourceViewer';
import WorkbenchFooter from './WorkbenchFooter';
import WorkbenchLogs from './WorkbenchLogs';
import AuditModal from './AuditModal';
import { useManifestEditor } from '@/hooks/useManifestEditor';
import HelpModal from './HelpModal';
import IngestionModal from './IngestionModal';
import MockupModal from './MockupModal';
import { useViewport } from '@/hooks/manifest-editor/useViewport';
import { useAudit } from '@/hooks/manifest-editor/useAudit';
import { HiddenFileHandlers } from './HiddenFileHandlers';
import ViewportControls from './ViewportControls';
import ModulationGrid from './ModulationGrid';

export default function WorkbenchContainer() {
  const { 
    manifest, 
    contract, 
    updateManifest,
    findItem,
    updateItem,
    removeItem,
    duplicateItem,
    addEntity,
    addModulation,
    removeModulation,
    updateModulation,
    addContainer,
    updateContainer,
    removeContainer,
    exportManifest,
    exportOmegaPack,
    exportCADBlueprint,
    handleDeploy,
    handleRemoveResource,
    handleBulkUpload,
    extraResources,
    reset,
    logs
  } = useManifestEditor();

  // Navigation & Selection State
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const [viewMode, setViewMode] = useState<'orbital' | 'rack' | 'source'>('orbital');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showModGrid, setShowModGrid] = useState(false);
  const [helpState, setHelpState] = useState<{ isOpen: boolean; sectionId?: string }>({ isOpen: false });
  const [mockupOpen, setMockupOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(manifest.ui?.layout?.activeTab || 'MAIN');
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>('dark');

  // Sync activeTab to manifest for rendering engines
  useEffect(() => {
    if (manifest.ui?.layout?.activeTab !== activeTab) {
      updateManifest({ 
        ui: { 
          ...manifest.ui, 
          layout: { 
            containers: manifest.ui?.layout?.containers || [],
            ...manifest.ui?.layout, 
            activeTab: activeTab as any 
          } 
        } 
      });
    }
  }, [activeTab, manifest.ui, updateManifest]);

  // Viewport & Audit Hooks (Modularized)
  const { zoom, pan, handleZoom, handlePan, handleResetViewport, handleFitViewport } = useViewport();
  const { auditResult } = useAudit(manifest, contract);

  // Help Handlers
  const openHelp = useCallback((sectionId?: string) => {
    setHelpState({ isOpen: true, sectionId });
  }, []);

  // Event Handlers
  const triggerUpload = (id: string) => document.getElementById(id)?.click();

  const handleSelectItem = useCallback((id: string | null) => {
    setSelectedItemId(id);
  }, []);

  const handleAddEntity = useCallback((type: 'control' | 'jack') => {
    const id = addEntity(type);
    if (id) handleSelectItem(id);
  }, [addEntity, handleSelectItem]);

  const handleDuplicateItem = useCallback((id: string) => {
    const newId = duplicateItem(id);
    if (newId) handleSelectItem(newId);
  }, [duplicateItem, handleSelectItem]);

  const handleRemoveItem = useCallback((id: string) => {
    removeItem(id);
    if (selectedItemId === id) setSelectedItemId(null);
  }, [removeItem, selectedItemId]);

  // Viewport Actions
  const onFitViewport = () => handleFitViewport(viewMode);

  const availableBinds = contract ? [
    ...(contract.parameters?.map((p: { id: string }) => p.id) || []),
    ...(contract.ports?.map((p: { id: string }) => p.id) || [])
  ] : [];

  const selectedItem = selectedItemId ? findItem(selectedItemId) : manifest;

  return (
    <div 
      className="h-screen flex flex-col wb-bg wb-text font-sans overflow-hidden relative transition-colors duration-500"
      data-ui-theme={uiTheme}
    >
      <HiddenFileHandlers 
        onBulkUpload={handleBulkUpload} 
        onResourceUpload={handleBulkUpload} 
        setPendingFiles={setPendingFiles} 
      />
      
      <Header 
        onReset={reset}
        onExportManifest={exportManifest}
        onExportPack={exportOmegaPack}
        onExportCAD={() => exportCADBlueprint()}
        onGenerateMockup={() => setMockupOpen(true)}
        onDeploy={handleDeploy}
        onToggleLogs={() => setShowLogs(!showLogs)}
        showLogs={showLogs}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onHelp={() => openHelp()}
        uiTheme={uiTheme}
        setUiTheme={setUiTheme}
        audit={auditResult}
      />

      <AnimatePresence>
        {pendingFiles && (
          <IngestionModal 
            files={pendingFiles} 
            onConfirm={(selected) => {
              handleBulkUpload(selected);
              setPendingFiles(null);
            }}
            onCancel={() => setPendingFiles(null)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-80 border-r wb-outline wb-surface flex flex-col min-w-[320px] transition-colors duration-500">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <ModuleHub 
              manifest={manifest} 
              contract={contract} 
              triggerUpload={triggerUpload} 
              onDeploy={handleDeploy}
            />
          </div>
        </aside>

        {/* CENTER VIEWPORT */}
        <section className="flex-1 relative wb-bg overflow-hidden transition-colors duration-500">
          {viewMode !== 'source' && (
            <ViewportControls 
              zoom={zoom}
              onZoom={handleZoom}
              onPan={handlePan}
              onReset={handleResetViewport}
              onFit={onFitViewport}
            />
          )}

          <AnimatePresence mode="wait">
            {viewMode === 'orbital' ? (
              <motion.div 
                key="orbital"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: zoom,
                  x: pan.x,
                  y: pan.y
                }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="h-full origin-center"
              >
                <NodeCanvas 
                  manifest={manifest}
                  contract={contract}
                  selectedItemId={selectedItemId}
                  onSelectItem={handleSelectItem}
                  onUpdateItem={updateItem}
                  audit={auditResult}
                />
              </motion.div>
            ) : viewMode === 'rack' ? (
              <motion.div 
                key="rack"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: zoom,
                  x: pan.x,
                  y: pan.y
                }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="h-full origin-center"
              >
                <VirtualRack 
                  manifest={manifest}
                  contract={contract}
                  onSelectItem={handleSelectItem}
                  selectedItemId={selectedItemId}
                  onUpdateItem={updateItem}
                  zoom={zoom}
                  isLiveMode={isLiveMode}
                  setIsLiveMode={setIsLiveMode}
                  audit={auditResult}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onUpdateContainer={updateContainer}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="source"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <SourceViewer manifest={manifest} selectedItemId={selectedItemId} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT SIDEBAR: INSPECTOR */}
        <AnimatePresence>
          {(selectedItemId || !isLiveMode) && !isLiveMode && (
            <motion.aside 
              key="inspector"
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-[400px] shrink-0 h-full border-l wb-outline transition-colors duration-500"
            >
              <PropertyPanel 
                uiTheme={uiTheme}
                manifest={manifest}
                item={selectedItem!}
                onUpdate={selectedItemId ? (updates: any) => {
                  updateItem(selectedItemId, updates);
                  if (updates.id && updates.id !== selectedItemId) {
                    setSelectedItemId(updates.id);
                  }
                } : updateManifest}
                onClose={() => setSelectedItemId(null)}
                availableBinds={availableBinds}
                scale={1}
                onSelectItem={handleSelectItem}
                onAddEntity={handleAddEntity}
                onDuplicateItem={handleDuplicateItem}
                onRemoveItem={handleRemoveItem}
                onAddModulation={addModulation}
                onRemoveModulation={removeModulation}
                onUpdateModulation={updateModulation}
                onOpenGrid={() => setShowModGrid(true)}
                addContainer={addContainer}
                updateContainer={updateContainer}
                removeContainer={removeContainer}
                onHelp={openHelp}
                extraResources={extraResources}
                onTriggerUpload={triggerUpload}
                onRemoveResource={handleRemoveResource}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {showModGrid && (
          <ModulationGrid 
            manifest={manifest}
            onAdd={addModulation}
            onRemove={removeModulation}
            onUpdate={updateModulation}
            onClose={() => setShowModGrid(false)}
          />
        )}
      </main>

      {/* HELP MODAL */}
      <HelpModal 
        isOpen={helpState.isOpen} 
        initialSectionId={helpState.sectionId} 
        onClose={() => setHelpState({ isOpen: false })} 
      />
      <WorkbenchLogs 
        showLogs={showLogs} 
        setShowLogs={setShowLogs} 
        logs={logs} 
      />

      <WorkbenchFooter 
        auditResult={auditResult} 
        manifest={manifest} 
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      <AuditModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        audit={auditResult} 
        manifest={manifest} 
      />
      <MockupModal 
        isOpen={mockupOpen} 
        onClose={() => setMockupOpen(false)} 
        manifest={manifest} 
      />
    </div>
  );
}
