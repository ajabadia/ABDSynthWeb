'use client';

import React from 'react';
import { Fingerprint } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest } from '@/types/manifest';
import InspectorCollapsible from '../../shared/InspectorCollapsible';

interface EntityIdentityProps {
  entity: ManifestEntity;
  rootManifest?: OMEGA_Manifest;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean | undefined;
}

export default function EntityIdentity({ entity, rootManifest, onUpdate, onHelp, isHighlighted }: EntityIdentityProps) {
  const getAuthority = () => {
    if (!rootManifest) return null;
    const cIdx = (rootManifest.ui?.controls || []).findIndex(c => c.id === entity.id);
    if (cIdx !== -1) return { type: 'ParamId', value: cIdx };
    const jIdx = (rootManifest.ui?.jacks || []).findIndex(j => j.id === entity.id);
    if (jIdx !== -1) return { type: 'PortId', value: jIdx };
    return null;
  };
  const auth = getAuthority();

  return (
    <InspectorCollapsible 
      title="Entity Identification" 
      icon={Fingerprint}
      onHelp={() => onHelp?.('cells')}
    >
      <div className="space-y-4 pt-2">
         {auth && (
           <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full w-fit">
             <span className="text-[6px] text-primary font-black uppercase">{auth.type}:</span>
             <span className="text-[6px] text-primary font-mono font-bold">#{auth.value}</span>
           </div>
         )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[7px] font-black wb-text-muted uppercase ml-1 tracking-widest">Canonical ID</label>
            <input 
              type="text" 
              value={entity.id} 
              onChange={(e) => onUpdate({ id: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('id') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all font-mono [color-scheme:dark]`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[7px] font-black wb-text-muted uppercase ml-1 tracking-widest">Display Label</label>
            <input 
              type="text" 
              value={entity.label || ''} 
              onChange={(e) => onUpdate({ label: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('label') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none focus:border-primary/40 transition-all [color-scheme:dark]`}
            />
          </div>
        </div>
      </div>
    </InspectorCollapsible>
  );
}
