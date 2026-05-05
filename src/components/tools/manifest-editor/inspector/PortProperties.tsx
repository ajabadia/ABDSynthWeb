'use client';

import React from 'react';
import { HardDrive, Palette } from 'lucide-react';

import { ManifestEntity } from '@/types/manifest';

interface PortPropertiesProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  highlightPath?: string | null;
}

const PORT_COLORS = [
  { id: 'B_cyan', label: 'Cyan', desc: 'Audio / CV', color: 'bg-cyan-400' },
  { id: 'neon_amber', label: 'Amber', desc: 'Modulation', color: 'bg-amber-400' },
  { id: 'white', label: 'White', desc: 'Gate / Trigger', color: 'bg-white' },
  { id: 'orange', label: 'Orange', desc: 'MIDI / Clock', color: 'bg-orange-500' },
  { id: 'green', label: 'Green', desc: 'Aux / Side', color: 'bg-green-500' },
  { id: 'red', label: 'Red', desc: 'Master / Direct', color: 'bg-red-500' },
];

export default function PortProperties({ item, onUpdate, highlightPath }: PortPropertiesProps) {
  const pres = item.presentation || {};
  const currentVariant = pres.variant || 'plastic';
  const currentColor = pres.color || '';
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  const updateVariant = (v: string) => {
    onUpdate({ presentation: { ...pres, variant: v } });
  };

  const updateColor = (c: string) => {
    onUpdate({ presentation: { ...pres, color: c } });
  };

  const materials = [
    { id: 'plastic', label: 'ABS Plastic', desc: 'Standard industrial jack' },
    { id: 'metal', label: 'Chrome Steel', desc: 'Premium heavy-duty' },
    { id: 'gold', label: 'Gold Plated', desc: 'Audiophile grade' },
  ];

  return (
    <div className="space-y-8 pt-2">
      {/* 1. PORT COLOR (Audit Required) */}
      <div className="space-y-3">
        <label className={`text-[8px] uppercase font-black tracking-widest flex items-center gap-2 transition-colors ${isHighlighted('color') ? 'text-amber-500' : 'text-foreground/60'}`}>
          <Palette className="w-3 h-3 text-primary" />
          <span>Industrial Color Coding</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
           {PORT_COLORS.map(c => (
             <button
               key={c.id}
               onClick={() => updateColor(c.id)}
               className={`p-1.5 border rounded-xs transition-all flex flex-col items-center gap-1 ${
                 isHighlighted('color') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
               } ${
                 currentColor === c.id 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 hover:border-outline/30'
               }`}
             >
                <div className={`w-2 h-2 rounded-full ${c.color} border border-white/20`} />
                <div className="text-center">
                  <p className="text-[7px] font-black uppercase tracking-tighter leading-tight">{c.label}</p>
                  <p className="text-[5px] opacity-30 font-bold uppercase leading-none">{c.desc.split(' / ')[0]}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* 2. MECHANICAL MATERIAL */}
      <div className="space-y-3">
        <label className="text-[8px] text-foreground/60 uppercase font-black tracking-widest flex items-center gap-2">
          <HardDrive className="w-3 h-3 text-primary" />
          <span>Socket Mechanical Material</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => updateVariant(m.id)}
              className={`p-2 border rounded-xs transition-all flex flex-col items-center gap-0.5 group relative overflow-hidden ${
                currentVariant === m.id 
                  ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 hover:border-outline/30'
              }`}
            >
              <span className={`text-[7px] font-black uppercase tracking-tighter text-center ${currentVariant === m.id ? 'text-primary' : 'text-foreground/60'}`}>
                {m.label.split(' ')[0]}
                <br/>
                {m.label.split(' ')[1]}
              </span>
              <p className="text-[5px] text-foreground/20 italic uppercase font-bold">{m.id}</p>
              {currentVariant === m.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
