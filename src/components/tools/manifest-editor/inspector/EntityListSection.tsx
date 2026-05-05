'use client';

import React from 'react';
import { Plus, Settings2, Zap, Layout, Copy, Trash2 } from 'lucide-react';
import { OMEGA_Manifest, LayoutContainer, ManifestEntity } from '@/types/manifest';

interface EntityListSectionProps {
  items: ManifestEntity[];
  title: string;
  type: 'control' | 'jack';
  onSelectItem: (id: string) => void;
  onAddEntity: (type: 'control' | 'jack') => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  manifest: OMEGA_Manifest;
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
  onRemoveItem,
  manifest
}: EntityListSectionProps) {
  const Icon = type === 'control' ? Settings2 : Zap;

  // GROUPING LOGIC (Era 7.2 Container Support)
  const groups = items.reduce((acc: Record<string, ManifestEntity[]>, item) => {
    const gid = item.presentation?.container || item.presentation?.group || 'UNBOUND';
    if (!acc[gid]) acc[gid] = [];
    acc[gid].push(item);
    return acc;
  }, {});

  const containers = manifest?.ui?.layout?.containers || [];

  const groupIds = Object.keys(groups).sort((a, b) => {
    if (a === 'UNBOUND') return 1;
    if (b === 'UNBOUND') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-black/5 p-4 rounded-xs border wb-outline shadow-inner transition-colors duration-500">
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] wb-text">{title}</span>
        </div>
        <button 
          onClick={() => onAddEntity(type)}
          className="p-1.5 hover:bg-primary hover:text-black rounded-xs transition-all text-primary/60 flex items-center gap-2 group shadow-lg"
        >
          <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Add {type}</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-8">
        {groupIds.map((gid) => {
          const container = containers.find((c: LayoutContainer) => c.id === gid);
          const label = container ? container.label : gid === 'UNBOUND' ? 'UNBOUND ENTITIES' : gid;
          const isLegacy = !container && gid !== 'UNBOUND';

          return (
            <div key={gid} className="space-y-3">
              {/* GROUP HEADER */}
              <div className="flex items-center gap-2 px-1">
                 <div className={`h-[1px] flex-1 ${isLegacy ? 'bg-amber-500/20' : 'bg-outline/10'}`} />
                 <div className={`flex items-center gap-2 opacity-60 ${isLegacy ? 'text-amber-500' : 'text-foreground/40'}`}>
                    <Layout className="w-2.5 h-2.5" />
                    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
                    {isLegacy && <span className="text-[5px] bg-amber-500/20 px-1 rounded-full">LEGACY</span>}
                 </div>
                 <div className={`h-[1px] w-4 ${isLegacy ? 'bg-amber-500/20' : 'bg-outline/10'}`} />
              </div>

              <div className="space-y-1.5">
                {groups[gid].map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => onSelectItem(item.id)}
                    className="group relative flex items-center justify-between p-3 rounded-xs border bg-black/5 wb-outline hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] transition-all cursor-pointer transition-colors duration-500"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`w-1 h-5 rounded-full transition-colors ${isLegacy ? 'bg-amber-500/20 group-hover:bg-amber-500' : 'bg-outline/20 group-hover:bg-primary/40'}`} />
                      <div className="flex flex-col truncate">
                        <span className="text-[11px] font-black truncate tracking-tight wb-text group-hover:text-primary transition-colors">{item.label || item.id}</span>
                        <span className="text-[8px] font-mono wb-text-muted uppercase truncate tracking-wider">{item.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDuplicateItem(item.id); }}
                        className="p-1.5 hover:wb-surface-hover rounded-xs wb-text-muted hover:wb-text transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onRemoveItem(item.id); }}
                        className="p-1.5 hover:bg-red-500/10 rounded-xs wb-text-muted hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

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
