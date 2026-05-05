'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Specialized Sections
import IdentitySection from './IdentitySection';
import LogicSection from './LogicSection';
import AestheticSection from './AestheticSection';
import AttachmentsSection from './AttachmentsSection';
import EngineeringSection from './EngineeringSection';
import EntityListSection from './EntityListSection';
import SpatialSection from './SpatialSection';
import CellPreview from './CellPreview';
import ModulationSection from './ModulationSection';
import ResourceSection from './ResourceSection';
import ContainerSection from './ContainerSection';
 
// Layout Components & Hooks
import InspectorHeader from './layout/InspectorHeader';
import InspectorNav from './layout/InspectorNav';
import { usePropertyPanel } from '@/hooks/manifest-editor/usePropertyPanel';

import { ManifestEntity, OMEGA_Manifest, OMEGA_Modulation, LayoutContainer, ExtraResource } from '@/types/manifest';

export interface PropertyPanelProps {
  item: ManifestEntity | OMEGA_Manifest | null;
  onClose?: () => void;
  onUpdateItem?: (id: string, updates: Partial<ManifestEntity>) => void;
  onUpdate?: (updates: Partial<OMEGA_Manifest> | Partial<ManifestEntity>) => void;
  highlightPath?: string | null;
  availableBinds?: string[];
  onSelectItem?: (id: string | null) => void;
  onAddEntity?: (type: 'control' | 'jack') => void;
  onDuplicateItem?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  onHelp?: (sectionId?: string) => void;
  onAddModulation?: (mod: OMEGA_Modulation) => void;
  onRemoveModulation?: (id: string) => void;
  onUpdateModulation?: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onOpenModGrid?: () => void;
  addContainer?: (c?: Partial<LayoutContainer>) => void;
  updateContainer?: (id: string, updates: Partial<LayoutContainer>) => void;
  removeContainer?: (id: string) => void;
  extraResources?: ExtraResource[];
  onTriggerUpload?: (id: string) => void;
  onRemoveResource?: (name: string) => void;
  resolveAsset: (id: string | undefined) => string | undefined;
  manifest: OMEGA_Manifest;
  uiTheme?: 'dark' | 'light';
}

export default function PropertyPanel(props: PropertyPanelProps) {
  const { activeSection, setActiveSection, isModule, sections } = usePropertyPanel(props.item as ManifestEntity | OMEGA_Manifest, props.highlightPath);

  if (!props.item) return null;
 
  // Unified manifest with injected resources for selectors
  const assetsFromResources = props.extraResources?.map(r => ({ 
    id: `resources/${r.name}`, 
    url: `resources/${r.name}`,
    type: (r.type?.includes('svg') ? 'svg' : 'image') as 'svg' | 'image'
  })) || [];

  const enrichedManifest: OMEGA_Manifest = {
    ...props.manifest,
    resources: {
      ...props.manifest.resources,
      assets: assetsFromResources.length > 0 ? assetsFromResources : (props.manifest.resources?.assets || [])
    }
  };
 
  return (
    <div className="h-full wb-surface border-l wb-outline flex flex-col shadow-2xl overflow-hidden transition-colors duration-500">
      <InspectorHeader id={props.item.id} isModule={isModule} onClose={props.onClose || (() => {})} />
      {!isModule && <CellPreview item={props.item as ManifestEntity} resolveAsset={props.resolveAsset} />}
      <InspectorNav sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            {activeSection === 'identity' && (
              <IdentitySection 
                item={props.item} 
                onUpdate={(u) => props.onUpdate?.(u)} 
                onHelp={props.onHelp} 
                rootManifest={enrichedManifest} 
                highlightPath={props.highlightPath}
                resolveAsset={props.resolveAsset}
              />
            )}
 
            {isModule ? (
              <>
                {activeSection === 'layout' && props.addContainer && (
                  <ContainerSection containers={(props.item as OMEGA_Manifest).ui.layout?.containers || []} manifest={enrichedManifest} onAdd={props.addContainer} onUpdate={props.updateContainer!} onRemove={props.removeContainer!} highlightPath={props.highlightPath} resolveAsset={props.resolveAsset} />
                )}
                {activeSection === 'controls' && props.onSelectItem && (
                  <EntityListSection items={(props.item as OMEGA_Manifest).ui?.controls || []} title="Interactive Controls" type="control" onSelectItem={props.onSelectItem} onAddEntity={props.onAddEntity!} onDuplicateItem={props.onDuplicateItem!} onRemoveItem={props.onRemoveItem!} manifest={enrichedManifest} />
                )}
                {activeSection === 'signals' && props.onSelectItem && (
                  <EntityListSection items={(props.item as OMEGA_Manifest).ui?.jacks || []} title="Signal Ports / Jacks" type="jack" onSelectItem={props.onSelectItem} onAddEntity={props.onAddEntity!} onDuplicateItem={props.onDuplicateItem!} onRemoveItem={props.onRemoveItem!} manifest={enrichedManifest} />
                )}
                {activeSection === 'modulations' && props.onAddModulation && (
                  <ModulationSection manifest={props.item as OMEGA_Manifest} onAdd={props.onAddModulation} onRemove={props.onRemoveModulation!} onUpdate={props.onUpdateModulation!} onOpenModGrid={props.onOpenModGrid} />
                )}
                {activeSection === 'assets' && props.extraResources && (
                  <ResourceSection resources={props.extraResources} onTriggerUpload={() => props.onTriggerUpload?.('resource-upload')} onRemove={props.onRemoveResource} />
                )}
              </>
            ) : (
              <>
                {activeSection === 'engineering' && <EngineeringSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} onHelp={props.onHelp} highlightPath={props.highlightPath} />}
                {activeSection === 'logic' && <LogicSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} highlightPath={props.highlightPath} />}
                {activeSection === 'spatial' && <SpatialSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} onHelp={props.onHelp} highlightPath={props.highlightPath} containers={enrichedManifest?.ui?.layout?.containers || []} />}
                {activeSection === 'aesthetic' && <AestheticSection item={props.item as ManifestEntity} manifest={enrichedManifest} onUpdate={(u) => props.onUpdate?.(u)} onHelp={props.onHelp} containers={enrichedManifest?.ui?.layout?.containers || []} highlightPath={props.highlightPath} resolveAsset={props.resolveAsset} />}
                {activeSection === 'attachments' && <AttachmentsSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
