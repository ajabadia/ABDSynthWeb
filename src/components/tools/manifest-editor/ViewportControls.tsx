'use client';

import React from 'react';
import { Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Maximize, Target } from 'lucide-react';

interface ViewportControlsProps {
  zoom: number;
  onZoom: (delta: number) => void;
  onPan: (dx: number, dy: number) => void;
  onReset: () => void;
  onFit: () => void;
}

/**
 * ViewportControls
 * Industrial floating toolbar for viewport navigation.
 */
export default function ViewportControls({ zoom, onZoom, onPan, onReset, onFit }: ViewportControlsProps) {
  return (
    <div className="absolute bottom-6 right-6 flex items-center gap-3 z-[100]">
      {/* ZOOM GROUP */}
      <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/10 rounded-xs p-1 shadow-2xl">
        <button 
          onClick={() => onZoom(-0.1)} 
          className="p-1.5 hover:bg-white/5 text-foreground/40 hover:text-primary transition-all rounded-xs"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="px-3 min-w-[50px] text-center border-x border-white/5">
          <span className="text-[9px] font-mono font-black text-primary/80">{Math.round(zoom * 100)}%</span>
        </div>
        <button 
          onClick={() => onZoom(0.1)} 
          className="p-1.5 hover:bg-white/5 text-foreground/40 hover:text-primary transition-all rounded-xs"
          title="Zoom In"
        >
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
          <button onClick={onReset} className="p-1 hover:bg-white/5 text-primary transition-all rounded-xs" title="Center View">
            <Target className="w-3 h-3" />
          </button>
          <button onClick={() => onPan(-50, 0)} className="p-1 hover:bg-white/5 text-foreground/20 hover:text-primary transition-all rounded-xs">
            <ChevronRight className="w-3 h-3" />
          </button>

          <div />
          <button onClick={() => onPan(0, -50)} className="p-1 hover:bg-white/5 text-foreground/20 hover:text-primary transition-all rounded-xs">
            <ChevronDown className="w-3 h-3" />
          </button>
          <button onClick={onFit} className="p-1 hover:bg-white/5 text-accent transition-all rounded-xs" title="Fit to Screen">
            <Maximize className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
