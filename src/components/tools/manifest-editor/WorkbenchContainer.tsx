'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import ModuleHub from './ModuleHub';
import VirtualRack from './VirtualRack';
import NodeCanvas from './NodeCanvas';
import PropertyPanel from './PropertyPanel';
import LogTerminal from './LogTerminal';
import SourceViewer from './SourceViewer';
import { useManifestEditor } from '@/hooks/useManifestEditor';

/**
 * WorkbenchContainer
 * Pure Orchestrator for the OMEGA Manifest Engineering Suite.
 * Handles layout routing, visibility state, and component mapping.
 */
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
    exportManifest, 
    handleManifestUpload,
    handleWasmUpload,
    handleContractUpload,
    reset,
    logs
  } = useManifestEditor();

  // Navigation & Selection State
  const [viewMode, setViewMode] = useState<'orbital' | 'rack' | 'source'>('orbital');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Event Handlers (Orchestration)
  const triggerUpload = (id: string) => document.getElementById(id)?.click();

  const handleSelectItem = useCallback((id: string) => {
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

  // Derived Data
  const availableBinds = contract ? [
    ...(contract.parameters?.map((p: { id: string }) => p.id) || []),
    ...(contract.ports?.map((p: { id: string }) => p.id) || [])
  ] : [];

  const selectedItem = selectedItemId ? findItem(selectedItemId) : manifest;

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-foreground font-sans overflow-hidden relative">
      {/* HIDDEN FILE INPUTS */}
      <input id="manifest-upload" type="file" accept=".json,.acemm" className="hidden" onChange={(e) => e.target.files?.[0] && handleManifestUpload(e.target.files[0])} />
      <input id="wasm-upload" type="file" accept=".wasm" className="hidden" onChange={(e) => e.target.files?.[0] && handleWasmUpload(e.target.files[0])} />
      <input id="contract-upload" type="file" accept=".json" className="hidden" onChange={(e) => e.target.files?.[0] && handleContractUpload(e.target.files[0])} />

      <Header 
        onReset={reset}
        onExport={exportManifest}
        onToggleLogs={() => setShowLogs(!showLogs)}
        showLogs={showLogs}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: HUB & REGISTRY */}
        <aside className="w-80 border-r border-outline bg-black/40 flex flex-col min-w-[320px]">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            <ModuleHub 
              manifest={manifest} 
              contract={contract} 
              triggerUpload={triggerUpload} 
            />
          </div>
        </aside>

        {/* CENTER VIEWPORT */}
        <section className="flex-1 relative bg-black overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'orbital' ? (
              <motion.div 
                key="orbital"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full"
              >
                <NodeCanvas 
                  manifest={manifest}
                  contract={contract}
                  selectedItemId={selectedItemId}
                  onSelectItem={handleSelectItem}
                  onUpdateItem={updateItem}
                />
              </motion.div>
            ) : viewMode === 'rack' ? (
              <motion.div 
                key="rack"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <VirtualRack 
                  manifest={manifest}
                  onSelectItem={handleSelectItem}
                  selectedItemId={selectedItemId}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="source"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
                <SourceViewer manifest={manifest} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT SIDEBAR: INSPECTOR */}
        <AnimatePresence>
          <motion.aside 
            key="inspector"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-[400px] shrink-0 h-full border-l border-outline/20"
          >
            <PropertyPanel 
              item={selectedItem}
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
            />
          </motion.aside>
        </AnimatePresence>
      </main>

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
    </div>
  );
}
