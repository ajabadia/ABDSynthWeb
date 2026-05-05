import { renderLedHTML } from './LedRenderer';
import { renderDisplayHTML } from './DisplayRenderer';
import { renderStepperHTML } from './StepperRenderer';

import { parseVariant } from './utils/VariantParser';
 
export interface AttachmentProps {
  type: string;
  variant: string;
  text?: string;
  value?: number;
  steps?: number;
}
 
export class AttachmentRenderer {
  static renderAttachmentHTML(props: AttachmentProps): string {
    const { type, variant, text = '', value = 0, steps = 100 } = props;
 
    const { size, colorId } = parseVariant(variant);

    switch (type) {
      case 'label':
        const sizes: Record<string, number> = { A: 12, B: 9, C: 7, D: 6 };
        const fontSize = sizes[size] || 9;
        return `
          <div class="attachment-label variant-${variant}" style="font-size: ${fontSize}px;">
            ${text.toUpperCase()}
          </div>
        `;

      case 'led':
        return renderLedHTML({ size, colorId, value });

      case 'display':
        const mode = variant.includes('lcd') ? 'lcd' : (variant.includes('led') ? 'led' : 'oled');
        return renderDisplayHTML({ size, colorId, value, mode, steps });

      case 'stepper':
      case 'button':
        return renderStepperHTML({ size, colorId, value, type: 'push', text });

      default:
        return `<!-- Unknown Attachment Type: ${type} -->`;
    }
  }
}
