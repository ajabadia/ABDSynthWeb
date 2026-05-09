import { useEffect } from 'react';
import { OMEGA_Manifest } from '@/types/manifest';
 
/**
 * OMEGA Dynamic Font Loader Hook
 * ---------------------------------------------------------------------------
 * Injects custom @font-face rules into the document head based on manifest resources.
 * This ensures the Manifest Editor rack preview matches the production engine.
 */
export function useDynamicFonts(manifest: OMEGA_Manifest, resolveAsset?: (path: string) => string | undefined) {
  useEffect(() => {
    const fonts = manifest.ui.resources?.fonts || [];
    if (fonts.length === 0) return;
 
    const styleId = 'omega-dynamic-fonts';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
 
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
 
    const fontRules = fonts.map(font => {
      const url = resolveAsset ? resolveAsset(font.file) : font.file;
      if (!url) return '';
      
      return `
        @font-face {
          font-family: '${font.name}';
          src: url('${url}');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
      `;
    }).join('\n');
 
    styleTag.textContent = fontRules;
 
    return () => {
      // We don't necessarily want to remove the style on every re-render, 
      // but if the component unmounts we might want to clean up.
    };
  }, [manifest.ui.resources?.fonts, resolveAsset]);
}
