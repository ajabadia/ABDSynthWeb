'use client';
 
import React from 'react';
import { Box } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';

interface ProtocolFieldsProps {
  item: ManifestEntity;
  isHighlighted: (key: string) => boolean | undefined;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
}

export function ProtocolFields({ item, isHighlighted, onUpdate }: ProtocolFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
         <Box className="w-3 h-3 text-accent" />
         <span>Technical Protocol</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Normalizer Type</label>
          <select 
            value={item.type || 'float'} 
            onChange={(e) => onUpdate({ type: e.target.value })}
            className={`w-full bg-black/5 border ${isHighlighted('type') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none appearance-none transition-colors duration-500 [color-scheme:dark]`}
          >
            <option value="float">Float (0.0 - 1.0)</option>
            <option value="int">Integer (Stepped)</option>
            <option value="bool">Boolean (Binary)</option>
            <option value="string">String (Metadata)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Step (Resolution)</label>
          <input 
            type="number" 
            step="0.001"
            value={item.presentation?.step || 0.01} 
            onChange={(e) => onUpdate({ presentation: { ...item.presentation, step: parseFloat(e.target.value) } })}
            className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Unit Suffix</label>
          <input 
            type="text" 
            placeholder="Hz, dB, %"
            value={item.unit || ''} 
            onChange={(e) => onUpdate({ unit: e.target.value })}
            className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Display Decimals</label>
          <input 
            type="number" 
            min="0" 
            max="4"
            value={item.presentation?.precision ?? 2} 
            onChange={(e) => onUpdate({ presentation: { ...item.presentation, precision: parseInt(e.target.value) } })}
            className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
}
