'use client';

import React from 'react';
import { Target, Maximize, Circle } from 'lucide-react';

import { ManifestEntity } from '@/types/manifest';

interface LedPropertiesProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
}

export default function LedProperties({ item, onUpdate }: LedPropertiesProps) {
  const pres = item.presentation || {};
  const currentVariant = pres.variant || 'A_cyan';

  // Helper to manage complex variants (e.g. "B_red_3mm")
  const getExtraParam = (paramName: string) => {
    return currentVariant.includes(paramName) ? paramName : 'default';
  };

  const addExtraParam = (newParam: string, group: string[]) => {
    let base = currentVariant;
    // Remove existing params from the same group
    group.forEach(p => {
      base = base.replace(`_${p}`, '');
    });
    // Add the new one if it's not default
    const finalVariant = newParam === 'default' ? base : `${base}_${newParam}`;
    onUpdate({ presentation: { ...pres, variant: finalVariant } });
  };

  const sizes = ['3mm', '5mm', '8mm'];
  const shapes = ['square', 'rect'];

  return (
    <div className="grid grid-cols-1 gap-4 pt-2">
      <p className="text-[7px] text-foreground/40 italic">
        Specific LED overrides appended to variant: <span className="text-primary font-mono">{currentVariant}</span>
      </p>

      {/* LED SIZE OVERRIDE */}
      <div className="space-y-1">
        <label className="text-[8px] text-foreground/60 uppercase font-bold tracking-tighter flex items-center gap-1">
          <Maximize className="w-2.5 h-2.5" />
          <span>Physical Diameter</span>
        </label>
        <div className="flex gap-2">
          {['default', ...sizes].map(s => (
            <button
              key={s}
              onClick={() => addExtraParam(s, sizes)}
              className={`flex-1 py-1 rounded-xs border text-[8px] font-black uppercase transition-all ${getExtraParam(s) === s || (s === 'default' && !sizes.some(x => currentVariant.includes(x))) ? 'border-primary bg-primary/20 text-primary' : 'border-outline text-foreground/40'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* LED SHAPE OVERRIDE */}
      <div className="space-y-1">
        <label className="text-[8px] text-foreground/60 uppercase font-bold tracking-tighter flex items-center gap-1">
          <Circle className="w-2.5 h-2.5" />
          <span>Lens Shape</span>
        </label>
        <div className="flex gap-2">
          {['default', ...shapes].map(s => (
            <button
              key={s}
              onClick={() => addExtraParam(s, shapes)}
              className={`flex-1 py-1 rounded-xs border text-[8px] font-black uppercase transition-all ${getExtraParam(s) === s || (s === 'default' && !shapes.some(x => currentVariant.includes(x))) ? 'border-primary bg-primary/20 text-primary' : 'border-outline text-foreground/40'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* GLOW / STYLE */}
      <div className="space-y-1">
        <label className="text-[8px] text-foreground/60 uppercase font-bold tracking-tighter flex items-center gap-1">
          <Target className="w-2.5 h-2.5" />
          <span>Diffusion Style</span>
        </label>
        <select 
          className="w-full bg-black/40 border border-outline rounded-sm p-2 text-[10px] font-bold text-foreground outline-none opacity-50"
          disabled
        >
          <option>Controlled by Skin (Global)</option>
        </select>
      </div>
    </div>
  );
}
