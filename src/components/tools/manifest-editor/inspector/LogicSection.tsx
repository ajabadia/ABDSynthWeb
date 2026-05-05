'use client';
 
import React from 'react';
import { Box } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';
import { BindingField } from './logic/BindingField';
import { RoleSelector } from './logic/RoleSelector';
import { ProtocolFields } from './logic/ProtocolFields';
 
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
  { id: 'illustration', label: 'Illustration / Logo', icon: '🖼️' },
  { id: 'stepper', label: 'Step Selector', icon: '🔢' },
  { id: 'scope', label: 'Waveform Scope', icon: '📉' },
  { id: 'terminal', label: 'Text Terminal', icon: '🖥️' },
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
      <BindingField 
        item={item} 
        availableBinds={availableBinds} 
        isHighlighted={isHighlighted} 
        onUpdate={onUpdate} 
        onHelp={onHelp} 
      />
 
      <RoleSelector 
        item={item} 
        roles={EXTENDED_ROLES} 
        isHighlighted={isHighlighted} 
        onUpdate={onUpdate} 
        onHelp={onHelp} 
      />
 
      <ProtocolFields 
        item={item} 
        isHighlighted={isHighlighted} 
        onUpdate={onUpdate} 
      />
 
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
