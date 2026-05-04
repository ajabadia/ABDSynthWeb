'use client';

import React from 'react';
import { Shield, Target, Eye, Layers, Info, Hash } from 'lucide-react';
import { ManifestEntity } from '../../../../types/manifest';

interface EngineeringSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  highlightPath?: string | null;
}

const EXTENDED_ROLES = [
  'control', 'input', 'output', 'telemetry', 'expert', 'stream', 'mod_source', 'mod_target'
];

const UNITS = ['', 'Hz', 'kHz', 'ms', 'sec', 'dB', 'semi', '%', 'bpm', 'samples', 'midi', 'raw', 'hex'];

export default function EngineeringSection({ item, onUpdate, onHelp, highlightPath }: EngineeringSectionProps) {
  const currentRole = item.role || 'control';
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  const setRole = (role: string) => {
    onUpdate({ role });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* PRECISION & UNITS */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[7px] wb-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                <Target className="w-2.5 h-2.5 text-primary" />
                <span>DSP Precision</span>
              </label>
              <button onClick={() => onHelp?.('precision')} className="hover:text-primary transition-colors">
                <Info className="w-2.5 h-2.5 opacity-20" />
              </button>
            </div>
            <input 
              type="number" 
              value={item.presentation?.precision ?? 6} 
              onChange={(e) => onUpdate({ presentation: { ...item.presentation, precision: parseInt(e.target.value) } })}
              className="w-full bg-black/5 border wb-outline px-2 py-1.5 text-[10px] wb-text outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[7px] wb-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
              <Eye className="w-2.5 h-2.5 text-accent" />
              <span>UI Precision</span>
            </label>
            <input 
              type="number" 
              value={item.presentation?.ui_precision ?? 2} 
              onChange={(e) => onUpdate({ presentation: { ...item.presentation, ui_precision: parseInt(e.target.value) } })}
              className="w-full bg-black/5 border wb-outline px-2 py-1.5 text-[10px] wb-text outline-none focus:border-primary/40 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={`text-[7px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${isHighlighted('unit') ? 'text-amber-500' : 'wb-text-muted'}`}>
            <Hash className="w-2.5 h-2.5" />
            <span>Engineering Unit</span>
          </label>
          <div className="relative group">
            <select 
              value={item.unit || ''} 
              onChange={(e) => onUpdate({ unit: e.target.value })}
              className={`w-full bg-zinc-900 border ${isHighlighted('unit') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold text-white outline-none appearance-none transition-all cursor-pointer`}
            >
              {UNITS.map(u => (
                <option key={u} value={u} className="bg-zinc-900 text-white">{u || '-- NONE (Unitless) --'}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] text-primary">▼</span>
            </div>
          </div>
          <p className="text-[6px] wb-text-muted font-bold uppercase tracking-tighter ml-1">
            Required for industrial DSP normalization and label formatting.
          </p>
        </div>
      </div>

      {/* EXTENDED ROLES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={`text-[7px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isHighlighted('role') ? 'text-amber-500' : 'wb-text-muted'}`}>
            <Layers className="w-2.5 h-2.5" />
            <span>Functional Roles</span>
          </label>
          <button onClick={() => onHelp?.('logic')} className="hover:text-primary transition-colors">
            <Info className="w-2.5 h-2.5 opacity-20" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXTENDED_ROLES.map(role => (
            <button
              key={role}
              onClick={() => setRole(role)}
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
  );
}
