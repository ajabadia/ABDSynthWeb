'use client';

import { useCallback } from 'react';
import { OMEGA_Manifest, ModuleTemplate, OmegaNode } from '@/omega-ui-core/types/manifest';

/**
 * useTemplateCRUD (Phase 5.4)
 * Handles injection of template-based nodes into the UCA tree.
 */
export const useTemplateCRUD = (
  manifest: OMEGA_Manifest,
  updateManifest: (updates: Partial<OMEGA_Manifest>) => void,
  addLog: (msg: string) => void
) => {

  const applyTemplate = useCallback((template: ModuleTemplate) => {
    addLog(`[SYSTEM] Injecting Blueprint: ${template.label} (v${template.version})...`);

    // 1. Ensure the manifest supports UCA
    const currentTree = manifest.ui?.tree || {
      id: 'root',
      kind: 'rack',
      layout: { pos: { x: 0, y: 0 }, mode: 'absolute' },
      children: []
    };

    // 2. Create the Template Instance Node
    const newNode: OmegaNode = {
      id: `${template.id}_${Math.random().toString(36).substr(2, 4)}`,
      kind: 'container',
      templateRef: template.id,
      layout: {
        pos: { x: 10, y: 10 }, // Default offset
        mode: template.root.layout?.mode || 'absolute'
      },
      overrides: {},
      slotMappings: {}
    };

    // 3. Initialize required slot mappings with defaults if possible
    template.slots.forEach(slot => {
      if (newNode.slotMappings) {
        newNode.slotMappings[slot.id] = ''; // To be mapped by user
      }
    });

    // 4. Update the tree (Aseptic Injection)
    const updatedTree = {
      ...currentTree,
      children: [...(currentTree.children || []), newNode]
    };

    // 5. Update moduleTemplates registry if not already present
    const updatedTemplates = {
      ...(manifest.ui?.moduleTemplates || {}),
      [template.id]: template
    };

    updateManifest({
      ui: {
        ...manifest.ui,
        tree: updatedTree,
        moduleTemplates: updatedTemplates
      }
    });

    addLog(`[SUCCESS] Template '${template.label}' injected into workspace.`);
  }, [manifest, updateManifest, addLog]);

  return {
    applyTemplate
  };
};
