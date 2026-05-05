'use client';

import React from 'react';
import { Move, Grid3X3, Info } from 'lucide-react';
import { ManifestEntity, LayoutContainer } from '@/types/manifest';
import ContainerSelector from './ContainerSelector';

interface SpatialSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  highlightPath?: string | null;
  containers?: LayoutContainer[];
}

export default function SpatialSection({ item, onUpdate, onHelp, highlightPath, containers = [] }: SpatialSectionProps) {
  const pos = item.pos || { x: 0, y: 0 };
  const pres = item.presentation || {};
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  return (
    <div className="grid grid-cols-1 gap-6 pt-2">
      {/* COORDINATES */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className={`text-[8px] uppercase font-bold tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('pos') ? 'text-amber-500' : 'text-foreground/60'}`}>
              <Move className="w-2.5 h-2.5" />
              <span>Absolute X</span>
            </label>
            <button onClick={() => onHelp?.('spatial')} className="hover:text-primary transition-colors">
              <Info className="w-2.5 h-2.5 opacity-20" />
            </button>
          </div>
          <input 
            type="number" 
            value={pos.x || 0} 
            onChange={(e) => onUpdate({ pos: { ...pos, x: parseFloat(e.target.value) } })}
            className={`w-full bg-black/40 border ${isHighlighted('pos') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'border-outline'} rounded-sm p-2 text-[11px] font-mono text-foreground outline-none focus:border-primary/40 transition-all transition-colors duration-500`}
          />
        </div>
        <div className="space-y-1">
          <label className={`text-[8px] uppercase font-bold tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('pos') ? 'text-amber-500' : 'text-foreground/60'}`}>
            <Move className="w-2.5 h-2.5" />
            <span>Absolute Y</span>
          </label>
          <input 
            type="number" 
            value={pos.y || 0} 
            onChange={(e) => onUpdate({ pos: { ...pos, y: parseFloat(e.target.value) } })}
            className={`w-full bg-black/40 border ${isHighlighted('pos') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'border-outline'} rounded-sm p-2 text-[11px] font-mono text-foreground outline-none focus:border-primary/40 transition-all transition-colors duration-500`}
          />
        </div>
      </div>

      {/* GRID LOGIC (Era 6 Compatibility) */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[8px] text-foreground/60 uppercase font-bold tracking-tighter flex items-center gap-1">
            <Grid3X3 className="w-2.5 h-2.5" />
            <span>Column Span</span>
          </label>
          <button onClick={() => onHelp?.('dimensiones')} className="hover:text-primary transition-colors">
            <Info className="w-2.5 h-2.5 opacity-20" />
          </button>
        </div>
        <select 
          value={pres.colSpan || 1} 
          onChange={(e) => onUpdate({ presentation: { ...pres, colSpan: parseInt(e.target.value) } })}
          className="w-full bg-black/40 border border-outline rounded-sm p-2 text-[10px] font-bold text-foreground outline-none transition-colors duration-500 [color-scheme:dark]"
        >
          <option value={1}>1 Column (Standard)</option>
          <option value={2}>2 Columns (Wide)</option>
          <option value={3}>3 Columns (Full Width)</option>
        </select>
      </div>

      <div className="h-px bg-white/5" />

      <ContainerSelector 
        item={item} 
        onUpdate={onUpdate} 
        containers={containers} 
        onHelp={onHelp} 
        highlightPath={highlightPath} 
      />

      <div className="p-4 bg-primary/5 border wb-outline rounded-xs space-y-2 border-l-4 border-l-primary/60 mt-8 mb-10 transition-colors duration-500">
         <div className="flex items-center gap-2 text-[8px] font-black text-primary uppercase tracking-widest">
            <Info className="w-3 h-3" />
            <span>Industrial Note</span>
         </div>
         <p className="text-[9px] wb-text font-bold uppercase leading-relaxed tracking-tight">
           Era 7.2 enforces strict architectural framing. Use containers to define columns and sections for studio parity.
         </p>
      </div>
    </div>
  );
}
