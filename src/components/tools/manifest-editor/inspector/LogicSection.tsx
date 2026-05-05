'use client';

import React from 'react';
import { Box, Settings2, Info, Layers } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';

interface LogicSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  availableBinds?: string[];
  onHelp?: (sectionId?: string) => void;
  highlightPath?: string | null;
}

const EXTENDED_ROLES = ['control', 'input', 'output', 'telemetry', 'expert', 'stream', 'mod_source', 'mod_target'];

const COMPONENT_TYPES = [
  { id: 'knob', label: 'Knob', icon: '🔘' },
  { id: 'slider-v', label: 'Vertical Slider', icon: '🎚️' },
  { id: 'slider-h', label: 'Horizontal Slider', icon: '↔️' },
  { id: 'select', label: 'Selector', icon: '📑' },
  { id: 'switch', label: 'Switch', icon: '⏻' },
  { id: 'button', label: 'Push Button', icon: '🔘' },
  { id: 'port', label: 'Signal Port', icon: '🔌' },
  { id: 'led', label: 'Status LED', icon: '🚨' },
  { id: 'display', label: 'Value Display', icon: '📟' },
  { id: 'hidden', label: 'Hidden Entity', icon: '👻' },
];

export default function LogicSection({ item, onUpdate, availableBinds = [], onHelp, highlightPath }: LogicSectionProps) {
  const currentType = item.presentation?.component || 'knob';
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  const updateType = (type: string) => {
    onUpdate({ presentation: { ...item.presentation, component: type } });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* CANONICAL BINDING */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <Settings2 className="w-3 h-3 text-primary" />
             <span>Canonical Binding</span>
           </div>
           <button onClick={() => onHelp?.('binding')} className="hover:text-primary transition-colors">
              <Info className="w-3 h-3" />
           </button>
        </div>
        <div className="space-y-1.5 relative">
          <div className="relative group">
            <select 
              value={item.bind || ''} 
              onChange={(e) => onUpdate({ bind: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('bind') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : (availableBinds.length === 0 ? 'border-amber-500/20' : 'wb-outline')} rounded-xs px-3 py-2.5 text-[10px] font-mono text-primary outline-none focus:border-primary/60 transition-all appearance-none cursor-pointer pr-10 transition-colors duration-500`}
            >
              <option value="">-- UNBOUND (Static) --</option>
              {availableBinds.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] text-primary">▼</span>
            </div>
          </div>
          {availableBinds.length === 0 && (
            <p className="text-[7px] text-amber-500/60 font-bold uppercase tracking-tighter ml-1 animate-pulse">
              ⚠ No technical contract loaded. Upload .wasm or .json to sync logic.
            </p>
          )}
        </div>
      </div>

      {/* EXTENDED ROLES (ERA 7.1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={`text-[7px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isHighlighted('role') ? 'text-amber-500' : 'wb-text-muted'}`}>
            <Layers className="w-2.5 h-2.5" />
            <span>Industrial Role (Registry)</span>
          </label>
          <button onClick={() => onHelp?.('logic')} className="hover:text-primary transition-colors">
            <Info className="w-2.5 h-2.5 opacity-20" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXTENDED_ROLES.map(role => (
            <button
              key={role}
              onClick={() => onUpdate({ role: role })}
              className={`px-2 py-1 text-[7px] font-black uppercase tracking-tighter border rounded-full transition-all ${
                isHighlighted('role') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
              } ${
                (item.role || 'control') === role 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* TECHNICAL PROTOCOL */}
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

      {/* COMPONENT TYPE SELECTION */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
           <Box className="w-3 h-3" />
           <span>Component Blueprint</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {COMPONENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => updateType(type.id)}
              className={`flex flex-col items-center justify-center gap-1.5 py-2.5 border rounded-xs transition-all ${
                isHighlighted('component') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
              } ${
                currentType === type.id 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/5 wb-outline wb-text-muted hover:wb-text transition-colors duration-500'
              }`}
            >
              <span className="text-[10px] grayscale brightness-150">{type.icon}</span>
              <span className="text-[6px] font-black uppercase tracking-tighter text-center leading-none px-0.5">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
