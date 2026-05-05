'use client';

import React from 'react';
import { Tags } from 'lucide-react';
import { OMEGA_Manifest, ManifestMetadata } from '@/types/manifest';

interface ModuleTaxonomyProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  isHighlighted: (key: string) => boolean | undefined;
}

const FAMILIES = [
  { id: 'osc', label: 'OSC', desc: 'Oscillators' },
  { id: 'filter', label: 'FILTER', desc: 'Filters' },
  { id: 'env', label: 'ENV', desc: 'Envelopes' },
  { id: 'lfo', label: 'LFO', desc: 'Modulators' },
  { id: 'vca', label: 'VCA', desc: 'Dynamics' },
  { id: 'fx', label: 'FX', desc: 'Effects' },
  { id: 'utility', label: 'UTIL', desc: 'Utility' },
  { id: 'io', label: 'I/O', desc: 'I/O & MIDI' },
  { id: 'sequencer', label: 'SEQ', desc: 'Sequencers' },
];

export default function ModuleTaxonomy({ manifest, onUpdate, isHighlighted }: ModuleTaxonomyProps) {
  const metadata = manifest.metadata;

  const updateMetadata = (field: keyof ManifestMetadata, value: unknown) => {
    onUpdate({ metadata: { ...metadata, [field]: value } } as Partial<OMEGA_Manifest>);
  };

  return (
    <div className="space-y-4">
      <div className="text-[7px] font-black uppercase wb-text-muted flex items-center gap-2 tracking-[0.2em]">
         <Tags className="w-3 h-3" />
         <span>Industrial Family</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {FAMILIES.map((f) => (
          <button
            key={f.id}
            onClick={() => updateMetadata('family', f.id)}
            className={`p-2 border rounded-xs transition-all flex flex-col items-center gap-1 ${
              isHighlighted('family') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
            } ${
              metadata.family === f.id 
                ? 'bg-primary/20 border-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]' 
                : 'bg-black/5 border wb-outline hover:border-outline/30'
            }`}
          >
            <span className={`text-[9px] font-black ${metadata.family === f.id ? 'wb-text' : 'wb-text-muted'}`}>
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
