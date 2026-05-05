'use client';

import React from 'react';
import { Layout, Info, Box, AlertCircle } from 'lucide-react';
import { ManifestEntity, LayoutContainer } from '@/types/manifest';

interface ContainerSelectorProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  containers: LayoutContainer[];
  onHelp?: (id: string) => void;
  highlightPath?: string | null;
}

/**
 * ContainerSelector (Era 7.2.3)
 * Handles architectural mapping between entities and layout containers.
 */
export default function ContainerSelector({ item, onUpdate, containers, onHelp, highlightPath }: ContainerSelectorProps) {
  return (
    <div className="space-y-4 p-4 bg-primary/5 border border-primary/10 rounded-xs transition-colors duration-500">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3 wb-text-muted">
            <Layout className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Layout Container (SOT)</span>
         </div>
         {onHelp && (
           <button onClick={() => onHelp('layout')} className="p-1 text-white/20 hover:text-primary transition-colors">
             <Info className="w-3 h-3" />
           </button>
         )}
      </div>

      <div className="space-y-2">
        <div className="relative group">
          <select 
            value={item.presentation?.container || ''} 
            onChange={(e) => onUpdate({ 
              presentation: { 
                ...item.presentation, 
                container: e.target.value || undefined,
                group: undefined 
              } 
            })}
            className={`w-full bg-black/20 border ${highlightPath?.includes('container') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-3 text-[10px] font-black text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer [color-scheme:dark]`}
          >
            <option value="">-- NO CONTAINER (RACK ROOT) --</option>
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.label.toUpperCase()} ({c.id})</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none wb-text-muted opacity-60 group-hover:opacity-40 transition-opacity">
             <Box className="w-3 h-3" />
          </div>
        </div>

        {item.presentation?.group && !item.presentation?.container && (
          <div className="mt-2 p-2 bg-amber-500/5 border border-amber-500/20 rounded-xs flex items-center gap-2">
             <AlertCircle className="w-3 h-3 text-amber-500" />
             <span className="text-[7px] font-bold text-amber-500/80 uppercase">Detected Legacy Group: {item.presentation.group}</span>
          </div>
        )}
      </div>
    </div>
  );
}
