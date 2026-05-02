'use client';

import React from 'react';
import { Fingerprint, Info, Tags, Box, Layout, Shield } from 'lucide-react';

import { OMEGA_Manifest, ManifestEntity, ManifestMetadata } from '../../../../types/manifest';

interface IdentitySectionProps {
  item: OMEGA_Manifest | ManifestEntity;
  onUpdate: (updates: Partial<OMEGA_Manifest> | Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
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
  { id: 'industrial', label: 'Industrial Black', color: 'bg-[#1a1a1a]' },
  { id: 'silver', label: 'Industrial Silver', color: 'bg-[#d0d0d0]' },
  { id: 'carbon', label: 'Carbon Fiber', color: 'bg-[#0a0a0a]' },
  { id: 'glass', label: 'Aseptic Glass', color: 'bg-[#2a3035]' },
  { id: 'minimal', label: 'Minimalist', color: 'bg-[#f0f0f0]' },
];

export default function IdentitySection({ item, onUpdate, onHelp }: IdentitySectionProps) {
  const isModule = 'metadata' in item;

  if (!isModule) {
    return (
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center justify-between tracking-[0.2em]">
             <div className="flex items-center gap-2">
                <Fingerprint className="w-3 h-3" />
                <span>Entity Identification</span>
             </div>
             <button onClick={() => onHelp?.('cells')} className="hover:text-primary transition-colors">
                <Info className="w-3 h-3" />
             </button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Canonical ID</label>
              <input 
                type="text" 
                value={item.id} 
                onChange={(e) => onUpdate({ id: e.target.value })}
                className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Display Label</label>
              <input 
                type="text" 
                value={item.label || ''} 
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-bold text-foreground outline-none focus:border-primary/40 transition-all"
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

  const updateRack = (field: string, value: unknown) => {
    onUpdate({ metadata: { ...metadata, rack: { ...rack, [field]: value } } } as Partial<OMEGA_Manifest>);
  };

  const updateUI = (field: string, value: unknown) => {
    onUpdate({ ui: { ...ui, [field]: value } } as Partial<OMEGA_Manifest>);
  };

  return (
    <div className="space-y-10 pt-2 pb-10">
      {/* 1. SIGNATURE */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center justify-between tracking-[0.2em]">
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
            <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Schema Version</label>
            <input 
              type="text" 
              value={manifest.schemaVersion || '7.1'} 
              onChange={(e) => onUpdate({ schemaVersion: e.target.value } as Partial<OMEGA_Manifest>)}
              className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none focus:border-primary/40 transition-all"
              placeholder="7.1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Canonical ID (Unique)</label>
            <input 
              type="text" 
              value={item.id || ''} 
              onChange={(e) => onUpdate({ id: e.target.value })}
              className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-mono text-accent outline-none focus:border-accent/40 transition-all"
              placeholder="module_id_unique"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Commercial Name</label>
                <input 
                  type="text" 
                  value={metadata.name || ''} 
                  onChange={(e) => updateMetadata('name', e.target.value)}
                  className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[11px] font-black text-primary outline-none focus:border-primary/40 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Version</label>
                <input 
                  type="text" 
                  value={metadata.version || ''} 
                  onChange={(e) => updateMetadata('version', e.target.value)}
                  className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-mono text-foreground outline-none focus:border-primary/40 transition-all"
                  placeholder="1.0.0"
                />
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Status</label>
                <select 
                  value={metadata.status || 'experimental'} 
                  onChange={(e) => updateMetadata('status', e.target.value)}
                  className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-bold text-foreground/60 outline-none uppercase appearance-none"
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                  <option value="experimental">Experimental</option>
                </select>
              </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Industrial Tags (Comma separated)</label>
            <input 
              type="text" 
              value={(metadata.tags || []).join(', ')} 
              onChange={(e) => updateMetadata('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
              className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] text-foreground/80 outline-none focus:border-primary/40 transition-all"
              placeholder="era7, low-latency, industrial"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Technical Description</label>
          <textarea 
            value={metadata.description || ''} 
            onChange={(e) => updateMetadata('description', e.target.value)}
            className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] text-foreground/60 outline-none focus:border-primary/40 transition-all min-h-[60px] resize-none"
          />
        </div>
      </div>

      {/* 2. TAXONOMY */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
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
                  ? 'bg-primary/10 border-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 hover:border-outline/30'
              }`}
            >
              <span className={`text-[9px] font-black ${metadata.family === f.id ? 'text-primary' : 'text-foreground/40'}`}>
                {f.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. AESTHETICS (SKIN) */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center justify-between tracking-[0.2em]">
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
                 ui.skin === s.id ? 'border-accent bg-accent/5' : 'border-outline/10 bg-black/40'
               }`}
             >
                <div className={`w-full h-1.5 rounded-full ${s.color} border border-white/10`} />
                <span className={`text-[7px] font-black uppercase leading-tight text-center ${ui.skin === s.id ? 'text-accent' : 'text-foreground/30'}`}>{s.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* 4. RACK MECHANICAL SPECIFICATION */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center justify-between tracking-[0.2em]">
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
            <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Industrial Format (Slot & Height)</label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  updateRack('slot', 'main');
                  updateRack('height_mode', 'full');
                }}
                className={`py-2 px-3 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${rack.slot !== 'top' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'bg-black/40 border-outline/10 text-foreground/40 hover:text-foreground/60'}`}
              >
                <span>Main (3U)</span>
                <span className="text-[6px] opacity-40">Primary Synthesis Rack</span>
              </button>
              <button 
                onClick={() => {
                  updateRack('slot', 'top');
                  updateRack('height_mode', 'compact');
                }}
                className={`py-2 px-3 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1 ${rack.slot === 'top' ? 'bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(255,140,0,0.1)]' : 'bg-black/40 border-outline/10 text-foreground/40 hover:text-foreground/60'}`}
              >
                <span>Utility (1U)</span>
                <span className="text-[6px] opacity-40">Top Management Strip</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Horizontal Width (HP)</label>
            <div className="relative">
              <input 
                type="number" 
                value={rack.hp || 12} 
                onChange={(e) => updateRack('hp', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-black/60 border border-outline/20 rounded-xs px-3 py-2.5 text-[10px] font-mono text-primary outline-none focus:border-primary/40 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] font-black text-primary/40 uppercase">HP Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
