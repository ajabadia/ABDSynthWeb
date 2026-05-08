'use client';

import { useMemo, useCallback } from 'react';
import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';

/**
 * useDesignTokens (Era 7.2.3)
 * The central bridge between industrial governance and atomic rendering.
 */
export const useDesignTokens = (manifest: OMEGA_Manifest, entity?: ManifestEntity) => {
  const ui = manifest.ui || {};
  
  // 1. GLOBAL ATMOSPHERIC PHYSICS
  const physics = useMemo(() => {
    const lighting = ui.lighting || { shadowAngle: 135, shadowColor: 'rgba(0,0,0,0.5)', distance: 4, blur: 4 };
    const angleRad = ((lighting.shadowAngle || 0) * Math.PI) / 180;
    
    // Industrial scaling: Distance affects the offset, Blur affects the spread
    const dist = lighting.distance ?? 4;
    const blur = lighting.blur ?? 4;
    const shadowX = Math.cos(angleRad) * dist;
    const shadowY = Math.sin(angleRad) * dist;

    return {
      angle: lighting.shadowAngle,
      color: lighting.shadowColor,
      distance: dist,
      blur: blur,
      // CSS filter for drop-shadow
      filter: `drop-shadow(${shadowX}px ${shadowY}px ${blur}px ${lighting.shadowColor})`,
      // CSS variable map
      vars: {
        '--omega-shadow-angle': `${lighting.shadowAngle}deg`,
        '--omega-shadow-color': lighting.shadowColor,
        '--omega-shadow-x': `${shadowX}px`,
        '--omega-shadow-y': `${shadowY}px`,
        '--omega-shadow-blur': `${blur}px`,
      }
    };
  }, [ui.lighting]);

  // 2. MASTER COLOR PALETTE
  const colors = useMemo(() => {
    const c = ui.colors || { accent: '#00f2ff', weak: '#555555', surface: '#1a1c1e', text: '#ffffff' };
    const palette = ui.palette || { primary: '#00f2ff', secondary: '#ff8c00', utility: '#a0a0a0', feedback: '#32cd32' };

    return {
      ...c,
      palette,
      vars: {
        '--omega-accent': c.accent,
        '--omega-accent-rgb': hexToRgb(c.accent),
        '--omega-weak': c.weak || '#555555',
        '--omega-surface': c.surface || '#1a1c1e',
        '--omega-text': c.text || '#ffffff',
        // Export palette tokens
        '--omega-palette-primary': palette.primary,
        '--omega-palette-secondary': palette.secondary,
        '--omega-palette-utility': palette.utility,
        '--omega-palette-feedback': palette.feedback,
      }
    };
  }, [ui.colors, ui.palette]);

  // MASTER COLOR RESOLVER
  const resolveColor = useCallback((color: string | undefined, fallback: string = 'transparent') => {
    if (!color || color === 'transparent') return fallback;
    
    // Resolve palette tokens using the same logic as the memo
    const palette = (ui.palette || { primary: '#00f2ff', secondary: '#ff8c00', utility: '#a0a0a0', feedback: '#32cd32' }) as Record<string, string | undefined>;
    if (palette[color]) return palette[color];
    
    const colors = (ui.colors || {}) as Record<string, string | undefined>;
    if (colors[color]) return colors[color];
    
    return color;
  }, [ui.palette, ui.colors]);

  // 3. TYPOGRAPHY RESOLVER
  const resolveFont = useCallback((fontIdOrCategory: string) => {
    const typography = ui.typography || {};
    
    // Check if it's an abstract definition (font_a, font_b...)
    const definition = typography.definitions?.find(d => d.id === fontIdOrCategory);
    if (definition?.family) return definition.family;

    // Check if it's a category default (labels, headings...)
    const category = (typography as Record<string, Record<string, string>>)[fontIdOrCategory];
    if (category?.font) return category.font;

    // Fallback to global default
    return typography.defaultFont || 'Inter';
  }, [ui.typography]);

  // 4. COMPONENT STYLE RESOLVER
  const style = useMemo(() => {
    if (!entity) return null;
    
    // Industrial lookup key: Component override -> Entity Type -> Fallback to 'container' if missing
    const lookupKey = entity.presentation?.component || entity.type || 'container';
    const variant = (entity as unknown as Record<string, unknown>).variant || entity.presentation?.variant || 'default';
    
    // Lookup in industrial library
    const libStyles = ui.styles?.[lookupKey] || [];
    const libStyle = libStyles.find(s => s.id === variant as string);
    
    return {
      ...libStyle?.aesthetics,
      // Resolve abstract font if defined in style
      resolvedFont: libStyle?.aesthetics?.font ? resolveFont(libStyle.aesthetics.font) : null
    };
  }, [entity, ui.styles, resolveFont]);

  // 5. RESOLVED PHYSICS (FOR THE SPECIFIC COMPONENT)
  const resolvedPhysics = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h = (entity?.presentation?.height ?? (style as any)?.height ?? 1.0) as number;
    
    if (h === 0) return { ...physics, filter: 'none', height: 0 };

    const compX = physics.vars['--omega-shadow-x'].replace('px', '');
    const compY = physics.vars['--omega-shadow-y'].replace('px', '');
    const compBlur = physics.vars['--omega-shadow-blur'].replace('px', '');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalX = parseFloat(compX) * (h as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = parseFloat(compY) * (h as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalBlur = parseFloat(compBlur) * (h as any);

    return {
      ...physics,
      height: h,
      filter: `drop-shadow(${finalX}px ${finalY}px ${finalBlur}px ${physics.color})`,
      vars: {
        ...physics.vars,
        '--omega-height': h.toString(),
        '--omega-comp-shadow-x': `${finalX}px`,
        '--omega-comp-shadow-y': `${finalY}px`,
        '--omega-comp-shadow-blur': `${finalBlur}px`,
      }
    };
  }, [physics, entity, style]);

  // 6. INDUSTRIAL STYLE VARIABLE MAP
  const styleVars = useMemo(() => {
    const p = entity?.presentation || {};
    const s = style || {};
    
    const resolve = (key: string, fallback: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = (p as any).style?.[key] ?? (p as any)[key] ?? (s as any)[key];
      return (val === undefined || val === null) ? fallback : val;
    };

    return {
      '--omega-rounding': `${resolve('rounding', 0)}px`,
      '--omega-border-width': `${resolve('borderWidth', 0)}px`,
      '--omega-padding': `${resolve('padding', 0)}px`,
      '--omega-intensity': resolve('intensity', 1.0).toString(),
      '--omega-alignment': resolve('alignment', 'left'),
      '--omega-texture': resolve('texture', 'none'),
      '--omega-opacity': resolve('opacity', 1.0).toString(),
      '--omega-blur': `${resolve('blur', 0)}px`,
      '--omega-spacing': `${resolve('spacing', 0)}px`,
      '--omega-shadow-intensity': (resolve('shadow', 0) / 100).toString(),
      // Typography
      '--omega-font': resolveFont(resolve('font', '')),
      '--omega-font-size': resolve('fontSize', 0) ? `${resolve('fontSize', 0)}px` : 'inherit',
      '--omega-font-color': resolveColor(resolve('fontColor', 'inherit'), 'inherit'),
      // Color Overrides
      '--omega-color-override': resolveColor(resolve('color', 'transparent')),
      '--omega-indicator-color': resolveColor(resolve('indicatorColor', 'transparent')),
      '--omega-glow-color': resolveColor(resolve('glowColor', 'transparent')),
      '--omega-glass-color': resolveColor(resolve('glassColor', 'transparent')),
      '--omega-indicator-color-rgb': hexToRgb(resolveColor(resolve('indicatorColor', '#00f2ff'))),
      // Container Label Specifics (Spatial & Surface)
      '--omega-label-x': `${resolve('labelX', 0)}px`,
      '--omega-label-y': `${resolve('labelY', 0)}px`,
      '--omega-label-w': resolve('labelW', 0) ? `${resolve('labelW', 0)}px` : 'auto',
      '--omega-label-h': resolve('labelH', 0) ? `${resolve('labelH', 0)}px` : 'auto',
      '--omega-label-bg': resolveColor(resolve('labelBg', 'transparent')),
      '--omega-label-rounding': `${resolve('labelRounding', 0)}px`,
      '--omega-label-padding': `${resolve('labelPadding', 4)}px`,
    };
  }, [entity, style, resolveColor, resolveFont]);

  return {
    physics: resolvedPhysics,
    colors,
    resolveFont,
    resolveColor,
    style,
    // Unified CSS variable map
    allVars: {
      ...resolvedPhysics.vars,
      ...colors.vars,
      ...styleVars
    }
  };
};

// HELPER: Hex to RGB for glassmorphism effects
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 240, 255';
}
