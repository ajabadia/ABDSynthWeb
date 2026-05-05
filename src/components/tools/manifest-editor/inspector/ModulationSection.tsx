'use client';

import React from 'react';
import { Plus, Activity, LayoutGrid, Info } from 'lucide-react';
import { OMEGA_Manifest, OMEGA_Modulation } from '@/types/manifest';
import { ModulationItem } from './ModulationItem';

interface ModulationSectionProps {
  manifest: OMEGA_Manifest;
  onAdd: (mod: OMEGA_Modulation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onOpenModGrid?: () => void;
  onHelp?: (sectionId?: string) => void;
}

export default function ModulationSection({ manifest, onAdd, onRemove, onUpdate, onOpenModGrid, onHelp }: ModulationSectionProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  
  const allEntities = [
    ...(manifest.ui?.controls || []),
    ...(manifest.ui?.jacks || [])
  ];

  const handleAdd = () => {
    const id = `mod_${Date.now()}`;
    onAdd({
      id,
      source: allEntities[0]?.id || '',
      target: allEntities[1]?.id || '',
      amount: 1.0,
      type: 'unipolar'
    });
    setExpandedId(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Internal Routings</h3>
          <button onClick={() => onHelp?.('modulaciones')} className="hover:text-primary transition-colors ml-1">
            <Info className="w-2.5 h-2.5 opacity-20" />
          </button>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={onOpenModGrid}
            className="p-1.5 bg-white/5 border border-white/10 rounded-xs hover:bg-white/10 text-white/40 transition-all flex items-center gap-2 pr-3"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[7px] font-black uppercase tracking-widest">Open Matrix</span>
          </button>
          <button 
            onClick={handleAdd}
            className="p-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xs hover:bg-cyan-500/20 text-cyan-400 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {(manifest.modulations || []).map((mod) => (
          <ModulationItem 
            key={mod.id}
            mod={mod}
            isExpanded={expandedId === mod.id}
            onToggle={() => setExpandedId(expandedId === mod.id ? null : mod.id)}
            onUpdate={onUpdate}
            onRemove={onRemove}
            allEntities={allEntities}
          />
        ))}

        {(!manifest.modulations || manifest.modulations.length === 0) && (
          <div className="py-8 border border-dashed border-white/5 rounded-sm flex flex-col items-center justify-center gap-2 opacity-30">
             <Activity className="w-5 h-5" />
             <span className="text-[8px] font-bold uppercase tracking-tighter">No internal routings defined</span>
          </div>
        )}
      </div>
    </div>
  );
}
