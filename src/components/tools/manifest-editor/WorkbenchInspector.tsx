'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PropertyPanel from './PropertyPanel';
import { OMEGA_Manifest, LayoutContainer, ManifestEntity, OMEGA_Modulation, ExtraResource } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';

interface WorkbenchInspectorProps {
  isVisible: boolean;
  isLiveMode: boolean;
  uiTheme: 'dark' | 'light';
  manifest: OMEGA_Manifest;
  selectedItem: ManifestEntity | OMEGA_Manifest | null;
  selectedItemId: string | null;
  highlightPath: string | null;
  availableBinds: string[];
  extraResources: ExtraResource[];
  audit: AuditResult;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
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
}

export function WorkbenchInspector({
  isVisible,
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
  onRemoveResource
}: WorkbenchInspectorProps) {
  const triggerUpload = (id: string) => document.getElementById(id)?.click();

  return (
    <AnimatePresence>
      {isVisible && !isLiveMode && (
        <motion.aside 
          key="inspector" 
          initial={{ x: 600 }} 
          animate={{ x: 0 }} 
          exit={{ x: 600 }} 
          className="w-[600px] shrink-0 h-full border-l wb-outline transition-colors duration-500"
        >
          <PropertyPanel 
            uiTheme={uiTheme} 
            manifest={manifest} 
            item={selectedItem!} 
            highlightPath={highlightPath}
            onUpdate={selectedItemId ? (updates: Partial<ManifestEntity>) => {
              onUpdateItem(selectedItemId, updates);
              if (updates.id && updates.id !== selectedItemId) onSelectItem(updates.id);
            } : (updates: Partial<OMEGA_Manifest>) => onUpdateManifest(updates)}
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
            onTriggerUpload={triggerUpload} 
            onRemoveResource={onRemoveResource}
          />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
