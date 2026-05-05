'use client';

import React from 'react';
import { Move, Maximize2, Box, Type, Layers } from 'lucide-react';
import { LayoutContainer, ContainerVariant, ContainerSizeUnit, OMEGA_Manifest } from '@/types/manifest';
import AssetSelector from '../shared/AssetSelector';

interface ContainerFormProps {
  container: LayoutContainer;
  onUpdate: (id: string, updates: Partial<LayoutContainer>) => void;
  manifest: OMEGA_Manifest;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function ContainerForm({ container, onUpdate, manifest, resolveAsset }: ContainerFormProps) {
  const variants: ContainerVariant[] = ['default', 'header', 'section', 'panel', 'inset', 'minimal'];
  const widthUnits: ContainerSizeUnit[] = ['full', '3/4', '2/3', '1/2', '1/3', '1/4'];

  return (
    <div className="p-4 pt-0 space-y-4">
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/5">
        {/* POSITION */}
        <div className="space-y-2">
           <div className="flex items-center gap-2 opacity-40">
             <Move className="w-2.5 h-2.5" />
             <span className="text-[7px] font-black uppercase tracking-widest">Base Coordinates</span>
           </div>
           <div className="flex gap-2">
              <div className="flex-1 flex items-center bg-black/40 border border-outline/10 rounded-xs px-2 py-1">
                 <span className="text-[7px] font-bold opacity-30 w-4">X</span>
                 <input 
                   type="number" 
                   value={container.pos.x} 
                   onChange={(e) => onUpdate(container.id, { pos: { ...container.pos, x: parseInt(e.target.value) } })}
                   className="bg-transparent text-[9px] font-mono text-primary w-full outline-none" 
                 />
              </div>
              <div className="flex-1 flex items-center bg-black/40 border border-outline/10 rounded-xs px-2 py-1">
                 <span className="text-[7px] font-bold opacity-30 w-4">Y</span>
                 <input 
                   type="number" 
                   value={container.pos.y} 
                   onChange={(e) => onUpdate(container.id, { pos: { ...container.pos, y: parseInt(e.target.value) } })}
                   className="bg-transparent text-[9px] font-mono text-primary w-full outline-none" 
                 />
              </div>
           </div>
        </div>

        {/* SIZE */}
        <div className="space-y-2">
           <div className="flex items-center gap-2 opacity-40">
             <Maximize2 className="w-2.5 h-2.5" />
             <span className="text-[7px] font-black uppercase tracking-widest">Industrial Sizing</span>
           </div>
           <div className="flex gap-2">
              <select 
                value={typeof container.size.w === 'string' ? container.size.w : 'custom'} 
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdate(container.id, { size: { ...container.size, w: val === 'custom' ? 100 : val as ContainerSizeUnit } });
                }}
                className="flex-1 bg-black/40 border border-outline/10 rounded-xs px-2 py-1 text-[9px] font-bold text-primary outline-none"
              >
                {widthUnits.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                <option value="custom">PX</option>
              </select>
              <div className="flex-1 flex items-center bg-black/40 border border-outline/10 rounded-xs px-2 py-1">
                 <span className="text-[7px] font-bold opacity-30 w-4">H</span>
                 <input 
                   type="number" 
                   value={container.size.h} 
                   onChange={(e) => onUpdate(container.id, { size: { ...container.size, h: parseInt(e.target.value) } })}
                   className="bg-transparent text-[9px] font-mono text-primary w-full outline-none" 
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-40">
              <Box className="w-2.5 h-2.5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Visual Variant</span>
            </div>
            <select 
              value={container.variant} 
              onChange={(e) => onUpdate(container.id, { variant: e.target.value as ContainerVariant })}
              className="w-full bg-black/40 border border-outline/10 rounded-xs px-2 py-1 text-[9px] font-bold text-primary outline-none"
            >
              {variants.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
            </select>
         </div>

         <div className="space-y-2">
            <div className="flex items-center gap-2 opacity-40">
              <Type className="w-2.5 h-2.5" />
              <span className="text-[7px] font-black uppercase tracking-widest">Label Anchor</span>
            </div>
            <select 
              value={container.labelPosition || 'top'} 
              onChange={(e) => onUpdate(container.id, { labelPosition: e.target.value as 'top' | 'bottom' | 'inside-top' | 'inside-bottom' })}
              className="w-full bg-black/40 border border-outline/10 rounded-xs px-2 py-1 text-[9px] font-bold text-primary outline-none"
            >
              {['top', 'bottom', 'inside-top', 'inside-bottom'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
         </div>
      </div>

      <div className="pt-4 border-t border-outline/5 space-y-2">
         <div className="flex items-center gap-2 opacity-40">
           <Layers className="w-2.5 h-2.5 text-accent" />
           <span className="text-[7px] font-black uppercase tracking-widest text-accent">Architectural Plane (Tab)</span>
         </div>
         <div className="flex flex-wrap gap-1">
           {['GLOBAL', 'MAIN', 'FX', 'EDIT', 'MIDI', 'MOD', 'PATCHING'].map(t => (
             <button
               key={t}
               onClick={() => onUpdate(container.id, { tab: t === 'GLOBAL' ? undefined : t })}
               className={`px-2 py-1 text-[7px] font-black uppercase rounded-xs border transition-all ${
                 (container.tab || 'GLOBAL') === t 
                   ? 'bg-accent/20 border-accent text-accent' 
                   : 'bg-black/40 border-outline/10 text-foreground/20 hover:border-outline/30'
               }`}
             >
               {t}
             </button>
           ))}
         </div>
      </div>
      
      {/* ASSET & COLOR BACKGROUND (Fase 13) */}
      <div className="pt-4 border-t border-outline/5 space-y-4">
          <div className="flex items-center gap-2 opacity-40">
            <Box className="w-2.5 h-2.5 text-primary" />
            <span className="text-[7px] font-black uppercase tracking-widest text-primary">Surface Properties</span>
          </div>
          
          <div className="space-y-4">
            <AssetSelector 
              label="Faceplate Background"
              manifest={manifest}
              selectedAssetId={container.asset}
              onSelect={(id) => onUpdate(container.id, { asset: id })}
              resolveAsset={resolveAsset}
            />

            <div className="space-y-1">
              <span className="text-[7px] font-bold opacity-30 uppercase">Custom Color (CSS)</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="#000000, rgba(0,0,0,0.5), transparent"
                  value={container.color || ''} 
                  onChange={(e) => onUpdate(container.id, { color: e.target.value })}
                  className="flex-1 bg-black/40 border border-outline/10 rounded-xs px-2 py-1.5 text-[9px] font-mono text-primary outline-none" 
                />
                <div 
                  className="w-8 h-8 rounded-xs border border-outline/20" 
                  style={{ backgroundColor: container.color || 'transparent' }} 
                />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
