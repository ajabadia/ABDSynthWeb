'use client';

import React from 'react';
import { Box, Info } from 'lucide-react';
import { OMEGA_Manifest, ManifestMetadata } from '@/types/manifest';

interface ModuleSignatureProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  onHelp?: (id: string) => void;
  isHighlighted: (key: string) => boolean | undefined;
  highlightPath?: string | null;
}

export default function ModuleSignature({ manifest, onUpdate, onHelp, isHighlighted }: ModuleSignatureProps) {
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
      </div>
    </div>
  );
}
