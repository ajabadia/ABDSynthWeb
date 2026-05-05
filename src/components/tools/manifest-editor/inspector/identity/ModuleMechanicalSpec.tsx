'use client';

import React from 'react';
import { Layout, Info } from 'lucide-react';
import { OMEGA_Manifest } from '@/types/manifest';

interface ModuleMechanicalSpecProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean | undefined;
}

export default function ModuleMechanicalSpec({ manifest, onUpdate, onHelp, isHighlighted }: ModuleMechanicalSpecProps) {
  const metadata = manifest.metadata;
  const rack = metadata.rack || { slot: 'main', height_mode: 'full', hp: 12 };
  const ui = manifest.ui || {};


  const updateRackFormat = (slot: string, mode: string, height: number) => {
    onUpdate({ 
      metadata: { 
        ...metadata, 
        rack: { ...rack, slot, height_mode: mode } 
      },
      ui: {
        ...ui,
        dimensions: {
          ...(ui.dimensions || {}),
          height: height
        }
      }
    } as Partial<OMEGA_Manifest>);
  };

  return (
    <div className="space-y-4">
      <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
         <div className="flex items-center gap-2">
           <Layout className="w-3 h-3" />
           <span>Rack Mechanical Spec</span>
         </div>
         <button onClick={() => onHelp?.('dimensiones')} className="hover:text-primary transition-colors">
            <Info className="w-3 h-3" />
         </button>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5 pt-2">
          <label className="text-[8px] wb-text-muted uppercase font-bold tracking-tighter transition-colors duration-500 ml-1">Rack Aesthetic Skin</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'industrial', color: 'bg-[#1a1c1e]', label: 'Ind' },
              { id: 'carbon', color: 'bg-[#0a0a0a]', label: 'Car' },
              { id: 'glass', color: 'bg-blue-900/20', label: 'Gla' },
              { id: 'minimal', color: 'bg-white/5', label: 'Min' }
            ].map(s => (
              <button 
                key={s.id}
                onClick={() => onUpdate({ ui: { ...ui, skin: s.id } })}
                className={`group relative py-2 border rounded-xs transition-all flex flex-col items-center gap-1 ${ui.skin === s.id ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-black/5 wb-outline hover:border-outline/40'}`}
                title={s.id.toUpperCase()}
              >
                <div className={`w-3 h-3 rounded-full border border-white/10 ${s.color} shadow-sm group-hover:scale-110 transition-transform`} />
                <span className={`text-[6px] font-black uppercase ${ui.skin === s.id ? 'text-primary' : 'wb-text-muted'}`}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Industrial Format (Slot & Height)</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => updateRackFormat('main', 'full', 420)}
              className={`py-2 px-3 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${isHighlighted('slot') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''} ${rack.slot === 'main' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'}`}
            >
              <span>Main (3U)</span>
              <span className="text-[6px] wb-text-muted font-bold uppercase">Primary Synthesis Rack</span>
            </button>
            <button 
              onClick={() => updateRackFormat('top', 'compact', 140)}
              className={`py-2 px-3 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${isHighlighted('slot') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''} ${rack.slot === 'top' || rack.slot === 'upper' ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(255,140,0,0.1)]' : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'}`}
            >
              <span>Utility (1U)</span>
              <span className="text-[6px] wb-text-muted font-bold uppercase">Top Management Strip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
