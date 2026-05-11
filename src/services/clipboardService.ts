import { ManifestEntity, OmegaNode } from '@/omega-ui-core/types/manifest';
import { STORAGE_KEYS } from '@/features/manifest-editor/constants/storage';

import { regenerateEntityId, cloneAndRegenerateNodeIds } from '@/features/manifest-editor/utils/idManagement';

/**
 * OMEGA Clipboard Service (v7.2.3)
 * Industrial cross-document copy/paste engine.
 */
export const ClipboardService = {
  copy: (item: ManifestEntity | OmegaNode) => {
    const data = JSON.stringify(item);
    localStorage.setItem(STORAGE_KEYS.CLIPBOARD, data);
    console.log(`[CLIPBOARD] Copied: ${item.id}`);
  },

  paste: (): ManifestEntity | OmegaNode | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIPBOARD);
    if (!data) return null;
    
    try {
      const item = JSON.parse(data) as ManifestEntity | OmegaNode;
      
      // Industrial ID Regeneration (RISK-004 Fix)
      let processed: ManifestEntity | OmegaNode;
      
      if ('kind' in item) {
        // It's a UCA Node (recursive)
        const result = cloneAndRegenerateNodeIds(item as OmegaNode);
        processed = result.node;
        console.log(`[CLIPBOARD] Pasted UCA Node: ${processed.id} (with children)`);
      } else {
        // It's a flat ManifestEntity
        processed = regenerateEntityId(item as ManifestEntity);
        console.log(`[CLIPBOARD] Pasted Entity: ${processed.id}`);
      }
      
      return processed;
    } catch (e) {
      console.error('[CLIPBOARD] Paste failed:', e);
      return null;
    }
  }
};
