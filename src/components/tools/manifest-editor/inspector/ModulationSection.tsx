'use client';

import React from 'react';
import { Plus, Trash2, ArrowRight, Activity, LayoutGrid, Info } from 'lucide-react';
import { OMEGA_Manifest, OMEGA_Modulation } from '@/types/manifest';

interface ModulationSectionProps {
  manifest: OMEGA_Manifest;
  onAdd: (mod: OMEGA_Modulation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onOpenModGrid?: () => void;
  onHelp?: (sectionId?: string) => void;
}

export default function ModulationSection({ manifest, onAdd, onRemove, onUpdate, onOpenModGrid, onHelp }: ModulationSectionProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  
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
    setExpandedId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Internal Routings</h3>
          <button onClick={() => onHelp?.('modulaciones')} className="hover:text-primary transition-colors ml-1">
            <Info className="w-2.5 h-2.5 opacity-20" />
          </button>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onOpenModGrid}
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

      <div className="space-y-1.5">
        {(manifest.modulations || []).map((mod) => {
          const isExpanded = expandedId === mod.id;
          
          return (
            <div 
              key={mod.id} 
              className={`bg-slate-100 dark:bg-black/40 border ${isExpanded ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.05)]' : 'border-slate-200 dark:border-white/5'} rounded-xs overflow-hidden transition-all`}
            >
              {/* COMPACT ROW (PATCHING LINE) */}
              <div 
                className="p-2.5 flex items-center gap-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-white/[0.02]"
                onClick={() => setExpandedId(isExpanded ? null : mod.id)}
              >
                <div className="shrink-0 w-1.5 h-6 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,240,255,0.3)]" style={{ opacity: 0.2 + mod.amount * 0.8 }} />
                
                <div className="flex-1 flex items-center gap-3">
                   {/* SOURCE */}
                   <div className="flex-1 space-y-1">
                      <span className="text-[6px] font-black wb-text-muted uppercase tracking-widest ml-1">Source (SRC)</span>
                      <select 
                        value={mod.source}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdate(mod.id, { source: e.target.value })}
                        className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xs text-[10px] font-bold text-cyan-600 dark:text-cyan-400/80 px-2 py-1 outline-none focus:border-cyan-500/40 transition-colors appearance-auto [color-scheme:dark]"
                      >
                        {allEntities.map(e => <option key={e.id} value={e.id}>{e.label || e.id}</option>)}
                      </select>
                   </div>

                   <ArrowRight className={`w-4 h-4 mt-4 ${mod.amount > 0 ? 'text-cyan-400' : 'text-foreground/10'} shrink-0`} />

                   {/* TARGET */}
                   <div className="flex-1 space-y-1">
                      <span className="text-[6px] font-black wb-text-muted uppercase tracking-widest ml-1">Target (DST)</span>
                      <select 
                        value={mod.target}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdate(mod.id, { target: e.target.value })}
                        className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xs text-[10px] font-bold text-slate-900 dark:text-foreground/80 px-2 py-1 outline-none focus:border-cyan-500/40 transition-colors appearance-auto [color-scheme:dark]"
                      >
                        {allEntities.map(e => <option key={e.id} value={e.id}>{e.label || e.id}</option>)}
                      </select>
                   </div>
                </div>

                <div className="shrink-0 flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-white/5 mt-3">
                   <div className="flex-col flex items-end">
                      <span className="text-[6px] font-black wb-text-muted uppercase">Amount</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">{mod.amount.toFixed(2)}</span>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onRemove(mod.id); }} 
                     className="text-slate-400 dark:text-foreground/10 hover:text-red-500 transition-colors p-1.5 bg-slate-200 dark:bg-white/5 rounded-xs"
                   >
                      <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>

              {/* EXPANDED CONTROLS */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[7px] font-black uppercase wb-text-muted">Modulation Depth</label>
                         <span className="text-[8px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-400/10 px-1 rounded-xs">{(mod.amount * 100).toFixed(0)}%</span>
                      </div>
                      <input 
                        type="range" min="0" max="1" step="0.01"
                        value={mod.amount}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdate(mod.id, { amount: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-300 dark:bg-white/5 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="w-32 space-y-1.5 group/mode relative">
                       <div className="flex items-center gap-1.5 ml-1">
                         <label className="text-[7px] font-black uppercase wb-text-muted">Engine Mode</label>
                         <Info className="w-2.5 h-2.5 text-primary/40" />
                       </div>

                       {/* TECHNICAL TOOLTIP */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#0a0a0a] border border-primary/20 rounded-xs shadow-2xl opacity-0 pointer-events-none group-hover/mode:opacity-100 transition-opacity z-50">
                          <div className="space-y-2">
                             <div>
                                <span className="text-[7px] font-black text-primary block">UNIPOLAR (0..1)</span>
                                <span className="text-[6px] text-white/40 leading-tight block uppercase">Standard control routings.</span>
                             </div>
                             <div>
                                <span className="text-[7px] font-black text-primary block">BIPOLAR (-1..1)</span>
                                <span className="text-[6px] text-white/40 leading-tight block uppercase">Signals oscillating around zero (LFOs, Pitch).</span>
                             </div>
                             <div>
                                <span className="text-[7px] font-black text-primary block">ADDITIVE (+)</span>
                                <span className="text-[6px] text-white/40 leading-tight block uppercase">Direct signal summation.</span>
                             </div>
                             <div>
                                <span className="text-[7px] font-black text-primary block">MULT (*)</span>
                                <span className="text-[6px] text-white/40 leading-tight block uppercase">Ring mod or internal VCAs.</span>
                             </div>
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0a0a0a]" />
                       </div>

                       <select 
                         value={mod.type || 'unipolar'}
                         onClick={(e) => e.stopPropagation()}
                         onChange={(e) => onUpdate(mod.id, { type: e.target.value as OMEGA_Modulation['type'] })}
                         className="w-full bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xs text-[9px] font-bold text-slate-900 dark:text-primary/80 px-2 py-1.5 outline-none focus:border-primary/40 appearance-auto [color-scheme:dark]"
                       >
                         <option value="unipolar">UNIPOLAR (0..1)</option>
                         <option value="bipolar">BIPOLAR (-1..1)</option>
                         <option value="additive">ADDITIVE (+)</option>
                         <option value="multiplicative">MULT (*)</option>
                       </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                     <span className="text-[6px] font-mono text-foreground/20 uppercase tracking-tighter">ID: {mod.id}</span>
                     <div className="flex gap-2">
                        <span className="text-[6px] font-black text-cyan-400/40 uppercase tracking-widest italic">{mod.type || 'unipolar'} engine active</span>
                     </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

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
