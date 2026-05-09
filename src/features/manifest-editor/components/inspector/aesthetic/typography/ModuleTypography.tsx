'use client';
 
import React from 'react';
import { Type, ShieldAlert } from 'lucide-react';
import { OMEGA_Manifest } from '@/types/manifest';
import InspectorCollapsible from '../../shared/InspectorCollapsible';
import InfoBlock from '../../shared/InfoBlock';
import { 
  OMEGA_OFFICIAL_FONTS, 
} from '@/omega-ui-core/typography/registry';

// Sub-components
import FontAssetManager from './components/FontAssetManager';
import AbstractFontMap from './components/AbstractFontMap';
import GlobalFallbackSelector from './components/GlobalFallbackSelector';
 
interface ModuleTypographyProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  onHelp?: (id: string) => void;
}
 
const SYSTEM_FONTS = OMEGA_OFFICIAL_FONTS;
 
export default function ModuleTypography({ manifest, onUpdate, onHelp }: ModuleTypographyProps) {
  const fonts = manifest.ui.resources?.fonts || [];
  const typography = manifest.ui.typography || {};
  const allAvailableFonts = [...SYSTEM_FONTS.map(f => f.name), ...fonts.map(f => f.name)];
 
  const handleAddFont = (name: string, file: string) => {
    const updatedFonts = [...fonts, { name, file }];
    onUpdate({
      ui: {
        ...manifest.ui,
        resources: { ...manifest.ui.resources, fonts: updatedFonts }
      }
    });
  };
 
  const handleRemoveFont = (index: number) => {
    const updatedFonts = fonts.filter((_, i) => i !== index);
    onUpdate({
      ui: {
        ...manifest.ui,
        resources: { ...manifest.ui.resources, fonts: updatedFonts }
      }
    });
  };

  const handleUpdatePointer = (id: string, updates: { label?: string; family?: string }) => {
    const others = (typography.definitions || []).filter(d => d.id !== id);
    const def = typography.definitions?.find(d => d.id === id) || { 
      id, 
      label: id.replace('font_', 'Font ').toUpperCase(), 
      family: '' 
    };
    
    onUpdate({
      ui: {
        ...manifest.ui,
        typography: {
          ...typography,
          definitions: [...others, { ...def, ...updates }]
        }
      }
    });
  };
 
  return (
    <InspectorCollapsible 
      title="Industrial Typography" 
      icon={Type}
      onHelp={() => onHelp?.('typography')}
    >
      <div className="space-y-6 pt-2">
        {/* 1. FONT ASSETS */}
        <FontAssetManager 
          fonts={fonts}
          onAdd={handleAddFont}
          onRemove={handleRemoveFont}
        />

        {/* 2. ABSTRACT MAP & FALLBACK */}
        <div className="space-y-4">
           <GlobalFallbackSelector 
              defaultFont={typography.defaultFont || ''}
              availableFonts={allAvailableFonts}
              onChange={(font) => onUpdate({ ui: { ...manifest.ui, typography: { ...typography, defaultFont: font } } })}
           />

           <AbstractFontMap 
              definitions={typography.definitions || []}
              availableFonts={allAvailableFonts}
              onUpdate={handleUpdatePointer}
           />
        </div>

        <InfoBlock 
          title="Industrial Protection"
          icon={ShieldAlert}
          message="Era 7.2.3 enforces global typographic consistency. Individual components will inherit these category defaults unless explicitly overridden in advanced properties."
          variant="muted"
        />
      </div>
    </InspectorCollapsible>
  );
}
