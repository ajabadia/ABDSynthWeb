'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { ManifestEntity, TabName } from '@/types/manifest';

interface ArchPlaneSelectorProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (id: string) => void;
}

export default function ArchPlaneSelector({ item, onUpdate, onHelp }: ArchPlaneSelectorProps) {
  return (
    <div className="space-y-3 bg-white/[0.02] border border-outline/10 p-4 rounded-xs">
      <div className="flex items-center justify-between pr-1">
        <label className="text-[8px] font-black wb-text-muted uppercase ml-1 tracking-[0.1em]">Era 7 Plane (Tab)</label>
        <button onClick={() => onHelp?.('tabs')} className="hover:text-primary transition-colors">
          <Info className="w-2.5 h-2.5 wb-text-muted opacity-60" />
        </button>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {(['MAIN', 'FX', 'EDIT', 'MIDI', 'MOD'] as TabName[]).map(t => (
          <button
            key={t}
            onClick={() => onUpdate({ presentation: { ...item.presentation, tab: t } })}
            className={`py-2 text-[7px] font-black uppercase rounded-xs border transition-all text-center ${
              (item.presentation?.tab || 'MAIN') === t 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
