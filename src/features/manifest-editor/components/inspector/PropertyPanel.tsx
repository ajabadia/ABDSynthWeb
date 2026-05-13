'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Specialized Sections
import type { ManifestEntity, OMEGA_Manifest, OMEGA_Modulation, LayoutContainer, ExtraResource, OmegaNode } from '@/omega-ui-core/types/manifest';
import { manifestToTree } from '@/omega-ui-core/uca/ucaBridge';

// Specialized Sections
import IdentitySection from '@/features/manifest-editor/components/inspector/sections/IdentitySection';
import LogicSection from '@/features/manifest-editor/components/inspector/sections/LogicSection';
import AestheticSection from '@/features/manifest-editor/components/inspector/sections/AestheticSection';
import AttachmentsSection from '@/features/manifest-editor/components/inspector/sections/AttachmentsSection';
import EngineeringSection from '@/features/manifest-editor/components/inspector/sections/EngineeringSection';
import ModuleArchitectureSection from '@/features/manifest-editor/components/inspector/sections/ModuleArchitectureSection';
import LayoutGovernanceSection from '@/features/manifest-editor/components/inspector/sections/LayoutGovernanceSection';
import SpatialSection from '@/features/manifest-editor/components/inspector/sections/SpatialSection';
import CellPreview from '@/features/manifest-editor/components/inspector/CellPreview';
import CustomSkinSection from '@/features/manifest-editor/components/inspector/sections/CustomSkinSection';
 
// Layout Components & Hooks
import InspectorHeader from '@/features/manifest-editor/components/inspector/layout/InspectorHeader';
import InspectorNav from '@/features/manifest-editor/components/inspector/layout/InspectorNav';
import { usePropertyPanel } from '@/features/manifest-editor/hooks/usePropertyPanel';
import { isUcaNode } from '@/features/manifest-editor/hooks/entities/ucaInspectorModel';
import { findNodeInTree, findLegacyItem } from '@/features/manifest-editor/hooks/entities/ucaInspectorAdapter';

export interface PropertyPanelProps {
  item: ManifestEntity | OmegaNode | OMEGA_Manifest | null;
  onClose?: (() => void) | undefined;
  onUpdateItem?: ((id: string, updates: Partial<OmegaNode>) => void) | undefined;
  onUpdate?: ((updates: Partial<OMEGA_Manifest> | Partial<OmegaNode>) => void) | undefined;
  highlightPath?: (string | null) | undefined;
  availableBinds?: string[] | undefined;
  onSelectItem?: ((id: string | null) => void) | undefined;
  onAddEntity?: ((type: 'control' | 'jack') => void) | undefined;
  onDuplicateItem?: ((id: string) => void) | undefined;
  onRemoveItem?: ((id: string) => void) | undefined;
  onHelp?: ((sectionId: string) => void) | undefined;
  onAddModulation?: ((mod: OMEGA_Modulation) => void) | undefined;
  onRemoveModulation?: ((id: string) => void) | undefined;
  onUpdateModulation?: ((id: string, updates: Partial<OMEGA_Modulation>) => void) | undefined;
  onOpenModGrid?: (() => void) | undefined;
  addContainer?: ((c?: Partial<LayoutContainer> | undefined) => void) | undefined;
  updateContainer?: ((id: string, updates: Partial<LayoutContainer>) => void) | undefined;
  removeContainer?: ((id: string) => void) | undefined;
  extraResources?: ExtraResource[] | undefined;
  onTriggerUpload?: ((id: string) => void) | undefined;
  onRemoveResource?: ((name: string) => void) | undefined;
  resolveAsset: (id: string | undefined) => string | undefined;
  manifest: OMEGA_Manifest;
  uiTheme?: ('dark' | 'light') | undefined;
  activeTab?: string | undefined;
  onOpenConfig?: (() => void) | undefined;
  onOpenLibrary?: (() => void) | undefined;
}

export default function PropertyPanel(props: PropertyPanelProps) {
  const item = props.item;
  const isUCA = isUcaNode(item);
  const rootTree = props.manifest?.ui?.tree || (props.manifest ? manifestToTree(props.manifest, props.manifest.ui?.tree) : undefined);
  
  // LIVE REHYDRATION (Era 7.2.3 - Phase 4.2 - Unified Sync)
  // Ensure we always use the latest node from the tree (if available) to avoid stale references 
  // after drag or background updates, even for projected legacy items.
  const liveItem = React.useMemo(() => {
    if (!item || !rootTree) return item;
    // We attempt to find the node in the tree first (Universal Priority)
    const itemId = ('id' in item ? item.id : undefined) || '';
    if (!itemId) return item;

    const treeNode = findNodeInTree(rootTree, itemId);
    if (treeNode) return treeNode;
    
    // Fallback to legacy arrays if not in tree (rare but possible for unmapped entities)
    return findLegacyItem(props.manifest, itemId) || item;
  }, [item, rootTree, props.manifest]);
 
  const { activeSection, setActiveSection, isModule, sections } = usePropertyPanel(liveItem as OMEGA_Manifest | OmegaNode, props.highlightPath);

  if (!item || !liveItem) return null;
  const itemId = 'id' in item ? item.id : 'MANIFEST';
 
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
      <InspectorHeader id={itemId || 'MANIFEST'} isModule={isModule} onClose={props.onClose || (() => {})} />
      {!isModule && <CellPreview item={liveItem as OmegaNode} resolveAsset={props.resolveAsset} />}
      <InspectorNav sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
            {activeSection === 'identity' && (
              <IdentitySection 
                item={liveItem as OmegaNode} 
                onUpdate={(u) => props.onUpdate?.(u as Partial<ManifestEntity>)} 
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
                    highlightPath={props.highlightPath || undefined}
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
                      item={liveItem as OmegaNode} 
                      rootManifest={enrichedManifest} 
                      rootTree={rootTree}
                      onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode> | Partial<OMEGA_Manifest>)} 
                      onHelp={props.onHelp} 
                      highlightPath={props.highlightPath} 
                      resolveAsset={props.resolveAsset} 
                    />
                    <SpatialSection 
                      item={liveItem as OmegaNode} 
                      rootTree={rootTree}
                      onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode>)} 
                      onHelp={props.onHelp} 
                      highlightPath={props.highlightPath} 
                      containers={enrichedManifest?.ui?.layout?.containers || []} 
                    />
                    {isUCA && (
                      <LayoutGovernanceSection 
                        node={liveItem as OmegaNode} 
                        onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode>)} 
                      />
                    )}
                  </div>
                )}
                {activeSection === 'design' && (
                  <AestheticSection item={liveItem as OmegaNode} manifest={enrichedManifest} onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode>)} onHelp={props.onHelp} containers={enrichedManifest?.ui?.layout?.containers || []} highlightPath={props.highlightPath} resolveAsset={props.resolveAsset} onOpenConfig={props.onOpenConfig} />
                )}
                {activeSection === 'logic' && (
                  <div className="space-y-8">
                    <LogicSection item={liveItem as OmegaNode} onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode>)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} highlightPath={props.highlightPath} />
                    <AttachmentsSection item={liveItem as OmegaNode} manifest={enrichedManifest} onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode>)} availableBinds={props.availableBinds || []} onHelp={props.onHelp} onOpenConfig={props.onOpenConfig} />
                    <EngineeringSection item={liveItem as OmegaNode} onUpdate={(u) => props.onUpdate?.(u as Partial<OmegaNode>)} onHelp={props.onHelp} highlightPath={props.highlightPath} />
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
