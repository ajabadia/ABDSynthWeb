'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Download, Share2, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { OMEGA_Manifest } from '../../../types/manifest';

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
      const timer = setTimeout(() => setStatus('complete'), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!manifest) return null;
  const hp = manifest.metadata?.rack?.hp || 12;
  const widthPx = hp * 15 * 1.5;
  const heightPx = 420 * 1.5;
  const skin = manifest.ui?.skin || 'industrial';

  const getSkinStyles = () => {
    switch(skin) {
      case 'carbon': return "bg-[#050505] shadow-[inset_0_0_100px_rgba(255,100,0,0.05)] border-white/5";
      case 'glass': return "bg-white/5 backdrop-blur-xl border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)]";
      case 'minimal': return "bg-[#f5f5f5] border-black/10 shadow-[0_0_30px_rgba(0,0,0,0.1)]";
      default: return "bg-[#111111] border-white/10 shadow-[inset_0_0_80px_rgba(0,240,255,0.05)]";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl aspect-video bg-[#050505] border border-white/5 rounded-sm shadow-2xl overflow-hidden flex flex-col"
          >
            {/* HEADER */}
            <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-black/60 z-10">
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Studio Render Engine v7.2.3</span>
                <div className="h-4 w-px bg-white/10 mx-2" />
                <span className="text-[10px] font-mono text-primary/80">{manifest.metadata?.name?.toUpperCase()}</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            </div>

            {/* RENDER VIEWPORT */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#151515_0%,#000_100%)]">
              {status === 'rendering' ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Ray-Tracing in progress</span>
                    <span className="text-[6px] font-mono text-white/20 uppercase tracking-widest animate-pulse">Calculating Parity...</span>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, rotateY: -20, rotateX: 10 }}
                  animate={{ opacity: 1, rotateY: 5, rotateX: 2 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{ perspective: "1000px" }}
                  className="relative flex items-center justify-center group"
                >
                  {/* SHADOW BASE */}
                  <div className="absolute inset-0 bg-black/60 blur-[100px] scale-110 -z-10" />

                  {/* 3D MODULE BODY */}
                  <div 
                    style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
                    className={`relative border rounded-xs transition-all duration-700 ${getSkinStyles()}`}
                  >
                    {/* INDUSTRIAL SCREWS */}
                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/10 border border-white/20 shadow-inner" />
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/10 border border-white/20 shadow-inner" />
                    <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-white/10 border border-white/20 shadow-inner" />
                    <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/10 border border-white/20 shadow-inner" />

                    {/* RENDERED ELEMENTS */}
                    {[...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].map((e) => (
                      <div 
                        key={e.id}
                        className="absolute"
                        style={{ 
                          left: `${e.pos.x * 1.5}px`, 
                          top: `${e.pos.y * 1.5}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                         {e.type === 'jack' || e.role === 'stream' ? (
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-black border-2 border-white/10 shadow-xl flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
                           </div>
                         ) : (
                           <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#333] to-[#111] border border-white/10 shadow-2xl flex items-center justify-center">
                              <div className="w-1 h-5 bg-primary/40 rounded-full" style={{ transform: 'rotate(45deg)' }} />
                           </div>
                         )}
                         <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[5px] font-black uppercase text-white/20 tracking-tighter whitespace-nowrap">
                            {e.id}
                         </div>
                      </div>
                    ))}

                    {/* OVERLAY GLOSS */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                  </div>

                  {/* RENDER INFO TAG */}
                  <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 px-4 py-2 border border-white/5 rounded-full backdrop-blur-md">
                     <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-[#00ff9d]" />
                        <span className="text-[7px] font-black uppercase text-[#00ff9d]">Integrity Verified</span>
                     </div>
                     <div className="w-px h-3 bg-white/10" />
                     <span className="text-[7px] font-mono text-white/40">{hp} HP | v7.2.3</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="h-16 border-t border-white/10 flex items-center justify-center gap-4 bg-black/40">
                <button className="flex items-center gap-2 px-8 py-2.5 bg-primary text-black rounded-xs text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download 8K Studio Shot</span>
                </button>
                <button className="flex items-center gap-2 px-8 py-2.5 bg-white/5 border border-white/10 text-white rounded-xs text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Blueprint</span>
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
