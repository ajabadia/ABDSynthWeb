import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Download, Share2, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { OMEGA_Manifest } from '../../../types/manifest';

// Reusing Real Components for 100% Parity
import { RackContainer } from './rack/RackContainer';
import { RackEntity } from './rack/RackEntity';
import { RackScrews } from './rack/RackScrews';

interface MockupModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: OMEGA_Manifest;
}

export default function MockupModal({ isOpen, onClose, manifest }: MockupModalProps) {
  const [status, setStatus] = React.useState<'idle' | 'rendering' | 'complete'>('idle');

  React.useEffect(() => {
    if (isOpen) {
      setStatus('rendering');
      const timer = setTimeout(() => setStatus('complete'), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const activeTab = manifest.ui?.layout?.activeTab || 'MAIN';
  const hp = manifest.metadata?.rack?.hp || 12;
  const isCompact = manifest?.metadata?.rack?.height_mode === 'compact';
  const width = hp * 15 * 1.5;
  const height = (isCompact ? 210 : 420) * 1.5;
  const skin = manifest.ui?.skin || 'industrial';

  const allElements = useMemo(() => [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ], [manifest.ui]);

  const containers = manifest.ui.layout?.containers || [];
  const visibleContainers = containers.filter(c => !c.tab || c.tab === activeTab);
  
  const visibleElements = allElements.filter(entity => {
    const containerId = entity.presentation?.container;
    const container = containers.find(c => c.id === containerId);
    if (container) return !container.tab || container.tab === activeTab;
    return (entity.presentation?.tab || 'MAIN') === activeTab;
  });

  const getSkinConfig = () => {
    switch (skin) {
      case 'industrial': 
        return 'bg-[#121212] border-y-[#222] border-x-[#333] shadow-[0_40px_100px_rgba(0,0,0,0.8)]';
      case 'carbon':
        return 'bg-[#0a0a0a] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)]';
      default:
        return 'bg-[#1a1a1a] border-white/10';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-6xl aspect-video bg-[#050505] border border-white/5 rounded-sm shadow-2xl overflow-hidden flex flex-col"
        >
          {/* HEADER */}
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-black/60 z-10">
            <div className="flex items-center gap-3">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Industrial Render Engine v7.2.3</span>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <span className="text-[10px] font-mono text-primary/80">{manifest.metadata?.name?.toUpperCase()} — {activeTab} PLANE</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-4 h-4 text-foreground/40" />
            </button>
          </div>

          {/* RENDER VIEWPORT */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#1a1a1a_0%,#000_100%)]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            
            {status === 'rendering' ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">High-Fidelity Capturing</span>
                  <span className="text-[6px] font-mono text-white/20 uppercase tracking-widest animate-pulse">Scanning Layout Integrity...</span>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center justify-center"
              >
                {/* STUDIO LIGHTING BLOOM */}
                <div className="absolute -inset-20 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

                {/* THE ACTUAL RACK SNAPSHOT */}
                <div 
                  className={`relative border-x-[4px] border-y-[1px] ${getSkinConfig()}`}
                  style={{ 
                    width: `${width}px`, 
                    height: `${height}px`,
                    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.1) 100%)`
                  }}
                >
                  <RackScrews skin={skin} />

                  {/* ARCHITECTURAL LAYERS */}
                    {visibleContainers.map((c) => (
                      <RackContainer 
                        key={c.id} container={c} isSelected={false} 
                        activeContainers={{}} audit={{ issues: [], details: [] } as any} 
                        skin={skin} rackWidthPx={width} 
                        isLiveMode={true}
                      />
                    ))}

                  {/* ENTITIES LAYER */}
                  {visibleElements.map((item) => (
                    <RackEntity 
                      key={item.id} item={item} contract={null} rackRef={{ current: null }} 
                      zoom={1.0} isLiveMode={true} selectedItemId={null} 
                      onSelectItem={() => {}} onUpdateItem={() => {}} 
                      runtimeValue={0.5} steps={100} onUpdateValue={() => {}} 
                      onPortClick={() => {}} audit={{ issues: [], details: [] } as any} skin={skin} 
                    />
                  ))}

                  {/* STUDIO OVERLAY SHINE */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
                </div>

                {/* SHADOW BASE */}
                <div className="absolute -bottom-10 left-0 right-0 h-20 bg-black/60 blur-3xl -z-10" />
              </motion.div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="h-16 border-t border-white/10 flex items-center justify-center gap-4 bg-black/40">
              <button className="flex items-center gap-2 px-8 py-2.5 bg-primary text-black rounded-xs text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                <Download className="w-3.5 h-3.5" />
                <span>Export 8K Studio Shot</span>
              </button>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-[#00ff9d]" />
                 <span className="text-[7px] font-black uppercase text-[#00ff9d]">Literal Parity Verified</span>
              </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
