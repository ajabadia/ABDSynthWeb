'use client';

import React from 'react';
import { HardDrive, Palette } from 'lucide-react';

interface PortPropertiesProps {
  item: any;
  onUpdate: (updates: any) => void;
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
        <div className="grid grid-cols-2 gap-2">
           {PORT_COLORS.map(c => (
             <button
               key={c.id}
               onClick={() => updateColor(c.id)}
               className={`p-2 border rounded-xs transition-all flex items-center gap-3 ${
                 isHighlighted('color') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
               } ${
                 currentColor === c.id 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 hover:border-outline/30'
               }`}
             >
                <div className={`w-2.5 h-2.5 rounded-full ${c.color} border border-white/20`} />
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase tracking-tighter">{c.label}</p>
                  <p className="text-[6px] opacity-40 font-bold uppercase">{c.desc}</p>
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
        <div className="space-y-2">
          {materials.map((m) => (
            <button
              key={m.id}
              onClick={() => updateVariant(m.id)}
              className={`w-full p-3 border rounded-xs transition-all flex flex-col items-start gap-1 group relative overflow-hidden ${
                currentVariant === m.id 
                  ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 hover:border-outline/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[9px] font-black uppercase tracking-widest ${currentVariant === m.id ? 'text-primary' : 'text-foreground/60'}`}>
                  {m.label}
                </span>
                <span className="text-[8px] font-mono opacity-20 group-hover:opacity-100 transition-opacity">.{m.id}</span>
              </div>
              <p className="text-[7px] text-foreground/30 italic uppercase">{m.desc}</p>
              {currentVariant === m.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
