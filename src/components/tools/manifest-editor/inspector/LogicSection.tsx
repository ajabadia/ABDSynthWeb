'use client';

import React from 'react';
import { Box, Settings2, Lock, EyeOff } from 'lucide-react';

interface LogicSectionProps {
  item: any;
  onUpdate: (updates: any) => void;
  availableBinds?: string[];
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

export default function LogicSection({ item, onUpdate, availableBinds = [] }: LogicSectionProps) {
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
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Settings2 className="w-3 h-3 text-primary" />
           <span>Canonical Binding</span>
        </div>
        <div className="space-y-1.5">
          <select 
            value={item.bind || ''} 
            onChange={(e) => onUpdate({ bind: e.target.value })}
            className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-mono text-primary outline-none focus:border-primary/40 transition-all appearance-none"
          >
            <option value="">-- UNBOUND (Static) --</option>
            {availableBinds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <p className="text-[7px] text-foreground/20 italic ml-1">
            Connects this UI entity to a technical parameter in the WASM contract.
          </p>
        </div>
      </div>

      {/* TECHNICAL PROTOCOL */}
      <div className="space-y-3">
        <div className="text-[7px] font-black uppercase text-foreground/40 flex items-center gap-2 tracking-[0.2em]">
           <Box className="w-3 h-3 text-accent" />
           <span>Technical Protocol</span>
        </div>
        <div className="space-y-1.5">
          <label className="text-[8px] font-bold text-foreground/30 uppercase ml-1">Data Type</label>
          <select 
            value={item.type || 'float'} 
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full bg-black/40 border border-outline/10 rounded-xs px-3 py-2 text-[10px] font-bold text-foreground/80 outline-none appearance-none"
          >
            <option value="float">Float (Analog)</option>
            <option value="int">Integer (Digital)</option>
            <option value="bool">Boolean (Gate)</option>
            <option value="string">String (Text)</option>
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
