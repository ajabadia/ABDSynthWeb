'use client';

import React from 'react';
import { Palette, Box } from 'lucide-react';
import KnobProperties from './KnobProperties';
import LedProperties from './LedProperties';
import PortProperties from './PortProperties';
import SliderProperties from './SliderProperties';
import DisplayProperties from './DisplayProperties';
import SwitchProperties from './SwitchProperties';
import SelectProperties from './SelectProperties';
import IllustrationProperties from './IllustrationProperties';

import { ManifestEntity, LayoutContainer, OMEGA_Manifest } from '@/types/manifest';
import ArchPlaneSelector from './aesthetic/ArchPlaneSelector';

interface AestheticSectionProps {
  item: ManifestEntity;
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  containers?: LayoutContainer[];
  highlightPath?: string | null;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function AestheticSection({ item, manifest, onUpdate, onHelp, highlightPath, resolveAsset }: AestheticSectionProps) {
  const componentType = item.presentation?.component || 'knob';

  const renderSpecializedEditor = () => {
    switch (componentType) {
      case 'knob': return <KnobProperties item={item} onUpdate={onUpdate} />;
      case 'led': return <LedProperties item={item} onUpdate={onUpdate} />;
      case 'port': return <PortProperties item={item} onUpdate={onUpdate} highlightPath={highlightPath} />;
      case 'slider-v':
      case 'slider-h': return <SliderProperties item={item} onUpdate={onUpdate} />;
      case 'display': return <DisplayProperties item={item} onUpdate={onUpdate} />;
      case 'select': return <SelectProperties item={item} onUpdate={onUpdate} />;
      case 'switch':
      case 'button': return <SwitchProperties item={item} onUpdate={onUpdate} />;
      case 'illustration': return <IllustrationProperties item={item} manifest={manifest} onUpdate={onUpdate} resolveAsset={resolveAsset} />;
      default: return (
        <div className="p-8 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center gap-3 opacity-30">
          <Box className="w-8 h-8" />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest">Generic Component</p>
            <p className="text-[7px] font-bold mt-1 italic uppercase">No specialized aesthetics for &apos;{componentType}&apos;</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <ArchPlaneSelector item={item} onUpdate={onUpdate} onHelp={onHelp} />
      

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1 wb-text-muted opacity-80">
           <Palette className="w-3.5 h-3.5 text-primary" />
           <span className="text-[9px] font-black uppercase tracking-widest italic">Component Aesthetics</span>
        </div>
        {renderSpecializedEditor()}
      </div>

    </div>
  );
}
