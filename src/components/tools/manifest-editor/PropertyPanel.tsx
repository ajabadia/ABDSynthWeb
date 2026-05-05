'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Specialized Sections
import IdentitySection from './inspector/IdentitySection';
import LogicSection from './inspector/LogicSection';
import AestheticSection from './inspector/AestheticSection';
import AttachmentsSection from './inspector/AttachmentsSection';
import EngineeringSection from './inspector/EngineeringSection';
import EntityListSection from './inspector/EntityListSection';
import SpatialSection from './inspector/SpatialSection';
import CellPreview from './inspector/CellPreview';
import ModulationSection from './inspector/ModulationSection';
import ResourceSection from './inspector/ResourceSection';
import ContainerSection from './inspector/ContainerSection';

// Layout Components & Hooks
import InspectorHeader from './inspector/layout/InspectorHeader';
import InspectorNav from './inspector/layout/InspectorNav';
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
  manifest: OMEGA_Manifest;
  uiTheme?: 'dark' | 'light';
}

export default function PropertyPanel(props: PropertyPanelProps) {
  const { activeSection, setActiveSection, isModule, sections } = usePropertyPanel(props.item as ManifestEntity | OMEGA_Manifest, props.highlightPath);

  if (!props.item) return null;

  return (
    <div className="h-full wb-surface border-l wb-outline flex flex-col shadow-2xl overflow-hidden transition-colors duration-500">
      <InspectorHeader id={props.item.id} isModule={isModule} onClose={props.onClose || (() => {})} />
      {!isModule && <CellPreview item={props.item as ManifestEntity} />}
      <InspectorNav sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            {activeSection === 'identity' && (
              <IdentitySection 
                item={props.item} 
                onUpdate={(u) => props.onUpdate?.(u)} 
                onHelp={props.onHelp} 
                rootManifest={props.manifest} 
                highlightPath={props.highlightPath}
              />
            )}

            {isModule ? (
              <>
                {activeSection === 'layout' && props.addContainer && (
                  <ContainerSection containers={(props.item as OMEGA_Manifest).ui.layout?.containers || []} onAdd={props.addContainer} onUpdate={props.updateContainer!} onRemove={props.removeContainer!} highlightPath={props.highlightPath} />
                )}
                {activeSection === 'controls' && props.onSelectItem && (
                  <EntityListSection items={(props.item as OMEGA_Manifest).ui?.controls || []} title="Interactive Controls" type="control" onSelectItem={props.onSelectItem} onAddEntity={props.onAddEntity!} onDuplicateItem={props.onDuplicateItem!} onRemoveItem={props.onRemoveItem!} manifest={props.manifest} />
                )}
                {activeSection === 'signals' && props.onSelectItem && (
                  <EntityListSection items={(props.item as OMEGA_Manifest).ui?.jacks || []} title="Signal Ports / Jacks" type="jack" onSelectItem={props.onSelectItem} onAddEntity={props.onAddEntity!} onDuplicateItem={props.onDuplicateItem!} onRemoveItem={props.onRemoveItem!} manifest={props.manifest} />
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
                {activeSection === 'spatial' && <SpatialSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} onHelp={props.onHelp} highlightPath={props.highlightPath} containers={props.manifest?.ui?.layout?.containers || []} />}
                {activeSection === 'aesthetic' && <AestheticSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} onHelp={props.onHelp} containers={props.manifest?.ui?.layout?.containers || []} highlightPath={props.highlightPath} />}
                {activeSection === 'attachments' && <AttachmentsSection item={props.item as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
