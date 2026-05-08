/**
 * OMEGA UI CORE — Illustration Renderer (Fase 13)
 * Renders static images, logos, and technical drawings.
 */

export interface IllustrationProps {
  assetUrl?: string | undefined;
  size?: { w: number; h: number } | undefined;
  opacity?: number | undefined;
  id?: string | undefined;
  variant?: string | undefined;
}

export const renderIllustrationHTML = (props: IllustrationProps): string => {
  const { assetUrl, size, id, variant = 'contain' } = props;
  
  const w = size?.w || 40;
  const h = size?.h || 40;

  if (!assetUrl) {
    return `<div class="illustration-container illustration-missing" style="width: ${w * 1.5}px; height: ${h * 1.5}px;"></div>`;
  }

  return `
    <div 
        class="illustration-container variant-${variant}" 
        style="width: ${w * 1.5}px; height: ${h * 1.5}px;"
        ${id ? `data-source="${id}"` : ''}
    >
        <img 
          src="${assetUrl}" 
          style="width: 100%; height: 100%;" 
        />
    </div>
  `.trim();
};
