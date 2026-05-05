'use client';

import React from 'react';
import { Box, Palette } from 'lucide-react';

import { ManifestEntity } from '@/types/manifest';

interface SliderPropertiesProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
}

export default function SliderProperties({ item, onUpdate }: SliderPropertiesProps) {
  const pres = item.presentation || {};
  const currentVariant = pres.variant || 'A_silver';

  const parseVariant = (v: string) => {
    const parts = v.split('_');
    return {
      size: parts[0] || 'A',
      cap: parts[1] || 'silver'
    };
  };

  const { size, cap } = parseVariant(currentVariant);

  const updateVariant = (newSize: string, newCap: string) => {
    onUpdate({ presentation: { ...pres, variant: `${newSize}_${newCap}` } });
  };

  const sizes = [
    { id: 'A', label: 'Long Throw', desc: 'Precision 100mm fader' },
    { id: 'B', label: 'Short Throw', desc: 'Compact 30mm fader' },
  ];

  const caps = [
    { id: 'silver', hex: '#cccccc', label: 'Silver' },
    { id: 'black', hex: '#222222', label: 'Black' },
    { id: 'red', hex: '#ff4444', label: 'Alert' },
    { id: 'blue', hex: '#00f0ff', label: 'Signal' },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-3">
        <label className="text-[8px] text-foreground/60 uppercase font-black tracking-widest flex items-center gap-2">
          <Box className="w-3 h-3 text-primary" />
          <span>Fader Travel Length</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((s) => (
            <button
              key={s.id}
              onClick={() => updateVariant(s.id, cap)}
              className={`p-3 border rounded-xs transition-all flex flex-col items-center gap-1 ${
                size === s.id 
                  ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10'
              }`}
            >
              <span className={`text-[10px] font-black uppercase ${size === s.id ? 'text-primary' : 'text-foreground/40'}`}>
                {s.label}
              </span>
              <span className="text-[6px] text-foreground/30 font-bold uppercase">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[8px] text-foreground/60 uppercase font-black tracking-widest flex items-center gap-2">
          <Palette className="w-3 h-3 text-primary" />
          <span>Cap Style & Color</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {caps.map((c) => (
            <button
              key={c.id}
              onClick={() => updateVariant(size, c.id)}
              className={`p-2 border rounded-xs transition-all flex flex-col items-center gap-2 ${
                cap === c.id 
                  ? 'border-primary/60 bg-primary/10 text-primary' 
                  : 'border-outline/10 bg-black/40 text-foreground/40'
              }`}
            >
              <div className="w-full h-3 rounded-xs" style={{ backgroundColor: c.hex }} />
              <span className="text-[6px] font-black uppercase tracking-tighter">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
