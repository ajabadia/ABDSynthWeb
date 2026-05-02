'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { OMEGA_Manifest, OMEGA_Modulation } from '../../../types/manifest';

interface ModulationGridProps {
  manifest: OMEGA_Manifest;
  onAdd: (mod: OMEGA_Modulation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onClose: () => void;
}

/**
 * ModulationGrid
 * Industrial Matrix Editor for internal signal routing.
 * Sources (Y) x Targets (X)
 */
export default function ModulationGrid({ manifest, onAdd, onRemove, onUpdate, onClose }: ModulationGridProps) {
  const allEntities = [
    ...(manifest.ui?.controls || []),
    ...(manifest.ui?.jacks || [])
  ];

  // Sources are typically anything that can generate signal (knobs, ports with role stream)
  const sources = allEntities.filter(e => e.role === 'control' || e.role === 'stream');
  // Targets are explicit mod targets or ports
  const targets = allEntities.filter(e => e.role === 'mod_target' || e.role === 'stream' || e.role === 'control');

  const getMod = (srcId: string, tgtId: string) => {
    return (manifest.modulations || []).find(m => m.source === srcId && m.target === tgtId);
  };

  const toggleMod = (srcId: string, tgtId: string) => {
    const existing = getMod(srcId, tgtId);
    if (existing) {
      onRemove(existing.id);
    } else {
      onAdd({
        id: `mod_${srcId}_${tgtId}`,
        source: srcId,
        target: tgtId,
        amount: 1.0,
        type: 'unipolar'
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-12 bg-[#050505] border border-white/10 rounded-sm shadow-[0_0_100px_rgba(0,0,0,1)] z-[300] flex flex-col overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Engineering Modulation Matrix</h2>
          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Internal Signal Orchestration — Era 7.1</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* MATRIX TABLE */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <table className="border-collapse w-full min-w-max">
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-50 bg-[#050505] p-4 text-left border-b border-r border-white/10">
                <div className="text-[8px] font-black text-white/20 uppercase rotate-[-45deg] translate-y-4">Source \ Target</div>
              </th>
              {targets.map(t => (
                <th key={t.id} className="sticky top-0 bg-[#050505] p-4 text-[9px] font-black uppercase tracking-tighter text-white/40 border-b border-white/10 min-w-[80px]">
                  <div className="rotate-[-90deg] origin-bottom-left translate-x-4 mb-2">
                    {t.label || t.id}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map(s => (
              <tr key={s.id} className="group hover:bg-white/[0.02]">
                <td className="sticky left-0 bg-[#050505] p-4 text-[9px] font-black uppercase tracking-tighter text-white/60 border-r border-white/10 group-hover:text-primary transition-colors">
                  {s.label || s.id}
                </td>
                {targets.map(t => {
                  const mod = getMod(s.id, t.id);
                  const isSelf = s.id === t.id;
                  
                  return (
                    <td 
                      key={t.id} 
                      onClick={() => !isSelf && toggleMod(s.id, t.id)}
                      className={`p-0 border border-white/5 text-center transition-all ${isSelf ? 'bg-white/[0.01] cursor-not-allowed' : 'cursor-pointer hover:bg-primary/10'}`}
                    >
                      <div className="w-full h-12 flex items-center justify-center relative">
                        {mod && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,157,0.4)]"
                          >
                            <Check className="w-2.5 h-2.5 text-black" />
                          </motion.div>
                        )}
                        {!mod && !isSelf && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-white/10" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER STATS */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/20 uppercase tracking-widest">
         <div>Active Routings: {(manifest.modulations || []).length}</div>
         <div>Contract Parity: Validated ERA 4</div>
      </div>
    </motion.div>
  );
}
