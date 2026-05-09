'use client';
 
import React from 'react';
import { Palette } from 'lucide-react';
import KnobProperties from '../primitives/KnobProperties';
import LedProperties from '../primitives/LedProperties';
import PortProperties from '../primitives/PortProperties';
import SliderProperties from '../primitives/SliderProperties';
import DisplayProperties from '../primitives/DisplayProperties';
import SwitchProperties from '../primitives/SwitchProperties';
import SelectProperties from '../primitives/SelectProperties';
import IllustrationProperties from '../primitives/IllustrationProperties';
import { getElementDefinition } from '@/omega-ui-core/governance/ElementCatalog';
import SourceCodeView from '../shared/SourceCodeView';
import { Shield, Box, Terminal } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest, LayoutContainer, OmegaNode } from '@/omega-ui-core/types/manifest';
import { buildInspectorPatch } from '@/hooks/manifest-editor/entities/ucaInspectorModel';
import InspectorCollapsible from '../shared/InspectorCollapsible';
import IndustrialGovernanceConsole from '../shared/IndustrialGovernanceConsole';
 
interface AestheticSectionProps {
  item: ManifestEntity;
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  containers?: LayoutContainer[];
  highlightPath?: string | null;
  resolveAsset: (id: string | undefined) => string | undefined;
  onOpenConfig?: () => void;
  setActiveSection?: (s: string) => void;
}
 
export default function AestheticSection({ item, manifest, onUpdate, resolveAsset, setActiveSection, onOpenConfig: handleOpenConfig }: AestheticSectionProps) {
  const [showSource, setShowSource] = React.useState(false);
  const isUCA = 'kind' in item;
  const componentType = isUCA ? (item as unknown as OmegaNode).cellRef || (item as unknown as OmegaNode).kind || 'knob' : (item.presentation?.component || 'knob');
  const elementDef = getElementDefinition(componentType);

  // Governance Filter: Dynamically check if this component has ANY aesthetic capabilities defined in the Catalog
  const hasAesthetics = (elementDef?.capabilities?.length || 0) > 0;
 
  const renderSpecializedEditor = () => {
    if (!hasAesthetics && elementDef) {
        return (
            <div className="p-4 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xs flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-500/40" />
                <p className="text-[7px] text-amber-500/60 font-bold uppercase leading-tight italic">
                    This element is registered as <span className="text-amber-500 font-black">{elementDef.label}</span> but has no aesthetic overrides defined in the Era 7 Governance Contract.
                </p>
            </div>
        );
    }

    const commonProps = { item, manifest, onUpdate, setActiveSection, resolveAsset };

    switch (componentType) {
      case 'knob': return <KnobProperties {...commonProps} resolveAsset={resolveAsset} />;
      case 'led': return <LedProperties {...commonProps} />;
      case 'port': return <PortProperties {...commonProps} resolveAsset={resolveAsset} />;
      case 'slider-v':
      case 'slider-h': return <SliderProperties {...commonProps} />;
      case 'display': return <DisplayProperties {...commonProps} />;
      case 'select': return <SelectProperties {...commonProps} />;
      case 'switch':
      case 'button': return <SwitchProperties {...commonProps} />;
      case 'illustration': return <IllustrationProperties {...commonProps} resolveAsset={resolveAsset} />;
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
    <div className="space-y-4 pb-20 pt-2">
      
      <InspectorCollapsible 
        title="Component Aesthetics" 
        icon={Palette}
      >
        <div className="pt-2 space-y-4">
          {/* CATALOG GOVERNANCE HEADER */}
          <div className="p-3 bg-black/40 border wb-outline rounded-xs space-y-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Shield className="w-3 h-3 text-primary" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-primary">{elementDef?.label || 'Custom Element'}</span>
                </div>
                <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded-full border border-primary/20">
                   <span className="text-[6px] font-black uppercase text-primary">{elementDef?.category || 'User'}</span>
                </div>
             </div>
             <p className="text-[7px] wb-text-muted font-bold uppercase leading-tight italic">
               {elementDef?.description || 'Unregistered UI primitive. Specialized governance may be limited.'}
             </p>
             <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => setShowSource(!showSource)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-xs border transition-all ${showSource ? 'bg-accent/20 border-accent text-accent' : 'wb-surface-subtle wb-outline wb-text-muted hover:wb-text'}`}
                >
                   <Terminal className="w-2.5 h-2.5" />
                   <span className="text-[7px] font-black uppercase">Deep Audit (Source)</span>
                </button>
             </div>
          </div>

          {showSource && (
            <SourceCodeView data={item.presentation} title={elementDef?.label || 'Component'} />
          )}

          <div className="pt-2">
            {renderSpecializedEditor()}
          </div>

          {/* INDUSTRIAL GOVERNANCE CONSOLE (Era 7.2.3) */}
          <div className="pt-4 border-t border-outline/5 space-y-4">
             <IndustrialGovernanceConsole 
               type={componentType}
               values={isUCA ? (item as unknown as OmegaNode).style || {} : item.presentation?.style || {}}
               manifest={manifest}
               onUpdate={(updates) => {
                 if (isUCA) {
                   onUpdate(buildInspectorPatch(item as unknown as OmegaNode, { style: updates }));
                 } else {
                   onUpdate({ 
                     presentation: { 
                       ...item.presentation, 
                       style: { ...(item.presentation?.style || {}), ...updates } 
                     } 
                   });
                 }
               }}
               resolveAsset={resolveAsset}
               title="High Fidelity Overrides"
               onOpenConfig={handleOpenConfig}
             />
          </div>
        </div>
      </InspectorCollapsible>
    </div>
  );
}
