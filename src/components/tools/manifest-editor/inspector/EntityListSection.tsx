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

interface EntityListSectionProps {
  items: ManifestItem[];
  title: string;
  type: 'control' | 'jack';
  onSelectItem: (id: string) => void;
  onAddEntity: (type: 'control' | 'jack') => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

/**
 * EntityListSection
 * Centralized list manager for Controls and Signal Ports within the Module Inspector.
 */
export default function EntityListSection({
  items,
  title,
  type,
  onSelectItem,
  onAddEntity,
  onDuplicateItem,
  onRemoveItem
}: EntityListSectionProps) {
  const Icon = type === 'control' ? Settings2 : Zap;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-xs border border-outline/10">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-primary/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">{title}</span>
        </div>
        <button 
          onClick={() => onAddEntity(type)}
          className="p-1.5 hover:bg-primary hover:text-black rounded-xs transition-all text-primary/60 flex items-center gap-2 group"
        >
          <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Add {type}</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            className="group relative flex items-center justify-between p-3 rounded-xs border bg-black/40 border-outline/5 text-foreground/40 hover:border-outline/40 hover:bg-white/[0.05] hover:shadow-[0_0_20px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-1 h-5 rounded-full bg-outline/20 group-hover:bg-primary/40 transition-colors" />
              <div className="flex flex-col truncate">
                <span className="text-[11px] font-bold truncate tracking-tight text-foreground/80 group-hover:text-primary transition-colors">{item.label || item.id}</span>
                <span className="text-[8px] font-mono opacity-30 uppercase truncate tracking-wider">{item.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              <button 
                onClick={(e) => { e.stopPropagation(); onDuplicateItem(item.id); }}
                className="p-1.5 hover:bg-white/10 rounded-xs text-foreground/40 hover:text-primary transition-colors"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                className="p-1.5 hover:bg-red-500/10 rounded-xs text-foreground/40 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-20 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center gap-4 opacity-20 grayscale hover:grayscale-0 transition-all">
             <Layout className="w-8 h-8 text-primary/40" />
             <div className="text-center space-y-1">
               <p className="text-[9px] font-black uppercase tracking-[0.3em]">Registry Empty</p>
               <p className="text-[7px] font-medium uppercase tracking-widest text-foreground/60">No {title.toLowerCase()} defined</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
