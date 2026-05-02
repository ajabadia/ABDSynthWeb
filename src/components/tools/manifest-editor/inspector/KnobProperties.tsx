'use client';

import React from 'react';
import { Box } from 'lucide-react';

interface KnobPropertiesProps {
  item: any;
  onUpdate: (updates: any) => void;
}

export default function KnobProperties({ item, onUpdate }: KnobPropertiesProps) {
  const pres = item.presentation || {};
  const currentVariant = pres.variant || 'A_cyan';

  // Helper to parse the combined variant (e.g. "A_red" -> { size: "A", color: "red" })
  const parseVariant = (v: string) => {
    const parts = v.split('_');
    return {
      size: parts[0] || 'A',
      color: parts[1] || 'cyan'
    };
  };

  const { size, color } = parseVariant(currentVariant);

  const updateVariant = (newSize: string, newColor: string) => {
    onUpdate({ 
      presentation: { 
        ...pres, 
        variant: `${newSize}_${newColor}` 
      } 
    });
  };

  const sizes = [
    { id: 'A', label: 'Large Pointer' },
    { id: 'B', label: 'Standard Grip' },
    { id: 'C', label: 'Micro Screw' },
  ];

  const colors = [
    { id: 'cyan', hex: '#00f2ff' },
    { id: 'red', hex: '#ff4444' },
    { id: 'orange', hex: '#ff8800' },
    { id: 'green', hex: '#00ff88' },
    { id: 'white', hex: '#ffffff' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 pt-2">
      <p className="text-[7px] wb-text-muted font-bold transition-colors duration-500">
        Knob aesthetics are derived from the theme and variant. 
        Technical parameters (step, range) are defined in the <span className="text-primary font-bold">Technical Contract</span>.
      </p>

      {/* SIZE / VARIANT SELECTION */}
      <div className="space-y-1">
        <label className="text-[8px] wb-text-muted font-black transition-colors duration-500">
          <Box className="w-2.5 h-2.5" />
          <span>Industrial Size</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map(s => (
            <button
              key={s.id}
              onClick={() => updateVariant(s.id, color)}
              className={`py-1.5 rounded-xs border text-[9px] font-black transition-all ${size === s.id ? 'border-primary bg-primary/20 text-primary' : 'border-outline text-foreground/40'}`}
            >
              {s.id}
            </button>
          ))}
        </div>
        <p className="text-[7px] text-foreground/30 font-medium px-1">{sizes.find(s => s.id === size)?.label}</p>
      </div>

      {/* COLOR OVERLAY SELECTION */}
      <div className="space-y-1">
        <label className="text-[8px] wb-text-muted font-black transition-colors duration-500">
          <Palette className="w-2.5 h-2.5" />
          <span>Pointer / Cap Color</span>
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colors.map(c => (
            <button
              key={c.id}
              onClick={() => updateVariant(size, c.id)}
              className={`h-6 rounded-xs border transition-all ${color === c.id ? 'border-white scale-110' : 'border-outline opacity-40 hover:opacity-100'}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <div className="bg-black/5 wb-outline transition-colors duration-500 shadow-sm">
         <div className="flex items-center justify-between">
           <span className="text-[7px] wb-text-muted font-black transition-colors duration-500">Active Variant:</span>
           <span className="text-[8px] text-primary font-mono font-black">{currentVariant}</span>
         </div>
      </div>
    </div>
  );
}

import { Palette } from 'lucide-react';
