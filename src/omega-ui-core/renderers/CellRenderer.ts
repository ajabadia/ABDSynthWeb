/**
 * OMEGA Cell Orchestrator (Era 7.2.3)
 * The Single Source of Truth for Component Layout and Attachment Stacking.
 */

import { renderKnobHTML } from './KnobRenderer';
import { renderPortHTML } from './PortRenderer';
import { renderLedHTML } from './LedRenderer';
import { renderSliderHTML } from './SliderRenderer';
import { renderDisplayHTML } from './DisplayRenderer';
import { renderSwitchHTML } from './SwitchRenderer';
import { renderStepperHTML } from './StepperRenderer';
import { renderSelectHTML } from './SelectRenderer';
import { renderScopeHTML } from './ScopeRenderer';
import { renderTerminalHTML } from './TerminalRenderer';
import { renderIllustrationHTML } from './IllustrationRenderer';

import type { ManifestEntity, OMEGA_Manifest } from '../types/manifest';
import { parseVariant } from './utils/VariantParser';
import { getComponentRadius } from './utils/CellMetrics';
import { renderAttachmentStackHTML } from './utils/AttachmentStack';

export interface CellOptions {
  skin: string;
  zoom: number;
  runtimeValue: number;
  steps: number;
  isSelected?: boolean;
  isLiveMode?: boolean;
  resolveAsset?: (ref: string | undefined) => string | undefined;
  manifest?: OMEGA_Manifest;
}

export class CellRenderer {
  /**
   * Renders the complete HTML for a cell, including its main component and all orbitant attachments.
   */
  static renderCellHTML(item: ManifestEntity, options: CellOptions): string {
    const { runtimeValue, steps, isSelected, resolveAsset, manifest } = options;
    const compType = item.presentation?.component || 'knob';
    const variant = item.presentation?.variant || 'B_cyan';
    
    const { size, colorId } = parseVariant(variant);
    const compRadius = getComponentRadius(item);
    
    // Asset Resolution
    const assetId = item.presentation.asset;
    const assetDef = manifest?.resources?.assets?.find((a: { id: string, frames?: number, orientation?: string }) => a.id === assetId);
    const assetUrl = resolveAsset ? resolveAsset(assetId) : assetId;
    
    // 1. Render Main Primitive
    let mainHTML = '';
    const commonProps = { 
      size, 
      colorId, 
      value: runtimeValue, 
      id: item.id,
      isSelected: !!isSelected,
      isMain: true 
    };

    switch (compType) {
      case 'knob':
        mainHTML = renderKnobHTML({ 
            ...commonProps,
            assetUrl,
            frames: assetDef?.frames,
            orientation: assetDef?.orientation
        });
        break;
      case 'port':
        mainHTML = renderPortHTML({ 
          ...commonProps, 
          label: item.label || '', 
          explicitColor: variant 
        });
        break;
      case 'led':
        mainHTML = renderLedHTML({ ...commonProps });
        break;
      case 'display':
        const mode = variant.includes('lcd') ? 'lcd' : (variant.includes('led') ? 'led' : 'oled');
        mainHTML = renderDisplayHTML({ ...commonProps, mode, steps });
        break;
      case 'slider-v':
      case 'slider-h':
        mainHTML = renderSliderHTML({ ...commonProps, type: compType as 'slider-v' | 'slider-h' });
        break;
      case 'switch':
        mainHTML = renderSwitchHTML({ ...commonProps });
        break;
      case 'stepper':
      case 'button':
      case 'push':
        mainHTML = renderStepperHTML({ 
          ...commonProps, 
          type: compType as 'stepper' | 'button' | 'push', 
          text: item.label || '' 
        });
        break;
      case 'select':
        mainHTML = renderSelectHTML({ 
          ...commonProps, 
          options: item.presentation?.options || [item.presentation?.lookup || ''] 
        });
        break;
      case 'scope':
        mainHTML = renderScopeHTML({
          variant,
          bind: item.bind || item.id || '',
          size: item.presentation.size || { w: 100, h: 60 },
          color: item.presentation.color || ''
        });
        break;
      case 'terminal':
        mainHTML = renderTerminalHTML({
          variant,
          bind: item.bind || item.id || '',
          size: item.presentation.size || { w: 100, h: 60 },
          color: item.presentation.color || '',
          font: item.presentation.font || ''
        });
        break;
      case 'illustration':
        mainHTML = renderIllustrationHTML({
          assetUrl,
          size: item.presentation.size || { w: 40, h: 40 },
          variant: item.presentation.variant || 'contain',
          id: item.id
        });
        break;
      default:
        mainHTML = `<!-- Unsupported Component: ${compType} -->`;
    }

    // 2. Render Attachment Stacks
    const attachments = item.presentation?.attachments || [];
    const stackOptions = { runtimeValue, steps };

    // 3. Assemble Final Cell
    const cellOffsetX = (item.presentation?.offsetX || 0) * 1.5;
    const cellOffsetY = (item.presentation?.offsetY || 0) * 1.5;

    return `
      <div class="control-cell variant-${variant}" style="--comp-radius: ${compRadius}px;">
        ${renderAttachmentStackHTML('top', attachments, stackOptions)}
        ${renderAttachmentStackHTML('bottom', attachments, stackOptions)}
        ${renderAttachmentStackHTML('left', attachments, stackOptions)}
        ${renderAttachmentStackHTML('right', attachments, stackOptions)}
        ${renderAttachmentStackHTML('center', attachments, stackOptions)}
        <div class="cell-main" style="width: ${compRadius * 2 * 1.5}px; height: ${compRadius * 2 * 1.5}px; transform: translate(calc(-50% + ${cellOffsetX}px), calc(-50% + ${cellOffsetY}px))">
          ${mainHTML}
        </div>
      </div>
    `.trim();
  }
}
