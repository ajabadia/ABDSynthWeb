import type { OmegaNode } from '@/omega-ui-core/types/manifest';
import { STORAGE_KEYS } from '@/features/manifest-editor/constants/storage';

import { cloneAndRegenerateNodeIds } from '@/features/manifest-editor/utils/idManagement';

/**
 * OMEGA Clipboard Service (v7.2.3)
 * Industrial cross-document copy/paste engine.
 * SOVEREIGN VERSION: No Legacy Fallbacks.
 */
export const ClipboardService = {
  copy: (item: OmegaNode) => {
    // We only support OmegaNode now (Phase 18 Demolition)
    const data = JSON.stringify(item);
    localStorage.setItem(STORAGE_KEYS.CLIPBOARD, data);
    console.log(`[CLIPBOARD] Copied Canonical Node: ${item.id}`);
  },

  paste: (): OmegaNode | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIPBOARD);
    if (!data) return null;
    
    try {
      const item = JSON.parse(data) as OmegaNode;
      
      // Verification: Ensure it has structure
      if (!('kind' in item)) {
        console.warn('[CLIPBOARD] Rejected legacy data in clipboard.');
        return null;
      }

      // Industrial ID Regeneration (RISK-004 Fix)
      const result = cloneAndRegenerateNodeIds(item);
      const processed = result.node;
      console.log(`[CLIPBOARD] Pasted UCA Node: ${processed.id} (with children)`);
      
      return processed;
    } catch (e) {
      console.error('[CLIPBOARD] Paste failed:', e);
      return null;
    }
  }
};
