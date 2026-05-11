import { ManifestEntity, OmegaNode } from '@/omega-ui-core/types/manifest';

/**
 * OMEGA Clipboard Service (v7.2.3)
 * Industrial cross-document copy/paste engine.
 */
export const ClipboardService = {
  copy: (item: ManifestEntity | OmegaNode) => {
    const data = JSON.stringify(item);
    localStorage.setItem('omega_clipboard', data);
    console.log(`[CLIPBOARD] Copied: ${item.id}`);
  },

  paste: (): ManifestEntity | OmegaNode | null => {
    const data = localStorage.getItem('omega_clipboard');
    if (!data) return null;
    
    try {
      const item = JSON.parse(data) as ManifestEntity | OmegaNode;
      // Regenerate ID to avoid collisions
      const baseId = item.id.replace(/_copy_\d+$/, '');
      item.id = `${baseId}_copy_${Math.floor(Math.random() * 1000)}`;
      
      console.log(`[CLIPBOARD] Pasting: ${item.id}`);
      return item;
    } catch (e) {
      console.error('[CLIPBOARD] Paste failed:', e);
      return null;
    }
  }
};
