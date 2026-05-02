'use client';

import React from 'react';
import { Palette, Box, AlertCircle, Info, Layout } from 'lucide-react';
import KnobProperties from './KnobProperties';
import LedProperties from './LedProperties';
import PortProperties from './PortProperties';
import SliderProperties from './SliderProperties';
import DisplayProperties from './DisplayProperties';
import SwitchProperties from './SwitchProperties';
import SelectProperties from './SelectProperties';

import { ManifestEntity, LayoutContainer } from '../../../../types/manifest';

interface AestheticSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  containers?: LayoutContainer[];
}

export default function AestheticSection({ item, onUpdate, onHelp, containers = [] }: AestheticSectionProps) {
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
    <div className="space-y-8 pb-20">
      {/* 1. COMPONENT PLANE (TAB) */}
      <div className="space-y-3 bg-white/[0.02] border border-outline/10 p-4 rounded-xs">
        <div className="flex items-center justify-between pr-1">
          <label className="text-[8px] font-black wb-text-muted uppercase ml-1 tracking-[0.1em]">Era 7 Plane (Tab)</label>
          <button onClick={() => onHelp?.('tabs')} className="hover:text-primary transition-colors">
            <Info className="w-2.5 h-2.5 wb-text-muted opacity-60" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {['MAIN', 'FX', 'EDIT', 'MIDI', 'MOD'].map(t => (
            <button
              key={t}
              onClick={() => onUpdate({ presentation: { ...item.presentation, tab: t as any } })}
              className={`px-2 py-1 text-[7px] font-black uppercase rounded-xs border transition-all ${
                (item.presentation?.tab || 'MAIN') === t 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. ARCHITECTURAL ANCHOR (CONTAINER) */}
      <div className="space-y-4 p-4 bg-accent/5 border border-accent/10 rounded-xs">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 wb-text-muted opacity-80">
              <Layout className="w-3.5 h-3.5 text-accent" />
              <span className="text-[9px] font-black uppercase tracking-widest italic text-accent">Architectural Anchor</span>
           </div>
           {onHelp && (
             <button onClick={() => onHelp('layout')} className="p-1 text-white/20 hover:text-primary transition-colors">
               <Info className="w-3 h-3" />
             </button>
           )}
        </div>

        <div className="space-y-2">
          <div className="relative group">
            <select 
              value={item.presentation?.container || ''} 
              onChange={(e) => onUpdate({ 
                presentation: { 
                  ...item.presentation, 
                  container: e.target.value || undefined,
                  group: undefined 
                } 
              })}
              className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-3 text-[10px] font-black text-primary outline-none focus:border-accent/40 transition-all appearance-none cursor-pointer transition-colors duration-500"
            >
              <option value="">NO CONTAINER (UNBOUND)</option>
              {containers.map(c => (
                <option key={c.id} value={c.id}>{c.label.toUpperCase()} ({c.id})</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none wb-text-muted opacity-60 group-hover:opacity-40 transition-opacity">
               <Box className="w-3 h-3" />
            </div>
          </div>

          {item.presentation?.group && !item.presentation?.container && (
            <div className="mt-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded-xs flex items-center gap-2">
               <AlertCircle className="w-3 h-3 text-amber-500" />
               <span className="text-[7px] font-bold text-amber-500/80 uppercase">Legacy Group: {item.presentation.group}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. COMPONENT SPECIALIZED PROPERTIES */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1 wb-text-muted opacity-80">
           <Palette className="w-3.5 h-3.5 text-primary" />
           <span className="text-[9px] font-black uppercase tracking-widest italic">Component Aesthetics</span>
        </div>
        
        {renderSpecializedEditor()}
      </div>

      {/* SYSTEM NOTES */}
      <div className="p-4 bg-black/5 wb-outline transition-colors duration-500 rounded-xs space-y-2 border-l-2 border-l-primary/40 mt-10">
         <div className="flex items-center gap-2 text-[7px] font-black wb-text-muted uppercase tracking-widest">
            <Info className="w-2.5 h-2.5" />
            <span>Industrial Note</span>
         </div>
         <p className="text-[6px] wb-text-muted uppercase font-medium leading-relaxed">
           Era 7.2 enforces strict architectural framing. Use containers to define columns and sections for studio parity.
         </p>
      </div>
    </div>
  );
}
