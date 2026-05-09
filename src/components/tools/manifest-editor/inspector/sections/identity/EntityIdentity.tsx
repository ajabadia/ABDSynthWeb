'use client';

import React from 'react';
import { Fingerprint } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest, OmegaNode } from '@/types/manifest';
import InspectorCollapsible from '../../shared/InspectorCollapsible';
import { getInspectorModel, buildInspectorPatch } from '@/hooks/manifest-editor/entities/ucaInspectorModel';

interface EntityIdentityProps {
  entity: ManifestEntity | OmegaNode;
  rootManifest?: OMEGA_Manifest;
  rootTree?: OmegaNode;
  onUpdate: (updates: Partial<ManifestEntity> | Partial<OmegaNode>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean | undefined;
}

export default function EntityIdentity({ entity, rootManifest, rootTree, onUpdate, onHelp, isHighlighted }: EntityIdentityProps) {
  const model = getInspectorModel(entity, rootTree);

  const getAuthority = () => {
    if (!rootManifest) return null;
    // Authority index is mostly legacy concept, but we can search arrays
    const cIdx = (rootManifest.ui?.controls || []).findIndex(c => c.id === model.id);
    if (cIdx !== -1) return { type: 'ParamId', value: cIdx };
    const jIdx = (rootManifest.ui?.jacks || []).findIndex(j => j.id === model.id);
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
              value={model.id} 
              onChange={(e) => onUpdate(buildInspectorPatch(entity, { id: e.target.value }))}
              className={`w-full bg-black/5 border ${isHighlighted('id') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all font-mono [color-scheme:dark]`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[7px] font-black wb-text-muted uppercase ml-1 tracking-widest">Display Label</label>
            <input 
              type="text" 
              value={'label' in entity ? (entity as ManifestEntity).label || '' : ''} 
              onChange={(e) => onUpdate('label' in entity ? { label: e.target.value } : {})}
              disabled={!('label' in entity)}
              className={`w-full bg-black/5 border ${isHighlighted('label') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none focus:border-primary/40 transition-all [color-scheme:dark] ${!('label' in entity) ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>
    </InspectorCollapsible>
  );
}
