'use client';

import React from 'react';
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { OMEGA_Manifest } from '@/types/manifest';

interface AssetSelectorProps {
  manifest: OMEGA_Manifest;
  selectedAssetId?: string;
  onSelect: (assetId: string | undefined) => void;
  label?: string;
  resolveAsset: (id: string | undefined) => string | undefined;
}

/**
 * AssetSelector (Fase 13)
 * Unified UI for choosing resources from the manifest's asset catalog.
 */
export default function AssetSelector({ 
  manifest, 
  selectedAssetId, 
  onSelect, 
  label = 'Branding Asset',
  resolveAsset
}: AssetSelectorProps) {
  const assets = manifest.resources?.assets || [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
          <label className="text-[8px] wb-text-muted font-black uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-2.5 h-2.5 text-primary" />
            <span>{label}</span>
          </label>
          
          {selectedAssetId && (
            <button 
                onClick={() => onSelect(undefined)}
                className="text-[7px] text-red-400 font-bold uppercase hover:text-red-300 flex items-center gap-1"
            >
                <Trash2 className="w-2 h-2" />
                Clear
            </button>
          )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* DIRECT UPLOAD BUTTON */}
        <button
          onClick={() => document.getElementById('asset-direct-upload')?.click()}
          className="p-2 rounded-xs border border-dashed border-primary/30 bg-primary/5 flex flex-col gap-1 items-center justify-center hover:bg-primary/10 hover:border-primary transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[7px] font-black uppercase tracking-tighter text-primary/60">Upload & Assign</span>
          <input 
            id="asset-direct-upload"
            type="file" 
            multiple
            className="hidden" 
            accept="image/*,.svg"
            onChange={(e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;
              
              // Direct injection via manifest editor hook
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const uploadBridge = (window as any).triggerAssetUpload as ((f: File | File[], cb: (id: string) => void) => Promise<void>) | undefined;
              if (uploadBridge) {
                uploadBridge(Array.from(files), (assetId: string) => onSelect(assetId));
              }
            }}
          />
        </button>

        {assets.map(asset => (
          <button
            key={asset.id}
            onClick={() => onSelect(asset.id)}
            className={`
                p-2 rounded-xs border flex flex-col gap-1 items-center transition-all group overflow-hidden
                ${selectedAssetId === asset.id 
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                    : 'border-outline text-foreground/40 hover:border-primary/50'}
            `}
          >
            <div className="w-full aspect-square bg-black/40 rounded-xs flex items-center justify-center overflow-hidden border border-white/5 relative">
                {/* Visual Preview */}
                <Image 
                  src={resolveAsset(asset.id) || ''} 
                  fill
                  unoptimized
                  className="p-1 object-contain opacity-40 group-hover:opacity-100 transition-opacity"
                  alt={asset.id}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 font-black">
                   SELECT
                </span>
            </div>
            <span className="text-[6px] font-black uppercase tracking-tighter truncate w-full text-center mt-1">
              {asset.id.split('/').pop()}
            </span>
          </button>
        ))}

        {assets.length === 0 && (
          <div className="p-4 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center opacity-20 grayscale">
            <p className="text-[6px] font-bold uppercase">Workspace Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
