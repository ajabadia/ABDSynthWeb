import { renderLedHTML } from './LedRenderer';
import { renderDisplayHTML } from './DisplayRenderer';
import { renderStepperHTML } from './StepperRenderer';

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

    // Parse variant for shared logic (Size_Color)
    const parts = (variant || 'B_cyan').split('_');
    const size = parts[0] || 'B';
    const colorId = parts.length > 1 ? parts.filter(p => p !== size).join('_') : 'cyan';

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
        const mode = parts.includes('lcd') ? 'lcd' : (parts.includes('led') ? 'led' : 'oled');
        return renderDisplayHTML({ size, colorId, value, mode, steps });

      case 'stepper':
      case 'button':
        return renderStepperHTML({ size, colorId, value, type: 'push', text });

      default:
        return `<!-- Unknown Attachment Type: ${type} -->`;
    }
  }
}
