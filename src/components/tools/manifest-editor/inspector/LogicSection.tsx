'use client';

import React from 'react';
import { Box, Settings2, Lock, EyeOff, Info } from 'lucide-react';
import { ManifestEntity } from '../../../../types/manifest';

interface LogicSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  availableBinds?: string[];
  onHelp?: (sectionId?: string) => void;
}

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

export default function LogicSection({ item, onUpdate, availableBinds = [], onHelp }: LogicSectionProps) {
  const currentType = item.presentation?.component || 'knob';

  const updateType = (type: string) => {
    onUpdate({ presentation: { ...item.presentation, component: type } });
  };

  const toggleFlag = (flag: string) => {
    const ui = item.presentation?.ui || {};
    onUpdate({ 
      presentation: { 
        ...item.presentation, 
        ui: { ...ui, [flag]: !ui[flag] } 
      } 
    });
  };

  return (
    <div className="space-y-6 pt-2">
      {/* CANONICAL BINDING */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center justify-between tracking-[0.2em]">
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
              className={`w-full bg-black/60 border ${availableBinds.length === 0 ? 'border-amber-500/20' : 'border-primary/20'} rounded-xs px-3 py-2.5 text-[10px] font-mono text-primary outline-none focus:border-primary/60 transition-all appearance-none cursor-pointer pr-10`}
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
          {availableBinds.length === 0 ? (
            <p className="text-[7px] text-amber-500/60 font-bold uppercase tracking-tighter ml-1 animate-pulse">
              ⚠ No technical contract loaded. Upload .wasm or .json to sync logic.
            </p>
          ) : (
            <p className="text-[7px] text-foreground/20 italic ml-1">
              Connects this UI entity to a technical parameter in the WASM contract.
            </p>
          )}
        </div>
      </div>

      {/* REGISTRY ROLE ERA 7.1 */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center justify-between tracking-[0.2em]">
           <div className="flex items-center gap-2">
             <Settings2 className="w-3 h-3 text-primary" />
             <span>Registry Role (SOT)</span>
           </div>
           <button onClick={() => onHelp?.('roles')} className="hover:text-primary transition-colors">
              <Info className="w-3 h-3" />
           </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'control', label: 'UI Control', desc: 'Standard Input' },
            { id: 'telemetry', label: 'Telemetry', desc: 'Visual Feedback' },
            { id: 'stream', label: 'Signal Stream', desc: 'Audio / CV' },
            { id: 'mod_target', label: 'Mod Target', desc: 'Matrix Dest' },
          ].map(role => (
            <button
              key={role.id}
              onClick={() => onUpdate({ role: role.id })}
              className={`p-2 border rounded-xs transition-all flex flex-col items-start gap-0.5 ${
                (item.role || 'control') === role.id 
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 text-foreground/40 hover:border-outline/30'
              }`}
            >
              <span className="text-[9px] font-black uppercase tracking-tighter">{role.label}</span>
              <span className="text-[6px] font-bold opacity-40 uppercase">{role.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TECHNICAL PROTOCOL */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Box className="w-3 h-3 text-accent" />
           <span>Technical Protocol</span>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Value Normalization</label>
          <select 
            value={item.type || 'float'} 
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-bold text-foreground/80 outline-none appearance-none"
          >
            <option value="float">Float (0.0 to 1.0)</option>
            <option value="int">Integer (Stepped)</option>
            <option value="bool">Boolean (Binary)</option>
            <option value="string">String (Metadata)</option>
          </select>
        </div>
      </div>

      {/* COMPONENT TYPE SELECTION */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Box className="w-3 h-3" />
           <span>Component Blueprint</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COMPONENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => updateType(type.id)}
              className={`flex items-center gap-3 p-2 border rounded-xs transition-all ${
                currentType === type.id 
                  ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                  : 'bg-black/40 border-outline/10 text-foreground/40 hover:border-outline/30'
              }`}
            >
              <span className="text-xs">{type.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTION FLAGS */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Settings2 className="w-3 h-3" />
           <span>Interaction Logic</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => toggleFlag('disabled')}
            className={`flex items-center justify-between p-3 border rounded-xs transition-all ${
              item.presentation?.ui?.disabled 
                ? 'bg-red-500/20 border-red-500/40 text-red-500' 
                : 'bg-black/40 border-outline/10 text-foreground/40 hover:border-outline/30'
            }`}
          >
            <span className="text-[8px] font-black uppercase tracking-widest">Disabled</span>
            <Lock className="w-3 h-3" />
          </button>
          <button
            onClick={() => toggleFlag('readOnly')}
            className={`flex items-center justify-between p-3 border rounded-xs transition-all ${
              item.presentation?.ui?.readOnly 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' 
                : 'bg-black/40 border-outline/10 text-foreground/40 hover:border-outline/30'
            }`}
          >
            <span className="text-[8px] font-black uppercase tracking-widest">Read Only</span>
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
