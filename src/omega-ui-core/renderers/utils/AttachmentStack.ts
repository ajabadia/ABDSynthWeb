/**
 * OMEGA Attachment Stack Renderer (Era 7.2.3)
 * Logic for stacking and positioning orbitant attachments around a central component.
 */
 
import type { Attachment } from '../../types/manifest';
import { AttachmentRenderer } from '../AttachmentRenderer';
 
export interface StackOptions {
  runtimeValue: number;
  steps: number;
}
 
export function renderAttachmentStackHTML(
  pos: 'top' | 'bottom' | 'left' | 'right' | 'center', 
  attachments: Attachment[], 
  options: StackOptions
): string {
  const { runtimeValue, steps } = options;
  const stackItems = attachments.filter((a) => a.position === pos);
 
  if (stackItems.length === 0) return '';
  
  const itemsHTML = stackItems.map((a) => {
    const html = AttachmentRenderer.renderAttachmentHTML({
      type: a.type,
      variant: a.variant,
      text: a.text || '',
      value: runtimeValue,
      steps: steps
    });
 
    // Apply manual offsets from manifest if present (1.5x scaling)
    const offX = (a.offsetX || 0) * 1.5;
    const offY = (a.offsetY || 0) * 1.5;
    return `<div style="transform: translate(${offX}px, ${offY}px)">${html}</div>`;
  }).join('');
 
  return `<div class="attachment-stack stack-${pos}">${itemsHTML}</div>`;
}
