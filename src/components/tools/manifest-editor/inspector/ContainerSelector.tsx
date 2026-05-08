'use client';
 
import React from 'react';
import { Layout, Box } from 'lucide-react';
import { ManifestEntity, LayoutContainer } from '@/types/manifest';
import InspectorCollapsible from './shared/InspectorCollapsible';
 
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
    <InspectorCollapsible 
      title="Layout Container (SOT)" 
      icon={Layout}
      onHelp={() => onHelp?.('layout')}
    >
      <div className="space-y-2 pt-2">
        <div className="relative group">
          <select 
            value={item.presentation?.container || ''} 
            onChange={(e) => onUpdate({ 
              presentation: { 
                ...item.presentation, 
                container: e.target.value || undefined
              } 
            })}
            className={`w-full bg-black/20 border ${(!item.presentation?.container || highlightPath?.includes('container')) ? 'border-amber-500 ring-1 ring-amber-500' : 'wb-outline'} rounded-xs px-3 py-3 text-[10px] font-black text-primary outline-none focus:border-primary/40 transition-all appearance-none cursor-pointer [color-scheme:dark]`}
          >
            <option value="" disabled>-- SELECT MANDATORY CONTAINER --</option>
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.label.toUpperCase()} [{c.tab || 'MAIN'}]</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none wb-text-muted opacity-60 group-hover:opacity-40 transition-opacity">
             <Box className="w-3 h-3" />
          </div>
        </div>
      </div>
    </InspectorCollapsible>
  );
}
