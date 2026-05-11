'use client';

// import { motion, AnimatePresence } from 'framer-motion';
import PropertyPanel from './PropertyPanel';
import { OMEGA_Manifest, LayoutContainer, ManifestEntity, OMEGA_Modulation, ExtraResource, OmegaNode } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';

interface WorkbenchInspectorProps {
  // isVisible: boolean; (unused)
  isLiveMode: boolean;
  uiTheme: 'dark' | 'light';
  manifest: OMEGA_Manifest;
  selectedItem: ManifestEntity | OmegaNode | OMEGA_Manifest | null;
  selectedItemId: string | null;
  highlightPath: string | null;
  availableBinds: string[];
  extraResources: ExtraResource[];
  audit: AuditResult;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity> | Partial<OmegaNode>) => void;
  onUpdateManifest: (updates: Partial<OMEGA_Manifest>) => void;
  onSelectItem: (id: string | null) => void;
  onAddEntity: (type: 'control' | 'jack') => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddModulation: (mod: OMEGA_Modulation) => void;
  onRemoveModulation: (id: string) => void;
  onUpdateModulation: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onOpenModGrid: () => void;
  addContainer: (c?: Partial<LayoutContainer>) => void;
  updateContainer: (id: string, updates: Partial<LayoutContainer>) => void;
  removeContainer: (id: string) => void;
  onHelp: (sectionId?: string) => void;
  onRemoveResource: (name: string) => void;
  resolveAsset: (id: string | undefined) => string | undefined;
  onTriggerUpload: (id: string) => void;
  onOpenConfig?: () => void;
  onOpenLibrary?: () => void;
}

export function WorkbenchInspector({
  // isVisible, (unused)
  isLiveMode,
  uiTheme,
  manifest,
  selectedItem,
  selectedItemId,
  highlightPath,
  availableBinds,
  extraResources,
  onUpdateItem,
  onUpdateManifest,
  onSelectItem,
  onAddEntity,
  onDuplicateItem,
  onRemoveItem,
  onAddModulation,
  onRemoveModulation,
  onUpdateModulation,
  onOpenModGrid,
  addContainer,
  updateContainer,
  removeContainer,
  onHelp,
  onRemoveResource,
  resolveAsset,
  onTriggerUpload,
  onOpenConfig,
  onOpenLibrary
}: WorkbenchInspectorProps) {
  
  // ASEPTIC HANDLERS
  const handleUpdate = (updates: Partial<OMEGA_Manifest> | Partial<ManifestEntity> | Partial<OmegaNode>) => {
    if (selectedItemId) {
      onUpdateItem(selectedItemId, updates);
      if (updates.id && updates.id !== selectedItemId) {
        onSelectItem(updates.id);
      }
    } else {
      onUpdateManifest(updates as Partial<OMEGA_Manifest>);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!isLiveMode && (
        <PropertyPanel 
          uiTheme={uiTheme} 
          manifest={manifest} 
          item={selectedItem!} 
          highlightPath={highlightPath}
          onUpdate={handleUpdate}
          onClose={() => onSelectItem(null)} 
          availableBinds={availableBinds}
          onSelectItem={onSelectItem} 
          onAddEntity={onAddEntity} 
          onDuplicateItem={onDuplicateItem} 
          onRemoveItem={onRemoveItem}
          onAddModulation={onAddModulation} 
          onRemoveModulation={onRemoveModulation} 
          onUpdateModulation={onUpdateModulation} 
          onOpenModGrid={onOpenModGrid}
          addContainer={addContainer} 
          updateContainer={updateContainer} 
          removeContainer={removeContainer}
          onHelp={onHelp} 
          extraResources={extraResources} 
          onRemoveResource={onRemoveResource}
          resolveAsset={resolveAsset}
          onTriggerUpload={onTriggerUpload}
          onOpenConfig={onOpenConfig}
          onOpenLibrary={onOpenLibrary}
        />
      )}
    </div>
  );
}
