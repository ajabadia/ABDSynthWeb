'use client';

import React from 'react';
import { Palette, Activity, Hash } from 'lucide-react';

interface StylingSectionProps {
  item: any;
  onUpdate: (updates: any) => void;
}

export default function StylingSection({ item, onUpdate }: StylingSectionProps) {
  const pres = item.presentation || {};

  const variants = [
    { id: 'A', label: 'Size A (Standard)' },
    { id: 'B', label: 'Size B (Compact)' },
    { id: 'C', label: 'Size C (Micro)' },
    { id: 'A_cyan', label: 'Size A - Cyan' },
    { id: 'A_orange', label: 'Size A - Orange' },
    { id: 'A_red', label: 'Size A - Red' },
    { id: 'B_cyan', label: 'Size B - Cyan' },
    { id: 'B_orange', label: 'Size B - Orange' },
    { id: 'B_red', label: 'Size B - Red' },
    { id: 'C_cyan', label: 'Size C - Cyan' },
    { id: 'C_green', label: 'Size C - Green' },
  ];

  return (
    <section className="space-y-4">
      <div className="text-[9px] font-bold wb-text-muted uppercase tracking-widest border-b wb-outline pb-2 flex items-center gap-2 transition-colors duration-500">
        <Palette className="w-3 h-3 text-primary" />
        <span>Industrial Styling & Behavior</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* VARIANT (Size + Style) */}
        <div className="space-y-1">
          <label className="text-[8px] wb-text-muted uppercase font-bold tracking-tighter transition-colors duration-500">Official Variant</label>
          <select 
            value={pres.variant || 'A'} 
            onChange={(e) => onUpdate({ presentation: { ...pres, variant: e.target.value } })}
            className="w-full wb-surface-inset border wb-outline rounded-sm p-2 text-[10px] font-bold text-primary outline-none transition-colors duration-500 shadow-sm"
          >
            {variants.map(v => (
              <option key={v.id} value={v.id}>{v.label}</option>
            ))}
          </select>
          <p className="text-[7px] wb-text-muted font-bold italic mt-1 transition-colors duration-500">Note: Variants define both physical dimensions and color-coding.</p>
        </div>

        {/* UNIT & PRECISION */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[8px] wb-text-muted uppercase font-bold tracking-tighter transition-colors duration-500">Unit Suffix</label>
            <input 
              type="text" 
              value={pres.unit || ''} 
              onChange={(e) => onUpdate({ presentation: { ...pres, unit: e.target.value } })}
              placeholder="Hz, dB, %"
              className="w-full wb-surface-inset border wb-outline rounded-sm p-2 text-[10px] font-mono text-foreground outline-none transition-colors duration-500 shadow-sm focus:border-primary/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] wb-text-muted uppercase font-bold tracking-tighter transition-colors duration-500 flex items-center gap-1">
              <Hash className="w-2.5 h-2.5" />
              <span>Decimals</span>
            </label>
            <input 
              type="number" 
              min="0"
              max="4"
              value={pres.precision || 2} 
              onChange={(e) => onUpdate({ presentation: { ...pres, precision: parseInt(e.target.value) } })}
              className="w-full wb-surface-inset border wb-outline rounded-sm p-2 text-[10px] font-mono text-foreground outline-none transition-colors duration-500 shadow-sm"
            />
          </div>
        </div>

        {/* STEP BEHAVIOR */}
        <div className="space-y-1">
          <label className="text-[8px] wb-text-muted uppercase font-bold tracking-tighter transition-colors duration-500 flex items-center gap-1">
            <Activity className="w-2.5 h-2.5" />
            <span>Incremental Step (Resolution)</span>
          </label>
          <input 
            type="number" 
            step="0.001"
            value={pres.step || 0.01} 
            onChange={(e) => onUpdate({ presentation: { ...pres, step: parseFloat(e.target.value) } })}
            className="w-full wb-surface-inset border wb-outline rounded-sm p-2 text-[10px] font-mono text-foreground outline-none transition-colors duration-500 shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}
