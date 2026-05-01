'use client';

import React from 'react';
import { Download, Shield, RotateCcw, Terminal, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onExport: () => void;
  onToggleLogs: () => void;
  showLogs: boolean;
  viewMode: 'orbital' | 'rack' | 'source';
  setViewMode: (mode: 'orbital' | 'rack' | 'source') => void;
  onHelp: () => void;
}

export default function Header({ onReset, onExport, onToggleLogs, showLogs, viewMode, setViewMode, onHelp }: HeaderProps) {
  return (
    <header className="h-14 border-b border-outline bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/20 border border-primary/40 rounded-xs flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
          <h1 className="text-[10px] font-black tracking-[0.2em] text-foreground/90 uppercase">
            OMEGA Manifest Editor <span className="text-primary/40 font-mono ml-2">v7.1</span>
          </h1>
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

        <button 
          onClick={onExport} 
          className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-xs hover:scale-105 transition-transform text-[8px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Manifest</span>
        </button>

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
