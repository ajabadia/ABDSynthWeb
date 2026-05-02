'use client';

import React from 'react';
import { Shield, Target, Eye, Layers, Info } from 'lucide-react';
import { ManifestEntity } from '../../../../types/manifest';

interface EngineeringSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
}

const EXTENDED_ROLES = [
  'control', 'input', 'output', 'telemetry', 'expert', 'stream', 'mod_source', 'mod_target'
];

export default function EngineeringSection({ item, onUpdate, onHelp }: EngineeringSectionProps) {
  const currentRole = item.role || 'control';

  const setRole = (role: string) => {
    onUpdate({ role });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* PRECISION CONTROLS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[7px] wb-text-muted transition-colors duration-500 font-bold uppercase tracking-widest flex items-center gap-1">
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
            className="w-full bg-black/5 border wb-outline transition-colors duration-500 shadow-sm"
          />
          <span className="text-[6px] wb-text-muted font-black uppercase transition-colors duration-500">Engine Decimals</span>
        </div>
        <div className="space-y-1">
          <label className="text-[7px] wb-text-muted transition-colors duration-500 font-bold uppercase tracking-widest flex items-center gap-1">
            <Eye className="w-2.5 h-2.5 text-accent" />
            <span>UI Precision</span>
          </label>
          <input 
            type="number" 
            value={item.presentation?.ui_precision ?? 2} 
            onChange={(e) => onUpdate({ presentation: { ...item.presentation, ui_precision: parseInt(e.target.value) } })}
            className="w-full bg-black/5 border wb-outline transition-colors duration-500 shadow-sm"
          />
          <span className="text-[6px] wb-text-muted font-black uppercase transition-colors duration-500">Display Formatting</span>
        </div>
      </div>

      {/* EXTENDED ROLES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[7px] wb-text-muted transition-colors duration-500 font-bold uppercase tracking-widest flex items-center gap-1">
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
                currentRole === role
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                  : 'bg-black/5 wb-outline wb-text-muted hover:wb-text transition-all duration-500 transition-colors'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="bg-black/5 wb-outline transition-colors duration-500 shadow-sm p-2 rounded-xs flex items-center gap-2">
           <Shield className="w-3 h-3 text-foreground/20" />
           <p className="text-[7px] wb-text-muted font-bold transition-colors duration-500 leading-relaxed italic">
             Roles define how the module engine and host interact with this parameter.
           </p>
        </div>
      </div>
    </div>
  );
}
