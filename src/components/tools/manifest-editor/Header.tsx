'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Shield, RotateCcw, Terminal, HelpCircle, Zap, ChevronDown, FileCode, Package, Layers, Camera } from 'lucide-react';

import { AuditResult } from '../../../services/auditService';
import { OMEGA_Manifest } from '../../../types/manifest';

interface HeaderProps {
  onReset: () => void;
  onExportManifest: () => void;
  onExportPack: () => void;
  onExportCAD: () => void;
  onGenerateMockup: () => void;
  onDeploy: () => void;
  onToggleLogs: () => void;
  showLogs: boolean;
  viewMode: 'orbital' | 'rack' | 'source';
  setViewMode: (mode: 'orbital' | 'rack' | 'source') => void;
  onHelp: () => void;
}

export default function Header({ 
  onReset, 
  onExportManifest, 
  onExportPack, 
  onExportCAD,
  onGenerateMockup,
  onDeploy, 
  onToggleLogs, 
  showLogs, 
  viewMode, 
  setViewMode, 
  onHelp 
}: HeaderProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-11 border-b border-outline bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary/20 border border-primary/40 rounded-xs flex items-center justify-center">
            <Shield className="w-3 h-3 text-primary" />
          </div>
        </div>
        
        <div className="h-8 w-px bg-outline/20" />
        
        <div className="flex bg-black/40 border border-outline rounded-sm p-1">
          <button 
            onClick={() => setViewMode('orbital')}
            className={`px-4 py-1.5 rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'orbital' ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' : 'text-foreground/40 hover:text-foreground'}`}
          >
            Orbital
          </button>
          <button 
            onClick={() => setViewMode('rack')}
            className={`px-4 py-1.5 rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'rack' ? 'bg-accent text-black shadow-[0_0_15px_rgba(240,0,255,0.4)]' : 'text-foreground/40 hover:text-foreground'}`}
          >
            Virtual Rack
          </button>
          <button 
            onClick={() => setViewMode('source')}
            className={`px-4 py-1.5 rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'source' ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'text-foreground/40 hover:text-foreground'}`}
          >
            Source
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <button 
          onClick={onHelp}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-sm hover:bg-primary/20 transition-all text-[8px] font-black uppercase tracking-widest text-primary group"
        >
          <HelpCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Manual</span>
        </button>

        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-outline rounded-sm hover:bg-red-500/10 hover:border-red-500/40 text-[8px] font-black uppercase tracking-widest text-foreground/40 hover:text-red-500/80 transition-all group"
        >
          <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-xs hover:scale-105 transition-transform text-[8px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Production</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 bg-black/90 border border-outline backdrop-blur-xl rounded-sm p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
              >
                <div className="p-2 mb-1 border-b border-outline/20">
                  <p className="text-[7px] font-mono text-foreground/30 uppercase tracking-widest">Select Deployment Mode</p>
                </div>
                
                <button 
                  onClick={() => { onExportManifest(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xs text-[8px] font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all group"
                >
                  <FileCode className="w-4 h-4 text-primary/40 group-hover:text-primary" />
                  <div className="text-left">
                    <p>Export Manifest</p>
                    <p className="text-[6px] font-mono opacity-40">Raw .acemm format</p>
                  </div>
                </button>

                <button 
                  onClick={() => { onExportPack(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xs text-[8px] font-black uppercase tracking-widest text-foreground/60 hover:text-accent transition-all group"
                >
                  <Package className="w-4 h-4 text-accent/40 group-hover:text-accent" />
                  <div className="text-left">
                    <p>Export OmegaPack</p>
                    <p className="text-[6px] font-mono opacity-40">Bundled industrial ZIP</p>
                  </div>
                </button>

                <button 
                  onClick={() => { onExportCAD(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xs text-[8px] font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all group"
                >
                  <Layers className="w-4 h-4 text-primary/40 group-hover:text-primary" />
                  <div className="text-left">
                    <p>Industrial CAD Blueprint</p>
                    <p className="text-[6px] font-mono opacity-40">Technical SVG Plan</p>
                  </div>
                </button>

                <button 
                  onClick={() => { onGenerateMockup(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xs text-[8px] font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-all group"
                >
                  <Camera className="w-4 h-4 text-primary/40 group-hover:text-primary" />
                  <div className="text-left">
                    <p>Generate Studio Render</p>
                    <p className="text-[6px] font-mono opacity-40">Photorealistic 3D Mockup</p>
                  </div>
                </button>

                <div className="h-px bg-outline/20 my-1.5" />

                <button 
                  onClick={() => { onDeploy(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-accent/10 hover:bg-accent/20 rounded-xs text-[8px] font-black uppercase tracking-widest text-accent transition-all group"
                >
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <p>Deploy to Engine</p>
                    <p className="text-[6px] font-mono opacity-60 italic text-accent/80">Live Engine Injection</p>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={onToggleLogs}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${showLogs ? 'bg-accent border-accent text-black' : 'bg-black/40 border-outline text-foreground/60 hover:border-accent/40'}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Logs</span>
        </button>
      </div>
    </header>
  );
}
