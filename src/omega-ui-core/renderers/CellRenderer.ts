/**
 * ⚠️ OMEGA UI CORE — MASTER ENGINE (Era 7.2.3)
 * ---------------------------------------------------------------------------
 * This is the SINGLE SOURCE OF TRUTH for OMEGA rendering.
 * It handles both architectural structures and primitive controls.
 * ---------------------------------------------------------------------------
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
import { renderSequenceHTML } from './SequenceRenderer';
import { AttachmentRenderer } from './AttachmentRenderer';

import { parseVariant } from './utils/VariantParser';
import { getComponentRadius } from './utils/CellMetrics';
import { renderAttachmentStackHTML } from './utils/AttachmentStack';
import { getInheritedTypography } from './utils/TypographyInheritance';
import { ColorResolver } from '../utils/ColorResolver';

export interface CellOptions {
  skin: string;
  zoom: number;
  runtimeValue: number;
  steps: number;
  isSelected?: boolean;
  isLiveMode?: boolean;
  isError?: boolean;
  resolveAsset?: (ref: string | undefined) => string | undefined;
  manifest?: OMEGA_Manifest;
  activeTab?: string;
  forceFrame?: number; // Phase 12 - Behavior Lab Support
  recipe?: import('../types/assetBehavior').LayerRecipe; // Phase 12 - Genetic Composition Support
}

import type { ManifestEntity, OMEGA_Manifest, OmegaStyleNode, OMEGA_Asset } from '../types/manifest';

interface RendererExtraOptions {
  assetUrl?: string;
  assetDef?: OMEGA_Asset;
  steps: number;
  runtimeValue: number;
  inherited: Record<string, unknown>;
  manifest?: OMEGA_Manifest;
  resolveAsset?: (id: string | undefined) => string | undefined;
  forceFrame?: number;
}

/**
 * Registry of primitive renderers for industrial dispatching.
 */
