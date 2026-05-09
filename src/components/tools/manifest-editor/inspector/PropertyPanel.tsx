'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Specialized Sections
import IdentitySection from './sections/IdentitySection';
import LogicSection from './sections/LogicSection';
import AestheticSection from './sections/AestheticSection';
import AttachmentsSection from './sections/AttachmentsSection';
import EngineeringSection from './sections/EngineeringSection';
import ModuleArchitectureSection from './sections/ModuleArchitectureSection';
import LayoutGovernanceSection from './sections/LayoutGovernanceSection';
import SpatialSection from './sections/SpatialSection';
import CellPreview from './CellPreview';
import CustomSkinSection from './sections/CustomSkinSection';
 
// Layout Components & Hooks
import InspectorHeader from './layout/InspectorHeader';
import InspectorNav from './layout/InspectorNav';
import { usePropertyPanel } from '@/hooks/manifest-editor/usePropertyPanel';
import { isUcaNode } from '@/hooks/manifest-editor/entities/ucaInspectorModel';
import { adaptNodeToManifestEntity, findNodeInTree } from '@/hooks/manifest-editor/entities/ucaInspectorAdapter';

import { ManifestEntity, OMEGA_Manifest, OMEGA_Modulation, LayoutContainer, ExtraResource, OmegaNode } from '@/types/manifest';
import { manifestToTree } from '@/omega-ui-core/uca/ucaBridge';

export interface PropertyPanelProps {
  item: ManifestEntity | OmegaNode | OMEGA_Manifest | null;
  onClose?: () => void;
  onUpdateItem?: (id: string, updates: Partial<ManifestEntity> | Partial<OmegaNode>) => void;
  onUpdate?: (updates: Partial<OMEGA_Manifest> | Partial<ManifestEntity> | Partial<OmegaNode>) => void;
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
  activeTab?: string;
  onOpenConfig?: () => void;
  onOpenLibrary?: () => void;
}

export default function PropertyPanel(props: PropertyPanelProps) {
  const item = props.item;
  const isUCA = isUcaNode(item);
  const rootTree = props.manifest?.ui?.tree || (props.manifest ? manifestToTree(props.manifest) : undefined);
  
  // LIVE REHYDRATION (Era 7.2.3 - Phase 4.2)
  // Ensure we always use the latest node from the tree to avoid stale references after drag
  const liveItem = React.useMemo(() => {
    if (!item || !isUCA || !rootTree) return item;
    return findNodeInTree(rootTree, item.id) || item;
  }, [item, isUCA, rootTree]);

  const legacyItem = isUCA ? adaptNodeToManifestEntity(liveItem as OmegaNode) : (liveItem as ManifestEntity);

  const { activeSection, setActiveSection, isModule, sections } = usePropertyPanel(legacyItem as ManifestEntity | OMEGA_Manifest, props.highlightPath);

  if (!item) return null;
  
  const itemId = item.id;
 
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
      <InspectorHeader id={itemId} isModule={isModule} onClose={props.onClose || (() => {})} />
      {!isModule && <CellPreview item={legacyItem as ManifestEntity} resolveAsset={props.resolveAsset} />}
      <InspectorNav sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            {activeSection === 'identity' && (
              <IdentitySection 
                item={liveItem as ManifestEntity | OmegaNode} 
                onUpdate={(u) => props.onUpdate?.(u)} 
                onHelp={props.onHelp} 
                rootManifest={enrichedManifest} 
                highlightPath={props.highlightPath}
                resolveAsset={props.resolveAsset}
              />
            )}
 
            {isModule ? (
              <>
                {activeSection === 'architecture' && (
                  <ModuleArchitectureSection 
                    manifest={item as OMEGA_Manifest}
                    onUpdate={(u) => props.onUpdate?.(u as Partial<OMEGA_Manifest>)}
                    addContainer={props.addContainer!}
                    updateContainer={props.updateContainer!}
                    removeContainer={props.removeContainer!}
                    onSelectItem={props.onSelectItem!}
                    onAddEntity={props.onAddEntity!}
                    onDuplicateItem={props.onDuplicateItem!}
                    onRemoveItem={props.onRemoveItem!}
                    onAddModulation={props.onAddModulation!}
                    onRemoveModulation={props.onRemoveModulation!}
                    onUpdateModulation={props.onUpdateModulation!}
                    onOpenModGrid={props.onOpenModGrid!}
                    extraResources={props.extraResources}
                    onTriggerUpload={() => props.onTriggerUpload?.('resource-upload')}
                    onRemoveResource={props.onRemoveResource}
                    highlightPath={props.highlightPath}
                    setActiveSection={setActiveSection}
                    onOpenLibrary={props.onOpenLibrary}
                  />
                )}
                {activeSection === 'custom-design' && (
                  <CustomSkinSection 
                    manifest={item as OMEGA_Manifest} 
                    onUpdate={(u) => props.onUpdate?.(u as Partial<OMEGA_Manifest>)} 
                    resolveAsset={props.resolveAsset}
                    activeRackTab={props.activeTab || 'MAIN'}
                    onOpenConfig={props.onOpenConfig}
                  />
                )}
              </>
            ) : (
              <>
                {activeSection === 'core' && (
                  <div className="space-y-8">
                    <IdentitySection 
                      item={liveItem as ManifestEntity | OmegaNode} 
                      rootManifest={enrichedManifest} 
                      rootTree={rootTree}
                      onUpdate={(u) => props.onUpdate?.(u)} 
                      onHelp={props.onHelp} 
                      highlightPath={props.highlightPath} 
                      resolveAsset={props.resolveAsset} 
                    />
                    <SpatialSection 
                      key={liveItem?.id || 'none'}
                      item={liveItem as ManifestEntity | OmegaNode} 
                      rootTree={rootTree}
                      onUpdate={(u) => props.onUpdate?.(u)} 
                      onHelp={props.onHelp} 
                      highlightPath={props.highlightPath} 
                      containers={enrichedManifest?.ui?.layout?.containers || []} 
                    />
                    {isUCA && (
                      <LayoutGovernanceSection 
                        node={liveItem as OmegaNode} 
                        onUpdate={(u) => props.onUpdate?.(u)} 
                      />
                    )}
                  </div>
                )}
                {activeSection === 'design' && (
                  <AestheticSection item={legacyItem as ManifestEntity} manifest={enrichedManifest} onUpdate={(u) => props.onUpdate?.(u as Partial<ManifestEntity>)} onHelp={props.onHelp} containers={enrichedManifest?.ui?.layout?.containers || []} highlightPath={props.highlightPath} resolveAsset={props.resolveAsset} onOpenConfig={props.onOpenConfig} />
                )}
                {activeSection === 'logic' && (
                  <div className="space-y-8">
                    <LogicSection item={legacyItem as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u as Partial<ManifestEntity>)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} highlightPath={props.highlightPath} />
                    <AttachmentsSection item={legacyItem as ManifestEntity} manifest={enrichedManifest} onUpdate={(u) => props.onUpdate?.(u as Partial<ManifestEntity>)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} onOpenConfig={props.onOpenConfig} />
                    <EngineeringSection item={legacyItem as ManifestEntity} onUpdate={(u) => props.onUpdate?.(u as Partial<ManifestEntity>)} onHelp={props.onHelp} highlightPath={props.highlightPath} />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
