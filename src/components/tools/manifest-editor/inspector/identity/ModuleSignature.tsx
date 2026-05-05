'use client';

import React from 'react';
import { Box, Info, Target } from 'lucide-react';
import Image from 'next/image';
import { OMEGA_Manifest, ManifestMetadata } from '@/types/manifest';
import AssetSelector from '../shared/AssetSelector';

interface ModuleSignatureProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean | undefined;
  highlightPath?: string | null;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function ModuleSignature({ manifest, onUpdate, onHelp, isHighlighted, resolveAsset }: ModuleSignatureProps) {
  const metadata = manifest.metadata;

  const updateMetadata = (field: keyof ManifestMetadata, value: unknown) => {
    onUpdate({ metadata: { ...metadata, [field]: value } } as Partial<OMEGA_Manifest>);
  };

  return (
    <div className="space-y-4">
      <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
         <div className="flex items-center gap-2">
            <Box className="w-3 h-3" />
            <span>Module Signature</span>
         </div>
         <button onClick={() => onHelp?.('introduccion')} className="hover:text-primary transition-colors">
            <Info className="w-3 h-3" />
         </button>
      </div>
      <div className="space-y-4">
        {/* ROW 1: SCHEMA & ID */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Schema</label>
            <input 
              type="text" 
              value={manifest.schemaVersion || '7.1'} 
              onChange={(e) => onUpdate({ schemaVersion: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('schemaVersion') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all`}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Canonical ID (Unique)</label>
            <input 
              type="text" 
              value={manifest.id || ''} 
              onChange={(e) => onUpdate({ id: e.target.value })}
              className={`w-full bg-black/5 border ${isHighlighted('id') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all`}
            />
          </div>
        </div>

        {/* ROW 2: NAME, VERSION & HP */}
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-3 space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Commercial Name</label>
            <input 
              type="text" 
              value={metadata.name || ''} 
              onChange={(e) => updateMetadata('name', e.target.value)}
              className={`w-full bg-black/5 border ${isHighlighted('name') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-bold wb-text outline-none focus:border-primary/40 transition-all`}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">Version</label>
            <input 
              type="text" 
              value={metadata.version || '1.0.0'} 
              onChange={(e) => updateMetadata('version', e.target.value)}
              className="w-full bg-black/5 border wb-outline rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] font-bold wb-text-muted uppercase ml-1">HP</label>
            <input 
              type="number" 
              value={metadata.rack?.hp || 12} 
              onChange={(e) => updateMetadata('rack', { ...(metadata.rack || {}), hp: Math.max(1, parseInt(e.target.value) || 1) })}
              className={`w-full bg-black/5 border ${isHighlighted('hp') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'wb-outline'} rounded-xs px-3 py-2 text-[10px] font-mono wb-text outline-none focus:border-primary/40 transition-all text-center`}
            />
          </div>
        </div>
 
        {/* ROW 3: IDENTITY ICON (ERA 7.2.3) */}
        <div className="space-y-3 pt-2">
           <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
              <Target className="w-3 h-3 text-primary" />
              <span>Identity Branding (Registry Icon)</span>
           </div>
           
           <div className="flex gap-4 items-start">
              {/* MINI PREVIEW */}
              <div className="w-20 h-20 bg-black/40 border wb-outline rounded-xs flex items-center justify-center overflow-hidden relative group">
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
                    Standard: <span className="text-primary">module_logo.svg</span>
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
    </div>
  );
}
