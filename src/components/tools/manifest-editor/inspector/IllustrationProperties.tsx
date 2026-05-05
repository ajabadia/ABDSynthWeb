'use client';

import React from 'react';
import { Maximize2, Layers } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest } from '@/types/manifest';
import AssetSelector from './shared/AssetSelector';

interface IllustrationPropertiesProps {
  item: ManifestEntity;
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function IllustrationProperties({ item, manifest, onUpdate, resolveAsset }: IllustrationPropertiesProps) {
  const pres = item.presentation;
  const size = pres.size || { w: 40, h: 40 };
  const variant = pres.variant || 'contain';
  const opacity = pres.opacity !== undefined ? pres.opacity : 1;
  const assetId = pres.asset;

  return (
    <div className="grid grid-cols-1 gap-6 pt-2">
      <AssetSelector 
        manifest={manifest} 
        selectedAssetId={assetId} 
        onSelect={(id) => onUpdate({ presentation: { ...pres, asset: id } })} 
        resolveAsset={resolveAsset}
      />

      {/* DIMENSIONS */}
      <div className="space-y-3">
        <label className="text-[8px] wb-text-muted font-black uppercase tracking-widest flex items-center gap-2">
            <Maximize2 className="w-2.5 h-2.5" />
            <span>Industrial Scale (HP)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <span className="text-[7px] font-bold opacity-50 uppercase">Width (HP)</span>
                <input 
                    type="number" value={size.w} 
                    onChange={(e) => onUpdate({ presentation: { ...pres, size: { ...size, w: Number(e.target.value) } } })}
                    className="w-full bg-black/20 border border-outline rounded-xs px-2 py-1.5 text-[10px] font-mono text-primary"
                />
            </div>
            <div className="space-y-1">
                <span className="text-[7px] font-bold opacity-50 uppercase">Height (px)</span>
                <input 
                    type="number" value={size.h} 
                    onChange={(e) => onUpdate({ presentation: { ...pres, size: { ...size, h: Number(e.target.value) } } })}
                    className="w-full bg-black/20 border border-outline rounded-xs px-2 py-1.5 text-[10px] font-mono text-primary"
                />
            </div>
        </div>
      </div>

      {/* RENDER MODE */}
      <div className="space-y-3">
        <label className="text-[8px] wb-text-muted font-black uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-2.5 h-2.5" />
            <span>Render mode</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
            {['contain', 'cover', 'stretch'].map(v => (
                <button
                    key={v}
                    onClick={() => onUpdate({ presentation: { ...pres, variant: v } })}
                    className={`py-1.5 rounded-xs border text-[8px] font-black uppercase transition-all ${variant === v ? 'border-primary bg-primary/20 text-primary' : 'border-outline text-foreground/40'}`}
                >
                    {v}
                </button>
            ))}
        </div>
      </div>

      {/* OPACITY SLIDER */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-[8px] wb-text-muted font-black uppercase tracking-widest">Opacity</label>
            <span className="text-[9px] font-mono text-primary font-black">{Math.round(opacity * 100)}%</span>
        </div>
        <input 
            type="range" min="0" max="1" step="0.1" value={opacity}
            onChange={(e) => onUpdate({ presentation: { ...pres, opacity: Number(e.target.value) } })}
            className="w-full accent-primary"
        />
      </div>
    </div>
  );
}
