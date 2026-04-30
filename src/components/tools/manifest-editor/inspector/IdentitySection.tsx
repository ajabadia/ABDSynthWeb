'use client';

import React from 'react';
import { Fingerprint, Info, Tags, Box, Layout, Shield } from 'lucide-react';

interface IdentitySectionProps {
  item: any;
  onUpdate: (updates: any) => void;
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
  { id: 'industrial', label: 'Industrial', color: 'bg-[#1a1a1a]' },
  { id: 'carbon', label: 'Carbon Fiber', color: 'bg-[#0a0a0a]' },
  { id: 'glass', label: 'Aseptic Glass', color: 'bg-[#2a3035]' },
];

export default function IdentitySection({ item, onUpdate }: IdentitySectionProps) {
  const isModule = !!item.metadata;

  if (!isModule) {
    return (
      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
             <Fingerprint className="w-3 h-3" />
             <span>Entity Identification</span>
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
  const metadata = item.metadata;
  const rack = metadata.rack || { slot: 'main', height_mode: 'full', hp: 12 };
  const ui = item.ui || {};

  const updateMetadata = (field: string, value: any) => {
    onUpdate({ metadata: { ...metadata, [field]: value } });
  };

  const updateRack = (field: string, value: any) => {
    onUpdate({ metadata: { ...metadata, rack: { ...rack, [field]: value } } });
  };

  const updateUI = (field: string, value: any) => {
    onUpdate({ ui: { ...ui, [field]: value } });
  };

  return (
    <div className="space-y-10 pt-2 pb-10">
      {/* 1. SIGNATURE */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Box className="w-3 h-3" />
           <span>Module Signature</span>
        </div>
        <div className="space-y-4">
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
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Shield className="w-3 h-3" />
           <span>Visual Engineering (Skin)</span>
        </div>
        <div className="flex gap-2">
           {SKINS.map(s => (
             <button
               key={s.id}
               onClick={() => updateUI('skin', s.id)}
               className={`flex-1 p-3 border rounded-sm flex flex-col items-center gap-2 transition-all ${
                 ui.skin === s.id ? 'border-accent bg-accent/5' : 'border-outline/10 bg-black/40'
               }`}
             >
                <div className={`w-full h-1 rounded-full ${s.color}`} />
                <span className={`text-[8px] font-black uppercase ${ui.skin === s.id ? 'text-accent' : 'text-foreground/30'}`}>{s.label}</span>
             </button>
           ))}
        </div>
      </div>

      {/* 4. RACK SPECIFICATION */}
      <div className="space-y-4">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Layout className="w-3 h-3" />
           <span>Rack Mechanical Spec</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Rack Slot</label>
              <select 
                value={rack.slot || 'main'} 
                onChange={(e) => updateRack('slot', e.target.value)}
                className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-bold text-foreground/80 outline-none"
              >
                <option value="main">Main (3U)</option>
                <option value="top">Utility (1U)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Width (HP)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={rack.hp || 12} 
                  onChange={(e) => updateRack('hp', parseInt(e.target.value))}
                  className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[7px] font-black text-primary/40 uppercase">HP</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
