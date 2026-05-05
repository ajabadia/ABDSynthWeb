'use client';

import React from 'react';

interface ViewModeSelectorProps {
  viewMode: 'orbital' | 'rack' | 'source';
  setViewMode: (mode: 'orbital' | 'rack' | 'source') => void;
}

export default function ViewModeSelector({ viewMode, setViewMode }: ViewModeSelectorProps) {
  return (
    <div className="flex wb-surface border wb-outline rounded-sm p-1 transition-colors duration-500">
      <button 
        onClick={() => setViewMode('orbital')}
        className={`px-4 py-1.5 rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'orbital' ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'wb-text-muted hover:wb-text'}`}
      >
        Orbital
      </button>
      <button 
        onClick={() => setViewMode('rack')}
        className={`px-4 py-1.5 rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'rack' ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'wb-text-muted hover:wb-text'}`}
      >
        Virtual Rack
      </button>
      <button 
        onClick={() => setViewMode('source')}
        className={`px-4 py-1.5 rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${viewMode === 'source' ? 'bg-foreground text-background shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'wb-text-muted hover:wb-text'}`}
      >
        Source
      </button>
    </div>
  );
}
