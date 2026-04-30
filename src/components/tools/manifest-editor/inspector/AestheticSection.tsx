'use client';

import React from 'react';
import { Palette, Box, AlertCircle } from 'lucide-react';
import KnobProperties from './KnobProperties';
import LedProperties from './LedProperties';
import PortProperties from './PortProperties';
import SliderProperties from './SliderProperties';
import DisplayProperties from './DisplayProperties';
import SwitchProperties from './SwitchProperties';
import SelectProperties from './SelectProperties';

interface AestheticSectionProps {
  item: {
    presentation?: {
      component?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  onUpdate: (updates: any) => void;
}

export default function AestheticSection({ item, onUpdate }: AestheticSectionProps) {
  const componentType = item.presentation?.component || 'knob';

  const renderSpecializedEditor = () => {
    switch (componentType) {
      case 'knob':
        return <KnobProperties item={item} onUpdate={onUpdate} />;
      case 'led':
        return <LedProperties item={item} onUpdate={onUpdate} />;
      case 'port':
        return <PortProperties item={item} onUpdate={onUpdate} />;
      case 'slider-v':
      case 'slider-h':
        return <SliderProperties item={item} onUpdate={onUpdate} />;
      case 'display':
        return <DisplayProperties item={item} onUpdate={onUpdate} />;
      case 'select':
        return <SelectProperties item={item} onUpdate={onUpdate} />;
      case 'switch':
      case 'button':
        return <SwitchProperties item={item} onUpdate={onUpdate} />;
      default:
        return (
          <div className="p-8 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center gap-3 opacity-30">
            <Box className="w-8 h-8" />
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest">Generic Component</p>
              <p className="text-[7px] font-bold mt-1 italic uppercase">No specialized aesthetics for &apos;{componentType}&apos;</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-outline/10">
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-primary" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/80">Aesthetic Engineering</h3>
        </div>
        <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
           <span className="text-[7px] font-black text-primary uppercase tracking-tighter">{componentType}</span>
        </div>
      </div>

      {/* COMMON AESTHETICS */}
      <div className="space-y-4 bg-white/[0.02] border border-outline/10 p-4 rounded-xs">
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Era 7 Plane (Tab)</label>
          <div className="flex flex-wrap gap-1">
            {['MAIN', 'PATCHING', 'SETUP', 'MIDI', 'ADVANCED'].map(t => (
              <button
                key={t}
                onClick={() => onUpdate({ presentation: { ...item.presentation, tab: t } })}
                className={`px-2 py-1 text-[7px] font-black uppercase rounded-xs border transition-all ${
                  (item.presentation?.tab || 'MAIN') === t 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'bg-black/40 border-outline/10 text-foreground/20 hover:border-outline/30'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 pt-2">
          <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Visual Group</label>
          <input 
            type="text" 
            value={item.presentation?.group || ''} 
            onChange={(e) => onUpdate({ presentation: { ...item.presentation, group: e.target.value.toUpperCase() } })}
            className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-black text-foreground outline-none focus:border-primary/40 transition-all"
            placeholder="NONE"
          />
        </div>
      </div>

      {/* DYNAMIC SPECIALIZED EDITOR */}
      <div className="min-h-[200px]">
        {renderSpecializedEditor()}
      </div>

      {/* SYSTEM NOTES */}
      <div className="p-4 bg-black/40 border border-outline/10 rounded-xs space-y-2 border-l-2 border-l-primary/40 mt-10">
         <div className="flex items-center gap-2 text-[7px] font-black text-foreground/20 uppercase tracking-widest">
            <AlertCircle className="w-3 h-3" />
            <span>Design System Integrity</span>
         </div>
         <p className="text-[8px] text-foreground/30 leading-relaxed italic">
            Specialized editors ensure that only canonical OMEGA Era 7 variants are used. 
            All visual properties are synchronized with the hardware-accelerated render engine.
         </p>
      </div>
    </div>
  );
}