const COMP_RENDERER_MAP: Record<string, (item: ManifestEntity, props: Record<string, unknown>, options: RendererExtraOptions) => string> = {
  'sequence-layer': (item, props, opt) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const style = (item.presentation?.style as any) || {};
    return renderSequenceHTML({
      assetUrl: opt.assetUrl,
      value: opt.forceFrame !== undefined ? opt.forceFrame : opt.runtimeValue,
      frames: style.frames || 1,
      frameWidth: style.frameWidth || 48,
      frameHeight: style.frameHeight || 48,
      orientation: style.orientation || 'v',
      opacity: style.opacity !== undefined ? style.opacity : 1,
      style,
      isFrameIndex: opt.forceFrame !== undefined // Tell sequence renderer it is a frame index
    });
  },
  'graphic-fragment': (item, props, opt) => {
    return AttachmentRenderer.renderAttachmentHTML({
      type: 'graphic-fragment',
      variant: item.presentation?.variant || 'A_default',
      text: item.label || '',
      value: opt.runtimeValue,
      steps: opt.steps,
      style: item.presentation?.style,
      manifest: opt.manifest,
      resolveAsset: opt.resolveAsset
    });
  },
  'knob': (item, props, opt) => {
    const isCustom = opt.manifest?.ui?.skinMode === 'custom';
    const style = item.presentation?.style || {};
    
    // Explicitly resolve both channels separately
    const resolvedIndicator = isCustom ? ColorResolver.resolve(style.indicatorColor, opt.manifest) : undefined;
    const resolvedMain = isCustom ? ColorResolver.resolve(style.color || item.presentation?.color, opt.manifest) : undefined;

    return renderKnobHTML({ 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(props as any), 
      assetUrl: opt.assetUrl, 
      frames: opt.assetDef?.frames, 
      orientation: opt.assetDef?.orientation,
      // NO FALLBACK to main color here. If resolvedIndicator is transparent, the marker should be transparent.
      explicitMarkerColor: resolvedIndicator, 
      style: { ...style, color: resolvedMain, indicatorColor: resolvedIndicator },
      inheritedFont: isCustom ? (style.font || item.presentation?.font || opt.inherited.font) : opt.inherited.font,
      inheritedColor: opt.inherited.color,
      inheritedSize: opt.inherited.size
    });
  },
  'port': (item, props, opt) => {
    const isCustom = opt.manifest?.ui?.skinMode === 'custom';
    return renderPortHTML({ 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(props as any), 
      label: item.label || '', 
      explicitColor: item.presentation?.variant,
      customSignalColor: isCustom ? ColorResolver.resolve(item.presentation?.style?.color || item.presentation?.color, opt.manifest) : undefined,
      style: item.presentation?.style,
      inheritedFont: isCustom ? (item.presentation?.style?.font || item.presentation?.font || opt.inherited.font) : opt.inherited.font,
      inheritedColor: opt.inherited.color,
      inheritedSize: opt.inherited.size
    });
  },
  'led': (item, props, opt) => {
    const isCustom = opt.manifest?.ui?.skinMode === 'custom';
    return renderLedHTML({ 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(props as any),
      explicitColor: isCustom ? ColorResolver.resolve(item.presentation?.style?.color || item.presentation?.color, opt.manifest) : undefined
    });
  },
  'display': (item, props, opt) => {
    const variant = item.presentation?.variant || '';
    const mode = variant.includes('lcd') ? 'lcd' : (variant.includes('led') ? 'led' : 'oled');
    const isCustom = opt.manifest?.ui?.skinMode === 'custom';
    return renderDisplayHTML({ 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(props as any), 
      mode, 
      steps: opt.steps,
      explicitTextColor: isCustom ? ColorResolver.resolve(item.presentation?.style?.color || item.presentation?.color, opt.manifest as OMEGA_Manifest) : undefined,
      explicitGlassColor: isCustom ? ColorResolver.resolve(item.presentation?.style?.glassColor || (item.presentation as unknown as Record<string, unknown>)?.glassColor as string, opt.manifest as OMEGA_Manifest) : undefined,
      inheritedFont: isCustom ? (item.presentation?.style?.font || item.presentation?.font || opt.inherited.font) : opt.inherited.font,
      inheritedColor: opt.inherited.color,
      inheritedSize: opt.inherited.size
    });
  },
  'slider-v': (item, props, opt) => renderSliderHTML({ 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(props as any), 
    type: 'slider-v', 
    ...opt.inherited,
    assetUrl: opt.assetUrl,
    frames: opt.assetDef?.frames,
    orientation: opt.assetDef?.orientation
  }),
  'slider-h': (item, props, opt) => renderSliderHTML({ 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(props as any), 
    type: 'slider-h', 
    ...opt.inherited,
    assetUrl: opt.assetUrl,
    frames: opt.assetDef?.frames,
    orientation: opt.assetDef?.orientation
  }),
  'switch': (item, props, opt) => renderSwitchHTML({ 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(props as any), 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(opt.inherited as any)
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'button': (item, props, opt) => renderStepperHTML({ ...(props as any), type: 'button', text: item.label || '', ...(opt.inherited as any) }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'push': (item, props, opt) => renderStepperHTML({ ...(props as any), type: 'push', text: item.label || '', ...(opt.inherited as any) }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'stepper': (item, props, opt) => renderStepperHTML({ ...(props as any), type: 'stepper', text: item.label || '', ...(opt.inherited as any) }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'select': (item, props, opt) => renderSelectHTML({ ...(props as any), options: item.presentation?.options || [], ...(opt.inherited as any) }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'scope': (item, props, opt) => renderScopeHTML({ ...(props as any), ...(opt.inherited as any) }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'terminal': (item, props, opt) => renderTerminalHTML({ ...(props as any), ...(opt.inherited as any) }),
  'illustration': (item, props, opt) => renderIllustrationHTML({ assetUrl: opt.assetUrl, size: item.presentation?.size || { w: 40, h: 40 }, variant: item.presentation?.variant || 'contain', id: item.id }),
  'label': (item, props, opt) => AttachmentRenderer.renderAttachmentHTML({
    type: 'label',
    variant: item.presentation?.variant || 'default',
    text: item.label || '',
    style: props.style,
    manifest: opt.manifest,
    inherited: opt.inherited
  })
};

export class CellRenderer {
  /**
   * RACK CHASSIS RENDERER (Internal)
   * Handles the main module frame and canonical screw positioning.
   */
  private static renderRackHTML(entity: ManifestEntity, options: CellOptions): string {
    const { manifest, resolveAsset, activeTab = 'MAIN' } = options;
    const presentation = entity.presentation || {};
    const variant = presentation.variant || 'default';
    
    // Resolve the style for this specific tab if mapping exists
    const tabStyleId = manifest?.ui?.layout?.tabStyles?.[activeTab];
    const targetStyleId = tabStyleId || variant;

    const rackStyles = manifest?.ui?.styles?.rack || [];
    const libStyle = rackStyles.find((s) => s.id === targetStyleId) || { aesthetics: {} as Partial<OmegaStyleNode> };
    const genetics = libStyle.aesthetics || {};
    const aesthetics = presentation.style || {};

    const bgColor = ColorResolver.resolve(aesthetics.color || genetics.color || 'chassis', manifest);
    
    // Resolve bgAsset with Tab-Awareness
    const faceplateConfig = manifest?.ui?.faceplate;
    let bgAsset = aesthetics.asset || genetics.asset;
    
    if (!bgAsset && faceplateConfig) {
      if (typeof faceplateConfig === 'string') {
        bgAsset = faceplateConfig;
      } else {
        bgAsset = (faceplateConfig as Record<string, string>)[activeTab] || (faceplateConfig as Record<string, string>)['MAIN'];
      }
    }

    const resolveBackgroundCSS = (assetId: string | undefined, fitting: string = 'stretch') => {
      const url = resolveAsset ? resolveAsset(assetId) : undefined;
      if (!url) return '';
      
      let size = '100% 100%';
      let repeat = 'no-repeat';
      const position = 'center';

      switch(fitting) {
        case 'cover':   size = 'cover'; break;
        case 'contain': size = 'contain'; break;
        case 'tile':    size = 'auto'; repeat = 'repeat'; break;
        case 'center':  size = 'auto'; break;
      }
      
      return `background-image: url('${url}') !important; background-size: ${size} !important; background-repeat: ${repeat} !important; background-position: ${position} !important;`;
    };

    const faceplateMode = manifest?.ui?.faceplateMode || 'stretch';
    const bgStyles = resolveBackgroundCSS(bgAsset, faceplateMode);

    const rounding = aesthetics.rounding ?? genetics.rounding ?? 0;
    const borderWidth = aesthetics.borderWidth ?? genetics.borderWidth ?? 0;

    //    const screwStyles = manifest?.ui?.styles?.['mounting-screw'] || [];
    const screwFragment = presentation.attachments?.find((a) => a.type === 'knob' && a.variant === 'rack-screw');
    
    const sAesthetics = (screwFragment?.style || {}) as OmegaStyleNode;
    const screwStyles = manifest?.ui?.styles?.['rack-screw'] || [];
    const sGenetics = screwStyles.find((s) => s.id === (screwFragment?.variant || 'default'))?.aesthetics || {};
    
    const screwSpacing = sAesthetics.spacing ?? sGenetics.spacing ?? 8;
    const screwCount = manifest?.ui?.hardware?.screwCount ?? 4;
    const screwMapping = manifest?.ui?.hardware?.screwMapping || [];
    const masterScrewOffset = manifest?.ui?.hardware?.screwOffset;
    const finalScrewSpacing = masterScrewOffset !== undefined ? masterScrewOffset : screwSpacing;

    // Define standard positions based on count
    const positions: { top: boolean; left: boolean; xPercent?: number; yPercent?: number }[] = [];
    if (screwCount >= 4) {
      positions.push({ top: true, left: true });
      positions.push({ top: true, left: false });
      positions.push({ top: false, left: true });
      positions.push({ top: false, left: false });
    }
    if (screwCount === 6) {
      positions.push({ top: true, left: false, xPercent: 50 }); // Top Mid
      positions.push({ top: false, left: false, xPercent: 50 }); // Bottom Mid
    } else if (screwCount === 8) {
      positions.push({ top: true, left: false, xPercent: 33 }); // Top Mid L
      positions.push({ top: true, left: false, xPercent: 66 }); // Top Mid R
      positions.push({ top: false, left: false, xPercent: 33 }); // Bottom Mid L
      positions.push({ top: false, left: false, xPercent: 66 }); // Bottom Mid R
    }

    const renderScrew = (pos: typeof positions[0], idx: number) => {
      // Resolve style for this specific position
      const posStyleId = screwMapping[idx];
      const posLibStyle = manifest?.ui?.styles?.['mounting-screw']?.find((s) => s.id === posStyleId);
      const posAesthetics = posLibStyle?.aesthetics || {};
      
      const sColor = ColorResolver.resolve(posAesthetics.color || sAesthetics.color || sGenetics.color || 'hardware', manifest);
      const sAssetId = posAesthetics.asset || sAesthetics.asset || sGenetics.asset;
      const sFitting = posAesthetics.fitting || sAesthetics.fitting || sGenetics.fitting || 'cover';
      const sAssetCSS = resolveBackgroundCSS(sAssetId, sFitting);

      const stylePos = `
        position: absolute;
        ${pos.top ? 'top' : 'bottom'}: ${finalScrewSpacing}px;
        ${pos.xPercent ? `left: ${pos.xPercent}%; transform: translateX(-50%);` : (pos.left ? 'left' : 'right') + `: ${finalScrewSpacing}px;`}
      `;

      return `
        <div style="
          ${stylePos}
          width: 14px;
          height: 14px;
          background-color: ${sAssetCSS ? 'transparent' : sColor};
          ${sAssetCSS || `
            background-image: 
              radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 40%),
              radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 20%, transparent 60%),
              linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.2) 100%) !important;
            background-size: cover !important;
          `}
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${sAssetCSS ? '' : `
            <div style="
              width: 8px;
              height: 2px;
              background-color: rgba(0,0,0,0.4);
              transform: rotate(45deg);
              border-radius: 1px;
            "></div>
          `}
        </div>
      `;
    };

    return `
      <div class="industrial-rack-chassis"
        style="position: absolute; inset: 0; background-color: ${bgColor}; ${bgStyles} border-radius: ${rounding}px; border: ${borderWidth}px solid rgba(255,255,255,0.05); overflow: hidden;">
        ${screwFragment ? positions.map((p, i) => renderScrew(p, i)).join('') : ''}
      </div>
    `.trim();
  }

  /**
   * ARCHITECTURAL RENDERER (Internal)
   * Handles Containers, Groups and Plates.
   */
  private static renderContainerHTML(entity: ManifestEntity, options: CellOptions): string {
    const { manifest, resolveAsset, isSelected, isError } = options;
    const presentation = entity.presentation || {};
    const aesthetics = presentation.style || {};
    const variant = presentation.variant || 'default';
    
    const libStyles = manifest?.ui?.styles?.container || [];
    const libStyle = libStyles.find((s) => s.id === variant) || { aesthetics: {} as Partial<OmegaStyleNode> };
    const genetics = libStyle.aesthetics || {};

    const label = entity.label || 'LABEL';

    // Resolved Chromatics
    const bgColor = ColorResolver.resolve(aesthetics.color || genetics.color, manifest);
    const borderColor = ColorResolver.resolve(aesthetics.indicatorColor || genetics.indicatorColor, manifest);
    const labelBg = ColorResolver.resolve(aesthetics.labelBg || genetics.labelBg, manifest);
    const fontColor = ColorResolver.resolve(aesthetics.fontColor || genetics.fontColor || '#ffffff', manifest);

    // Mechanical Properties
    const bgAsset = aesthetics.asset || genetics.asset;
    const bgUrl = resolveAsset ? resolveAsset(bgAsset) : undefined;
    const rounding = aesthetics.rounding ?? genetics.rounding ?? 0;
    const borderWidth = aesthetics.borderWidth ?? genetics.borderWidth ?? 0;
    const opacity = aesthetics.opacity ?? genetics.opacity ?? 1.0;

    // Spatial & Typographic Fragments
    const labelX = aesthetics.labelX ?? genetics.labelX ?? 0;
    const labelY = aesthetics.labelY ?? genetics.labelY ?? 0;
    const labelW = aesthetics.labelW ?? genetics.labelW ?? 0;
    const labelH = aesthetics.labelH ?? genetics.labelH ?? 0;
    const labelRounding = aesthetics.labelRounding ?? genetics.labelRounding ?? 0;
    const labelPadding = aesthetics.labelPadding ?? genetics.labelPadding ?? 4;
    const font = aesthetics.font || genetics.font || 'Inter';
    const fontSize = aesthetics.fontSize || genetics.fontSize || 10;
    const alignment = aesthetics.alignment || genetics.alignment || 'left';
    const flexAlign = alignment === 'left' ? 'flex-start' : (alignment === 'right' ? 'flex-end' : 'center');
    const spacing = aesthetics.spacing || genetics.spacing || 0;

    return `
      <div class="industrial-container-surface ${isSelected ? 'selected' : ''} ${isError ? 'error' : ''}"
        style="position: absolute; inset: 0; background-color: ${bgColor}; background-image: ${bgUrl ? `url(${bgUrl})` : 'none'}; background-size: cover; background-position: center; border: ${borderWidth}px solid ${borderColor}; border-radius: ${rounding}px; opacity: ${opacity}; overflow: hidden;">
        <div class="container-label-fragment"
          style="position: absolute; left: ${labelX}px; top: ${labelY}px; width: ${labelW ? `${labelW}px` : 'auto'}; height: ${labelH ? `${labelH}px` : 'auto'}; background-color: ${labelBg}; border-radius: ${labelRounding}px; display: flex; align-items: center; justify-content: ${flexAlign}; padding: ${labelPadding}px; white-space: nowrap; z-index: 10;">
          <span style="font-family: ${font}; font-size: ${fontSize}px; color: ${fontColor}; text-align: ${alignment}; letter-spacing: ${spacing}px; width: 100%;">
            ${isError ? '⚠️ INTEGRITY_LEAK' : label}
          </span>
        </div>
      </div>
    `.trim();
  }

  /**
   * MASTER DISPATCHER
   */
  static renderCellHTML(item: ManifestEntity, options: CellOptions): string {
    const { runtimeValue, steps, isSelected, resolveAsset, manifest } = options;
    const compType = item.presentation?.component || 'knob';
    
    // 1. RACK BRANCH
    if (compType === 'rack') {
      return this.renderRackHTML(item, options);
    }

    // 2. ARCHITECTURAL BRANCH
    const isArchitectural = compType === 'container' || compType === 'group';
    if (isArchitectural) {
      return `
        <div class="architectural-cell" style="width: 100%; height: 100%; position: relative;">
          ${this.renderContainerHTML(item, options)}
        </div>
      `.trim();
    }

    // 2. PRIMITIVE BRANCH
    const variant = item.presentation?.variant || 'B_cyan';
    const parsed = parseVariant(variant);
    const size = (item.presentation?.scale as string) || parsed.size;
    const colorId = parsed.colorId;
    const compRadius = getComponentRadius(item);
    
    // ERA 7.2.3 - AESTHETIC RESOLUTION
    const rawStyle = item.presentation?.style || {};
    const resolvedStyle = ColorResolver.resolveStyle(rawStyle, manifest);
    
    const assetId = resolvedStyle.asset || item.presentation?.asset;
    const assetDef = manifest?.resources?.assets?.find((a) => a.id === assetId);
    const assetUrl = resolveAsset ? resolveAsset(assetId) : assetId;
    
    const inherited = getInheritedTypography(item.type as string, manifest);
    
    const commonProps = { 
      size, colorId, value: runtimeValue, id: item.id,
      isSelected: !!isSelected, isMain: true, style: resolvedStyle
    };

    const renderer = COMP_RENDERER_MAP[compType];
    let mainHTML = '';
    try {
      mainHTML = renderer 
        ? renderer(item, commonProps as Record<string, unknown>, { 
            assetUrl: assetUrl as string, 
            assetDef, 
            steps, 
            runtimeValue, 
            inherited: inherited as Record<string, unknown>, 
            manifest,
            forceFrame: options.forceFrame
          })
        : `<div class="unsupported-renderer">NO RENDERER: ${compType}</div>`;
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`[CELL RENDERER] Fatal error in primitive ${item.presentation?.component}:`, error);
      mainHTML = `
        <div class="renderer-error" style="color: #ff3300; font-family: monospace; font-size: 8px; border: 1px solid #ff3300; padding: 4px; background: rgba(255,51,0,0.1);">
          ERROR: ${error.message}
        </div>
      `;
    }

    const attachments = item.presentation?.attachments || [];
    const stackOptions = { runtimeValue, steps, inherited, manifest, resolveAsset };

    const cellOffsetX = (item.presentation?.offsetX || 0) * 1.5;
    const cellOffsetY = (item.presentation?.offsetY || 0) * 1.5;

    const containerWidth = resolvedStyle.width !== undefined ? resolvedStyle.width : (compRadius * 2 * 1.5);
    const containerHeight = resolvedStyle.height !== undefined ? resolvedStyle.height : (compRadius * 2 * 1.5);

    return `
      <div class="control-cell variant-${variant}" style="--comp-radius: ${compRadius}px;">
        ${renderAttachmentStackHTML('top', attachments, stackOptions)}
        ${renderAttachmentStackHTML('bottom', attachments, stackOptions)}
        ${renderAttachmentStackHTML('left', attachments, stackOptions)}
        ${renderAttachmentStackHTML('right', attachments, stackOptions)}
        ${renderAttachmentStackHTML('center', attachments, stackOptions)}
        <div class="cell-main" style="width: ${containerWidth}px; height: ${containerHeight}px; transform: translate(calc(-50% + ${cellOffsetX}px), calc(-50% + ${cellOffsetY}px))">
          ${mainHTML}
        </div>
      </div>
    `.trim();
  }
}
