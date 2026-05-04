'use client';

import React from 'react';
import { Fingerprint, Info, Tags, Box, Layout, Shield } from 'lucide-react';

import { OMEGA_Manifest, ManifestEntity, ManifestMetadata } from '../../../../types/manifest';

interface IdentitySectionProps {
  item: OMEGA_Manifest | ManifestEntity;
  onUpdate: (updates: Partial<OMEGA_Manifest> | Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  rootManifest?: OMEGA_Manifest; // For authority prediction
}

const FAMILIES = [
  { id: 'osc', label: 'OSC', desc: 'Oscillators' },
  { id: 'filter', label: 'FILTER', desc: 'Filters' },
  { id: 'env', label: 'ENV', desc: 'Envelopes' },
  { id: 'lfo', label: 'LFO', desc: 'Modulators' },
  { id: 'vca', label: 'VCA', desc: 'Dynamics' },
  { id: 'fx', label: 'FX', desc: 'Effects' },
  { id: 'utility', label: 'UTIL', desc: 'Utility' },
  { id: 'io', label: 'I/O', desc: 'I/O & MIDI' },
  { id: 'sequencer', label: 'SEQ', desc: 'Sequencers' },
];

const SKINS = [
  { id: 'industrial', label: 'Industrial Black', color: 'bg-[#1a1c1e]' },
  { id: 'carbon', label: 'Carbon Fiber', color: 'bg-[#0a0a0a]' },
  { id: 'glass', label: 'Aseptic Glass', color: 'bg-[#2a3035]' },
  { id: 'minimal', label: 'Minimalist', color: 'bg-[#000000]' },
];
export default function IdentitySection({ item, onUpdate, onHelp, rootManifest }: IdentitySectionProps) {
  const isModule = 'metadata' in item;

  if (!isModule) {
    const entity = item as ManifestEntity;
    
    // Numeric Authority Linter (Era 7.2.3)
    const getAuthority = () => {
      if (!rootManifest) return null;
      const cIdx = (rootManifest.ui?.controls || []).findIndex(c => c.id === entity.id);
      if (cIdx !== -1) return { type: 'ParamId', value: cIdx };
      const jIdx = (rootManifest.ui?.jacks || []).findIndex(j => j.id === entity.id);
      if (jIdx !== -1) return { type: 'PortId', value: jIdx };
      return null;
    };
    const auth = getAuthority();

    return (
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
             <div className="flex items-center gap-2">
                <Fingerprint className="w-3 h-3" />
                <span>Entity Identification</span>
             </div>
             <div className="flex items-center gap-2">
                {auth && (
                  <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                    <span className="text-[6px] text-primary font-black">{auth.type}:</span>
                    <span className="text-[6px] text-primary font-mono font-bold">#{auth.value}</span>
                  </div>
                )}
                <button onClick={() => onHelp?.('cells')} className="hover:text-primary transition-colors">
                   <Info className="w-3 h-3" />
                </button>
             </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Canonical ID</label>
              <input 
                type="text" 
                value={entity.id} 
                onChange={(e) => onUpdate({ id: e.target.value })}
                className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Display Label</label>
              <input 
                type="text" 
                value={entity.label || ''} 
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GLOBAL MODULE EDITING
  const manifest = item as OMEGA_Manifest;
  const metadata = manifest.metadata;
  const rack = metadata.rack || { slot: 'main', height_mode: 'full', hp: 12 };
  const ui = manifest.ui || {};

  const updateMetadata = (field: keyof ManifestMetadata, value: unknown) => {
    onUpdate({ metadata: { ...metadata, [field]: value } } as Partial<OMEGA_Manifest>);
  };

  const updateRack = (updates: Partial<typeof rack>) => {
    onUpdate({ metadata: { ...metadata, rack: { ...rack, ...updates } } } as Partial<OMEGA_Manifest>);
  };

  const updateRackFormat = (slot: string, mode: string, height: number) => {
    onUpdate({ 
      metadata: { 
        ...metadata, 
        rack: { ...rack, slot, height_mode: mode } 
      },
      ui: {
        ...ui,
        dimensions: {
          ...(ui.dimensions || {}),
          height: height
        }
      }
    } as Partial<OMEGA_Manifest>);
  };

  const updateUI = (field: string, value: unknown) => {
    onUpdate({ ui: { ...ui, [field]: value } } as Partial<OMEGA_Manifest>);
  };

  return (
    <div className="space-y-10 pt-2 pb-10">
      {/* 1. SIGNATURE */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <Box className="w-3 h-3" />
             <span>Module Signature</span>
           </div>
           <button onClick={() => onHelp?.('introduccion')} className="hover:text-primary transition-colors">
              <Info className="w-3 h-3" />
           </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Schema Version</label>
            <input 
              type="text" 
              value={manifest.schemaVersion || '7.1'} 
              onChange={(e) => onUpdate({ schemaVersion: e.target.value } as Partial<OMEGA_Manifest>)}
              className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500 font-mono"
              placeholder="7.1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Canonical ID (Unique)</label>
            <input 
              type="text" 
              value={item.id || ''} 
              onChange={(e) => onUpdate({ id: e.target.value })}
              className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-accent outline-none focus:border-accent/40 transition-all transition-colors duration-500"
              placeholder="module_id_unique"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Commercial Name</label>
                <input 
                  type="text" 
                  value={metadata.name || ''} 
                  onChange={(e) => updateMetadata('name', e.target.value)}
                  className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[11px] font-black wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Version</label>
                <input 
                  type="text" 
                  value={metadata.version || ''} 
                  onChange={(e) => updateMetadata('version', e.target.value)}
                  className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500"
                  placeholder="1.0.0"
                />
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Status</label>
                <select 
                  value={metadata.status || 'experimental'} 
                  onChange={(e) => updateMetadata('status', e.target.value)}
                  className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none uppercase appearance-none transition-colors duration-500"
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Industrial Tags (Comma separated)</label>
            <input 
              type="text" 
              value={(metadata.tags || []).join(', ')} 
              onChange={(e) => updateMetadata('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
              className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500"
              placeholder="era7, low-latency, industrial"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Technical Description</label>
          <textarea 
            value={metadata.description || ''} 
            onChange={(e) => updateMetadata('description', e.target.value)}
            className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] wb-text outline-none focus:border-primary/40 transition-all min-h-[60px] resize-none transition-colors duration-500"
          />
        </div>
      </div>

      {/* 2. TAXONOMY */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
           <Tags className="w-3 h-3" />
           <span>Industrial Family</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FAMILIES.map((f) => (
            <button
              key={f.id}
              onClick={() => updateMetadata('family', f.id)}
              className={`p-2 border rounded-xs transition-all flex flex-col items-center gap-1 ${
                metadata.family === f.id 
                  ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/5 border wb-outline hover:border-outline/30 transition-colors duration-500'
              }`}
            >
              <span className={`text-[9px] font-black ${metadata.family === f.id ? 'wb-text' : 'wb-text-muted'}`}>
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. AESTHETICS (SKIN) */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <Shield className="w-3 h-3" />
             <span>Visual Engineering (Skin)</span>
           </div>
           <button onClick={() => onHelp?.('estetica')} className="hover:text-primary transition-colors">
              <Info className="w-3 h-3" />
           </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
           {SKINS.map(s => (
             <button
               key={s.id}
               onClick={() => updateUI('skin', s.id)}
               className={`p-2 border rounded-sm flex flex-col items-center gap-2 transition-all ${
                 ui.skin === s.id ? 'border-accent bg-accent/5' : 'wb-outline bg-black/5'
               }`}
             >
                <div className={`w-full h-1.5 rounded-full ${s.color} border border-white/10`} />
                <span className={`text-[7px] font-black uppercase leading-tight text-center ${ui.skin === s.id ? 'text-accent' : 'wb-text-muted'}`}>{s.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* 4. RACK MECHANICAL SPECIFICATION */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <Layout className="w-3 h-3" />
             <span>Rack Mechanical Spec</span>
           </div>
           <button onClick={() => onHelp?.('dimensiones')} className="hover:text-primary transition-colors">
              <Info className="w-3 h-3" />
           </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Industrial Format (Slot & Height)</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => updateRackFormat('main', 'full', 420)}
                className={`py-2 px-3 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${rack.slot === 'main' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'}`}
              >
                <span>Main (3U)</span>
                <span className="text-[6px] wb-text-muted font-bold uppercase transition-colors duration-500">Primary Synthesis Rack</span>
              </button>
              <button 
                onClick={() => updateRackFormat('upper', 'compact', 140)}
                className={`py-2 px-3 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${rack.slot === 'upper' || rack.slot === 'top' ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(255,140,0,0.1)]' : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'}`}
              >
                <span>Utility (1U)</span>
                <span className="text-[6px] wb-text-muted font-bold uppercase transition-colors duration-500">Top Management Strip</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Horizontal Width (HP)</label>
            <div className="relative">
              <input 
                type="number" 
                value={rack.hp || 12} 
                onChange={(e) => updateRack({ hp: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2.5 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500 font-mono"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] font-black wb-text-muted uppercase transition-colors duration-500">HP Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
