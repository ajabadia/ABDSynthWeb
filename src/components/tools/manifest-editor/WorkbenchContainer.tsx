'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Maximize, Target, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import ModuleHub from './ModuleHub';
import VirtualRack from './VirtualRack';
import NodeCanvas from './NodeCanvas';
import PropertyPanel from './PropertyPanel';
import LogTerminal from './LogTerminal';
import SourceViewer from './SourceViewer';
import { useManifestEditor } from '@/hooks/useManifestEditor';
import HelpModal from './HelpModal';

/**
 * ViewportControls
 * Industrial floating toolbar for viewport navigation.
 */
function ViewportControls({ zoom, onZoom, onPan, onReset, onFit }: any) {
  return (
    <div className="absolute bottom-6 right-6 flex items-center gap-3 z-[100]">
      {/* ZOOM GROUP */}
      <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-xs p-1 shadow-2xl">
        <button onClick={() => onZoom(-0.1)} className="p-1.5 hover:bg-white/5 text-foreground/40 hover:text-primary transition-all rounded-xs">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="px-3 min-w-[50px] text-center border-x border-white/5">
          <span className="text-[9px] font-mono font-black text-primary/80">{Math.round(zoom * 100)}%</span>
        </div>
        <button onClick={() => onZoom(0.1)} className="p-1.5 hover:bg-white/5 text-foreground/40 hover:text-primary transition-all rounded-xs">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* PAN & CENTER GROUP */}
      <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-xs p-1 shadow-2xl">
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
          <div />
          <button onClick={() => onPan(0, 50)} className="p-1 hover:bg-white/5 text-foreground/20 hover:text-primary transition-all rounded-xs">
            <ChevronUp className="w-3 h-3" />
          </button>
          <div />
          <button onClick={() => onPan(50, 0)} className="p-1 hover:bg-white/5 text-foreground/20 hover:text-primary transition-all rounded-xs">
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button onClick={onReset} className="p-1 bg-primary/10 text-primary hover:bg-primary/20 transition-all rounded-xs flex items-center justify-center">
            <Target className="w-3 h-3" />
          </button>
          <button onClick={() => onPan(-50, 0)} className="p-1 hover:bg-white/5 text-foreground/20 hover:text-primary transition-all rounded-xs">
            <ChevronRight className="w-3 h-3" />
          </button>
          <div />
          <button onClick={() => onPan(0, -50)} className="p-1 hover:bg-white/5 text-foreground/20 hover:text-primary transition-all rounded-xs">
            <ChevronDown className="w-3 h-3" />
          </button>
          <div />
        </div>
      </div>

      {/* FIT ACTION */}
      <button 
        onClick={onFit}
        className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md border border-white/10 hover:border-primary/40 hover:bg-primary/5 text-foreground/40 hover:text-primary transition-all rounded-xs shadow-2xl group"
      >
        <Maximize className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="text-[8px] font-black uppercase tracking-widest">Fit</span>
      </button>
    </div>
  );
}

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
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [helpState, setHelpState] = useState<{ isOpen: boolean; sectionId?: string }>({ isOpen: false });

  // VIEWPORT NAVIGATION STATE
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Help Handlers
  const openHelp = useCallback((sectionId?: string) => {
    setHelpState({ isOpen: true, sectionId });
  }, []);

  // Event Handlers
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

  // Viewport Actions
  const handleZoom = (delta: number) => setZoom(prev => Math.max(0.2, Math.min(3, prev + delta)));
  const handlePan = (dx: number, dy: number) => setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  const handleResetViewport = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };
  const handleFitViewport = () => {
    if (viewMode === 'rack') {
      setZoom(0.85);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
    }
  };

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
        onHelp={() => openHelp()}
      />

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
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
          {viewMode !== 'source' && (
            <ViewportControls 
              zoom={zoom}
              onZoom={handleZoom}
              onPan={handlePan}
              onReset={handleResetViewport}
              onFit={handleFitViewport}
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
                  onSelectItem={handleSelectItem}
                  selectedItemId={selectedItemId}
                  onUpdateItem={updateItem}
                  zoom={zoom}
                  isLiveMode={isLiveMode}
                  setIsLiveMode={setIsLiveMode}
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
                onHelp={openHelp}
              />
            </motion.aside>
          )}
        </AnimatePresence>
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
    </div>
  );
}
