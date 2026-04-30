'use client';

import React from 'react';
import { Plus, Settings2, Zap, Layout, Copy, Trash2 } from 'lucide-react';

interface ManifestItem {
  id: string;
  label?: string;
  bind?: string;
  presentation?: {
    tab?: string;
    [key: string]: any;
  };
}

interface ControlRegistryProps {
  manifest: {
    ui?: {
      controls?: ManifestItem[];
      jacks?: ManifestItem[];
    };
  };
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onAddEntity: (type: 'control' | 'jack') => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export default function ControlRegistry({ 
  manifest, 
  selectedItemId, 
  onSelectItem, 
  onAddEntity, 
  onDuplicateItem,
  onRemoveItem 
}: ControlRegistryProps) {
  const controls = manifest?.ui?.controls || [];
  const jacks = manifest?.ui?.jacks || [];

  const renderList = (items: ManifestItem[], title: string, type: 'control' | 'jack', Icon: React.ComponentType<any>) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-xs border border-outline/10">
        <div className="flex items-center gap-2">
          <Icon className="w-3 h-3 text-primary/60" />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">{title}</span>
        </div>
        <button 
          onClick={() => onAddEntity(type)}
          className="p-1 hover:bg-primary hover:text-black rounded-xs transition-all text-primary/60"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-1">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            className={`group relative flex items-center justify-between p-2 rounded-xs border transition-all cursor-pointer ${
              selectedItemId === item.id 
                ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                : 'bg-black/20 border-outline/10 text-foreground/40 hover:border-outline/40 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={`w-1 h-3 rounded-full ${selectedItemId === item.id ? 'bg-primary' : 'bg-outline/20'}`} />
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-bold truncate tracking-tight">{item.label || item.id}</span>
                <span className="text-[7px] font-mono opacity-40 uppercase truncate">{item.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onDuplicateItem(item.id); }}
                className="p-1 hover:bg-white/10 rounded-xs text-foreground/20 hover:text-primary transition-colors"
                title="Duplicate Entity"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                className="p-1 hover:bg-red-500/10 rounded-xs text-foreground/20 hover:text-red-400 transition-colors"
                title="Remove Entity"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-6 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center gap-2 opacity-20">
             <Layout className="w-4 h-4" />
             <span className="text-[7px] font-black uppercase tracking-widest">No {title}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderList(controls, 'Interactive Controls', 'control', Settings2)}
      {renderList(jacks, 'Signal Ports / Jacks', 'jack', Zap)}
    </div>
  );
}
