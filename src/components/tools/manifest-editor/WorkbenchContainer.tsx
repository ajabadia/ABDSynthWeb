'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import ModuleHub from './ModuleHub';
import VirtualRack from './VirtualRack';
import NodeCanvas from './NodeCanvas';
import PropertyPanel from './PropertyPanel';
import LogTerminal from './LogTerminal';
import SourceViewer from './SourceViewer';
import { useManifestEditor } from '@/hooks/useManifestEditor';
import HelpModal from './HelpModal';
import IngestionModal from './IngestionModal';
import MockupModal from './MockupModal';
import { AuditService } from '@/services/auditService';
import ComplianceBadge from './ComplianceBadge';
import ViewportControls from './ViewportControls';
import ModulationGrid from './ModulationGrid';
import { wasmRuntime } from '@/services/wasmRuntime';
import { useViewport } from '@/hooks/manifest-editor/useViewport';
import { useAudit } from '@/hooks/manifest-editor/useAudit';

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
    handleManifestUpload,
    handleWasmUpload,
    handleContractUpload,
    handleResourceUpload,
    handleRemoveResource,
    handleBulkUpload,
    extraResources,
    reset,
    addLog,
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
  const [activeTab, setActiveTab] = useState(manifest.ui?.layout?.activeTab || 'MAIN');

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
    <div className="h-screen flex flex-col bg-[#050505] text-foreground font-sans overflow-hidden relative">
      {/* HIDDEN FILE INPUTS */}
      <input 
        id="bulk-upload" 
        type="file" 
        accept=".acemm,.wasm,.json" 
        multiple 
        className="hidden" 
        onChange={(e) => { if (e.target.files) { setPendingFiles(Array.from(e.target.files)); e.target.value = ''; } }} 
      />
      <input 
        id="folder-upload" 
        type="file" 
        {...({ webkitdirectory: "", directory: "" } as any)}
        className="hidden" 
        onChange={(e) => { if (e.target.files) { setPendingFiles(Array.from(e.target.files)); e.target.value = ''; } }} 
      />
      <input id="resource-upload" type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) { handleBulkUpload(e.target.files); e.target.value = ''; } }} />
      
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
        <aside className="w-80 border-r border-outline bg-black/40 flex flex-col min-w-[320px]">
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
        <section className="flex-1 relative bg-black overflow-hidden">
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
              className="w-[400px] shrink-0 h-full border-l border-outline/20"
            >
              <PropertyPanel 
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

      {/* FLOATING LOG TERMINAL */}
      <AnimatePresence>
        {showLogs && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-80 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="h-full border-t border-accent/30">
               <LogTerminal logs={logs} />
               <button 
                 onClick={() => setShowLogs(false)}
                 className="absolute top-2 right-4 p-1 text-foreground/20 hover:text-foreground/60 transition-colors"
               >
                 <span className="text-[9px] font-black uppercase tracking-widest">Close</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* INDUSTRIAL FOOTER */}
      <footer className="h-6 border-t border-outline/20 bg-black flex items-center justify-between px-6 z-50 shrink-0">
        <div className="flex-1 flex items-center gap-4 text-[7px] font-mono uppercase tracking-[0.2em] text-foreground/20">
          <span className="text-primary/40 font-black">Build v7.2.3</span>
          <span className="opacity-50">//</span>
          <span>Aseptic Standard</span>
        </div>

        <div className="flex-1 flex justify-center scale-[0.7] origin-center opacity-80 hover:opacity-100 transition-opacity">
          <ComplianceBadge audit={auditResult} manifest={manifest} />
        </div>
        
        <div className="flex-1 flex items-center justify-end gap-4 text-[7px] font-mono uppercase tracking-[0.2em] text-foreground/20">
          <span>Industrial Era 7 Engineering Suite</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/20 border border-green-500/40 animate-pulse" />
        </div>
      </footer>
      <MockupModal 
        isOpen={mockupOpen} 
        onClose={() => setMockupOpen(false)} 
        manifest={manifest} 
      />
    </div>
  );
}
