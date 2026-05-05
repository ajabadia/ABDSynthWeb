'use client';

import React from 'react';
import { Fingerprint, Info } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest } from '@/types/manifest';

interface EntityIdentityProps {
  entity: ManifestEntity;
  rootManifest?: OMEGA_Manifest;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean | undefined;
}

const UNITS = ['', 'Hz', 'kHz', 'ms', 'sec', 'dB', 'semi', '%', 'bpm', 'samples', 'midi', 'raw', 'hex'];
const EXTENDED_ROLES = ['control', 'input', 'output', 'telemetry', 'expert', 'stream', 'mod_source', 'mod_target'];

import { Target, Eye, Hash, Layers } from 'lucide-react';

export default function EntityIdentity({ entity, rootManifest, onUpdate, onHelp, isHighlighted }: EntityIdentityProps) {
  const getAuthority = () => {
    if (!rootManifest) return null;
    const cIdx = (rootManifest.ui?.controls || []).findIndex(c => c.id === entity.id);
    if (cIdx !== -1) return { type: 'ParamId', value: cIdx };
    const jIdx = (rootManifest.ui?.jacks || []).findIndex(j => j.id === entity.id);
    if (jIdx !== -1) return { type: 'PortId', value: jIdx };
    return null;
  };
  const auth = getAuthority();
  const currentRole = entity.role || 'control';

  return (
    <div className="space-y-8 pt-2 pb-6">
      {/* SECTION 1: IDENTITY */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
           <div className="flex items-center gap-2">
              <Fingerprint className="w-3 h-3 text-primary" />
              <span>Entity Identification</span>
           </div>
           <div className="flex items-center gap-2">
              {auth && (
                <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                  <span className="text-[6px] text-primary font-black">{auth.type}:</span>
                  <span className="text-[6px] text-primary font-mono font-bold">#{auth.value}</span>
                </div>
              )}
              <button onClick={() => onHelp?.('cells')} className="hover:text-primary transition-colors">
                 <Info className="w-3 h-3 opacity-20 hover:opacity-100" />
              </button>
           </div>
        </div>

        {/* HORIZONTAL ID & LABEL */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[7px] font-black wb-text-muted uppercase ml-1 tracking-widest">Canonical ID</label>
            <input 
              type="text" 
              value={entity.id} 
              onChange={(e) => onUpdate({ id: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('id') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all font-mono [color-scheme:dark]`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[7px] font-black wb-text-muted uppercase ml-1 tracking-widest">Display Label</label>
            <input 
              type="text" 
              value={entity.label || ''} 
              onChange={(e) => onUpdate({ label: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('label') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none focus:border-primary/40 transition-all [color-scheme:dark]`}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: ENGINEERING (MERGED) */}
      <div className="space-y-5">
         <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
            <Target className="w-3 h-3 text-accent" />
            <span>Engineering & Units</span>
         </div>

         {/* TRIPLE ROW: PRECISION & UNITS */}
         <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={`text-[7px] font-bold uppercase tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('precision') ? 'text-amber-500' : 'wb-text-muted'}`}>
                <Target className="w-2.5 h-2.5 text-primary/40" />
                <span>DSP Prec.</span>
              </label>
              <input 
                type="number" 
                value={entity.presentation?.precision ?? 6} 
                onChange={(e) => onUpdate({ presentation: { ...entity.presentation, precision: parseInt(e.target.value) } })}
                className={`w-full bg-black/5 border ${isHighlighted('precision') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} px-2 py-1.5 text-[10px] wb-text outline-none focus:border-primary/40 transition-all [color-scheme:dark]`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[7px] font-bold uppercase tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('ui_precision') ? 'text-amber-500' : 'wb-text-muted'}`}>
                <Eye className="w-2.5 h-2.5 text-accent/40" />
                <span>UI Prec.</span>
              </label>
              <input 
                type="number" 
                value={entity.presentation?.ui_precision ?? 2} 
                onChange={(e) => onUpdate({ presentation: { ...entity.presentation, ui_precision: parseInt(e.target.value) } })}
                className={`w-full bg-black/5 border ${isHighlighted('ui_precision') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} px-2 py-1.5 text-[10px] wb-text outline-none focus:border-primary/40 transition-all [color-scheme:dark]`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[7px] font-bold uppercase tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('unit') ? 'text-amber-500' : 'wb-text-muted'}`}>
                <Hash className="w-2.5 h-2.5 text-white/20" />
                <span>Unit</span>
              </label>
              <select 
                value={entity.unit || ''} 
                onChange={(e) => onUpdate({ unit: e.target.value })}
                className={`w-full bg-black/5 border ${isHighlighted('unit') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} px-2 py-1.5 text-[9px] font-bold wb-text outline-none focus:border-primary/40 transition-all appearance-auto [color-scheme:dark]`}
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u || '-- none --'}</option>
                ))}
              </select>
            </div>
         </div>

         {/* FUNCTIONAL ROLES */}
         <div className="space-y-3">
            <label className={`text-[7px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isHighlighted('role') ? 'text-amber-500' : 'wb-text-muted'}`}>
              <Layers className="w-2.5 h-2.5 opacity-40" />
              <span>Functional Role</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EXTENDED_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => onUpdate({ role })}
                  className={`px-2 py-1 text-[7px] font-black uppercase tracking-tighter border rounded-full transition-all ${
                    isHighlighted('role') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
                  } ${
                    currentRole === role
                      ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                      : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
