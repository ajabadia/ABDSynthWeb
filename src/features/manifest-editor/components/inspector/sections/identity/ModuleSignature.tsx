'use client';

import React from 'react';
import { Box, Target } from 'lucide-react';
import Image from 'next/image';
import { OMEGA_Manifest, ManifestMetadata } from '@/omega-ui-core/types/manifest';
import AssetSelector from '../../shared/AssetSelector';
import InspectorCollapsible from '../../shared/InspectorCollapsible';
import { IndustrialField } from '../../../primitives/IndustrialField';
import { IndustrialInput } from '../../../primitives/IndustrialInput';
import { IndustrialTextArea } from '../../../primitives/IndustrialTextArea';

interface ModuleSignatureProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function ModuleSignature({ manifest, onUpdate, onHelp, isHighlighted, resolveAsset }: ModuleSignatureProps) {
  const metadata = manifest.metadata;

  const updateMetadata = (field: keyof ManifestMetadata, value: unknown) => {
    onUpdate({ metadata: { ...metadata, [field]: value } } as Partial<OMEGA_Manifest>);
  };

  return (
    <InspectorCollapsible 
      title="Module Signature" 
      icon={Box} 
      onHelp={() => onHelp?.('introduccion')}
    >
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-3 gap-3">
          <IndustrialField 
            label="Schema" 
            highlightKey="schemaVersion" 
            isHighlighted={isHighlighted}
          >
            <IndustrialInput 
              value={manifest.schemaVersion || '7.1'} 
              onChange={(v) => onUpdate({ schemaVersion: v })}
              mono
            />
          </IndustrialField>

          <div className="col-span-2">
            <IndustrialField 
              label="Canonical ID (Unique)" 
              highlightKey="id" 
              isHighlighted={isHighlighted}
            >
              <IndustrialInput 
                value={manifest.id || ''} 
                onChange={(v) => onUpdate({ id: v })}
                mono
                placeholder="module_id_v1"
              />
            </IndustrialField>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3">
            <IndustrialField 
              label="Commercial Name" 
              highlightKey="name" 
              isHighlighted={isHighlighted}
            >
              <IndustrialInput 
                value={metadata.name || ''} 
                onChange={(v) => updateMetadata('name', v)}
                placeholder="OMEGA NEURONIK"
              />
            </IndustrialField>
          </div>
          <div className="col-span-2">
            <IndustrialField label="Version">
              <IndustrialInput 
                value={metadata.version || '1.0.0'} 
                onChange={(v) => updateMetadata('version', v)}
                mono
              />
            </IndustrialField>
          </div>
          <IndustrialField 
            label="HP" 
            highlightKey="hp" 
            isHighlighted={isHighlighted}
          >
            <IndustrialInput 
              type="number"
              value={metadata.rack?.hp || 12} 
              onChange={(v) => updateMetadata('rack', { ...(metadata.rack || {}), hp: Math.max(1, parseInt(v) || 1) })}
              mono
              align="center"
            />
          </IndustrialField>
        </div>

        <IndustrialField label="Module Description">
          <IndustrialTextArea 
            value={metadata.description || ''} 
            onChange={(v) => updateMetadata('description', v)}
            placeholder="ENTER MODULE DOCUMENTATION / SPECIFICATIONS..."
            rows={5}
          />
        </IndustrialField>

        <div className="space-y-3 pt-2">
           <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
              <Target className="w-3 h-3 text-primary" />
              <span>Identity Branding (Registry Icon)</span>
           </div>
           
           <div className="flex gap-4 items-start">
              <div className="w-20 h-20 wb-surface-strong border wb-outline rounded-xs flex items-center justify-center overflow-hidden relative group">
                 {metadata.icon ? (
                    <div className="w-full h-full p-2 flex items-center justify-center bg-primary/5">
                      <Image 
                        src={resolveAsset(metadata.icon) || ''} 
                        fill
                        unoptimized
                        className="p-2 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                        alt="Module Logo"
                      />
                    </div>
                 ) : (
                    <Box className="w-8 h-8 opacity-10" />
                 )}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity">
                    <span className="text-[6px] font-black uppercase">Module Face</span>
                 </div>
              </div>

              <div className="flex-1 space-y-2">
                 <p className="text-[7px] wb-text-muted leading-relaxed uppercase font-bold tracking-tighter">
                    Select the high-fidelity asset to be displayed in the OMEGA Module Registry. 
                 </p>
                 
                 <AssetSelector 
                    manifest={manifest}
                    selectedAssetId={metadata.icon}
                    onSelect={(id) => updateMetadata('icon', id)}
                    resolveAsset={resolveAsset}
                 />
              </div>
           </div>
        </div>
      </div>
    </InspectorCollapsible>
  );
}
