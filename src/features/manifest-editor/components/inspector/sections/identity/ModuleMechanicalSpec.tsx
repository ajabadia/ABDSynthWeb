'use client';

import React from 'react';
import { Ruler } from 'lucide-react';
import { OMEGA_Manifest } from '@/types/manifest';
import InspectorCollapsible from '../../shared/InspectorCollapsible';

interface ModuleMechanicalSpecProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  isHighlighted: (key: string) => boolean | undefined;
  onHelp?: (id: string) => void;
}

export default function ModuleMechanicalSpec({ manifest, onUpdate }: Omit<ModuleMechanicalSpecProps, 'isHighlighted' | 'onHelp'>) {
  const metadata = manifest.metadata;
  const rack = (metadata.rack || {}) as { 
    depth?: number; 
    units?: string; 
    power?: { plus12?: number; minus12?: number } 
  };

  const updateRack = (field: string, value: unknown) => {
    onUpdate({ 
      metadata: { 
        ...metadata, 
        rack: { ...rack, [field]: value } 
      } 
    } as Partial<OMEGA_Manifest>);
  };

  return (
    <InspectorCollapsible title="Mechanical Specifications" icon={Ruler}>
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Panel Depth (mm)</label>
            <input 
              type="number" 
              value={(rack.depth as number) || 25} 
              onChange={(e) => updateRack('depth', parseInt(e.target.value) || 0)}
              className="w-full wb-surface-subtle border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Mounting Units</label>
            <div className="flex bg-black/20 rounded-xs border wb-outline overflow-hidden">
               {['3U', '1U'].map(u => (
                 <button
                   key={u}
                   onClick={() => updateRack('units', u)}
                   className={`flex-1 py-2 text-[10px] font-black transition-all ${rack.units === u ? 'bg-primary/20 text-primary' : 'wb-text-muted hover:text-white'}`}
                 >
                   {u}
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
           <div className="space-y-1.5">
              <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">+12V (mA)</label>
              <input 
                type="number" 
                value={(rack.power?.plus12 as number) || 0} 
                onChange={(e) => updateRack('power', { ...(rack.power || {}), plus12: parseInt(e.target.value) || 0 })}
                className="w-full wb-surface-subtle border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all"
              />
           </div>
           <div className="space-y-1.5">
              <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">-12V (mA)</label>
              <input 
                type="number" 
                value={(rack.power?.minus12 as number) || 0} 
                onChange={(e) => updateRack('power', { ...(rack.power || {}), minus12: parseInt(e.target.value) || 0 })}
                className="w-full wb-surface-subtle border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all"
              />
           </div>
        </div>
      </div>
    </InspectorCollapsible>
  );
}
