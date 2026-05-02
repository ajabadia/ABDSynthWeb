'use client';

import React from 'react';
import { Plus, Trash2, ArrowRight, Activity, LayoutGrid } from 'lucide-react';
import { OMEGA_Manifest, OMEGA_Modulation } from '../../../../types/manifest';

interface ModulationSectionProps {
  manifest: OMEGA_Manifest;
  onAdd: (mod: OMEGA_Modulation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onOpenGrid?: () => void;
}

export default function ModulationSection({ manifest, onAdd, onRemove, onUpdate, onOpenGrid }: ModulationSectionProps) {
  const allEntities = [
    ...(manifest.ui?.controls || []),
    ...(manifest.ui?.jacks || [])
  ];

  const handleAdd = () => {
    const id = `mod_${Date.now()}`;
    onAdd({
      id,
      source: allEntities[0]?.id || '',
      target: allEntities[1]?.id || '',
      amount: 1.0,
      type: 'unipolar'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Internal Routings</h3>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onOpenGrid}
            className="p-1.5 bg-white/5 border border-white/10 rounded-xs hover:bg-white/10 text-white/40 transition-all flex items-center gap-2 pr-3"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[7px] font-black uppercase tracking-widest">Open Matrix</span>
          </button>
          <button 
            onClick={handleAdd}
            className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xs hover:bg-cyan-500/20 text-cyan-400 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {(manifest.modulations || []).map((mod) => (
          <div key={mod.id} className="p-3 bg-white/5 border border-white/10 rounded-sm space-y-3">
            <div className="flex items-center justify-between">
               <span className="text-[8px] font-mono text-cyan-400/60 uppercase">{mod.id}</span>
               <button onClick={() => onRemove(mod.id)} className="text-foreground/20 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3 h-3" />
               </button>
            </div>

            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2">
               <select 
                 value={mod.source}
                 onChange={(e) => onUpdate(mod.id, { source: e.target.value })}
                 className="bg-black border border-white/10 rounded-xs text-[9px] p-1 text-foreground/80 outline-none focus:border-cyan-500/40"
               >
                 {allEntities.map(e => <option key={e.id} value={e.id}>{e.label || e.id}</option>)}
               </select>
               <ArrowRight className="w-3 h-3 text-foreground/20" />
               <select 
                 value={mod.target}
                 onChange={(e) => onUpdate(mod.id, { target: e.target.value })}
                 className="bg-black border border-white/10 rounded-xs text-[9px] p-1 text-foreground/80 outline-none focus:border-cyan-500/40"
               >
                 {allEntities.map(e => <option key={e.id} value={e.id}>{e.label || e.id}</option>)}
               </select>
            </div>

            <div className="space-y-1.5">
               <div className="flex justify-between items-center px-1">
                  <label className="text-[7px] font-black uppercase text-foreground/30">Amount</label>
                  <span className="text-[8px] font-mono text-cyan-400">{mod.amount.toFixed(2)}</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.01"
                 value={mod.amount}
                 onChange={(e) => onUpdate(mod.id, { amount: parseFloat(e.target.value) })}
                 className="w-full accent-cyan-500"
               />
            </div>
          </div>
        ))}

        {(!manifest.modulations || manifest.modulations.length === 0) && (
          <div className="py-8 border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center gap-2 opacity-30">
             <Activity className="w-5 h-5" />
             <span className="text-[8px] font-bold uppercase tracking-tighter">No internal routings defined</span>
          </div>
        )}
      </div>
    </div>
  );
}
