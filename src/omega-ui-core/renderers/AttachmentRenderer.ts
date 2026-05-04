/**
 * OMEGA Attachment Renderer (Era 7.2.3)
 * Stateless HTML generator for orbitant labels and technical markers.
 */

export interface AttachmentProps {
  type: string;
  variant: string;
  text?: string;
  offsetX?: number;
  offsetY?: number;
}

export class AttachmentRenderer {
  static renderAttachmentHTML(props: AttachmentProps): string {
    const { type, variant, text = '' } = props;

    if (type === 'label') {
      const parts = (variant || 'B_cyan').split('_');
      const sizeClass = parts[0] || 'B';
      const colorVariant = variant || 'B_cyan';
      
      const sizes: Record<string, number> = { A: 12, B: 9, C: 7, D: 6 };
      const fontSize = sizes[sizeClass] || 9;

      return `
        <div class="attachment-label variant-${colorVariant}" style="font-size: ${fontSize}px;">
          ${text.toUpperCase()}
        </div>
      `;
    }

    return `<!-- Unknown Attachment Type: ${type} -->`;
  }
}
