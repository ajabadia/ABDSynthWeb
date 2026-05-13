'use client';
 
import React from 'react';
import { Fingerprint, Lock } from 'lucide-react';
import type { ManifestEntity, OMEGA_Manifest, OmegaNode } from '@/omega-ui-core/types/manifest';
import InspectorCollapsible from '@/features/manifest-editor/components/inspector/shared/InspectorCollapsible';
import { getInspectorModel, buildInspectorPatch } from '@/features/manifest-editor/hooks/entities/ucaInspectorModel';
 
interface EntityIdentityProps {
  entity: ManifestEntity | OmegaNode;
  rootManifest?: OMEGA_Manifest | undefined;
  rootTree?: OmegaNode | undefined;
  onUpdate: (updates: Partial<ManifestEntity> | Partial<OmegaNode>) => void;
  onHelp?: ((id: string) => void) | undefined;
  isHighlighted: (key: string) => boolean;
}
 
export default function EntityIdentity({ entity, rootManifest, rootTree, onUpdate, onHelp, isHighlighted }: EntityIdentityProps) {
  const model = getInspectorModel(entity, rootTree, rootManifest?.moduleTemplates);
 
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
            <div className="flex items-center justify-between ml-1">
              <label className="text-[7px] font-black wb-text-muted uppercase tracking-widest">Canonical ID</label>
              {model.governance?.['id'] === 'locked' && <Lock size={8} className="text-amber-500/50" />}
            </div>
            <input 
              type="text" 
              value={model.id} 
              onChange={(e) => onUpdate(buildInspectorPatch(entity, { id: e.target.value }))}
              disabled={model.governance?.['id'] === 'locked'}
              className={`w-full bg-black/5 border ${isHighlighted('id') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all font-mono [color-scheme:dark] ${model.governance?.['id'] === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[7px] font-black wb-text-muted uppercase tracking-widest">Display Label</label>
              {model.governance?.['label'] === 'locked' && <Lock size={8} className="text-amber-500/50" />}
            </div>
            <input 
              type="text" 
              value={('label' in entity ? entity.label : (entity as OmegaNode).meta?.label as string) || ''} 
              onChange={(e) => onUpdate('label' in entity ? { label: e.target.value } : { meta: { ...((entity as OmegaNode).meta || {}), label: e.target.value } })}
              disabled={model.governance?.['label'] === 'locked'}
              className={`w-full bg-black/5 border ${isHighlighted('label') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none focus:border-primary/40 transition-all [color-scheme:dark] ${model.governance?.['label'] === 'locked' ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>
    </InspectorCollapsible>
  );
}
