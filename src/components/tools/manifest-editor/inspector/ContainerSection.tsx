'use client';

import React from 'react';
import { Plus, Layout } from 'lucide-react';
import { LayoutContainer, OMEGA_Manifest } from '@/types/manifest';
import { useContainerState } from '@/hooks/manifest-editor/useContainerState';
import ContainerCard from './container/ContainerCard';

interface ContainerSectionProps {
  containers: LayoutContainer[];
  manifest: OMEGA_Manifest;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<LayoutContainer>) => void;
  onRemove: (id: string) => void;
  highlightPath?: string | null;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function ContainerSection({
  containers, manifest, onAdd, onUpdate, onRemove, resolveAsset
}: ContainerSectionProps) {
  const { isExpanded, toggleExpand } = useContainerState();

  return (
    <div className="space-y-8 pb-10">
      {/* SECTION HEADER */}
      <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-xs border border-outline/10 shadow-inner">
        <div className="flex items-center gap-3">
          <Layout className="w-4 h-4 text-primary/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Layout Architecture</span>
        </div>
        <button 
          onClick={onAdd}
          className="p-1.5 hover:bg-primary hover:text-black rounded-xs transition-all text-primary/60 flex items-center gap-2 group shadow-lg"
        >
          <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Build Container</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* CONTAINER LIST */}
      <div className="space-y-4">
        {containers.map((container) => (
          <ContainerCard 
            key={container.id}
            container={container}
            isExpanded={isExpanded(container.id)}
            onToggleExpand={() => toggleExpand(container.id)}
            onUpdate={onUpdate}
            onRemove={onRemove}
            manifest={manifest}
            resolveAsset={resolveAsset}
          />
        ))}

        {containers.length === 0 && (
          <div className="py-20 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center gap-4 opacity-20 grayscale hover:grayscale-0 transition-all">
             <Layout className="w-8 h-8 text-primary/40" />
             <div className="text-center space-y-1">
               <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Infrastructure</p>
               <p className="text-[7px] font-medium uppercase tracking-widest text-foreground/60">Build containers to frame your components</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
