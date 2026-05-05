/**
 * OMEGA UI CORE — Stateless Knob Renderer (Era 7.2.3)
 * Single Source of Truth for Knob HTML Structure.
 */

export interface KnobProps {
  size: string;          // A, B, C, D
  colorId: string;       // cyan, orange, etc.
  value: number;         // 0.0 to 1.0
  isSelected?: boolean;
  isMain?: boolean;
  id?: string;           // Canonical ID
  rotationOffset?: number; // Standard: -135
  rotationRange?: number;  // Standard: 270
  assetUrl?: string | undefined;       // URL del recurso (blob o external)
  frames?: number | undefined;         // Número de frames en el filmstrip
  orientation?: 'v' | 'h' | undefined; // Orientación del strip
}

export const renderKnobHTML = (props: KnobProps): string => {
  const { 
    size, 
    colorId, 
    value, 
    isSelected, 
    isMain, 
    id, 
    rotationOffset = -135, 
    rotationRange = 270,
    assetUrl,
    frames,
    orientation = 'v'
  } = props;
  
  // Canonical rotation formula
  const rotation = rotationOffset + (value * rotationRange);
  const selectedClass = isMain && isSelected ? 'selected' : '';
  const hasAssetClass = assetUrl ? 'has-asset' : '';
  
  const classes = [
    'knob-container',
    `size-${size}`,
    `color-${colorId}`,
    selectedClass,
    hasAssetClass
  ].filter(Boolean).join(' ');

  let assetHTML = '';
  if (assetUrl) {
    let backgroundStyle = `background-image: url(${assetUrl});`;
    if (frames && frames > 1) {
        // Filmstrip Logic: Calculate which frame to show
        const frameIndex = Math.min(Math.floor(value * frames), frames - 1);
        const percent = (frameIndex / (frames - 1)) * 100;
        backgroundStyle += orientation === 'v' 
            ? `background-position: 0% ${percent}%;` 
            : `background-position: ${percent}% 0%;`;
    }
    assetHTML = `<div class="knob-asset filmstrip-${orientation}" style="${backgroundStyle}"></div>`;
  }

  return `
    <div class="${classes}" ${id ? `data-source="${id}"` : ''}>
      <div class="knob-shadow-ring"></div>
      ${assetHTML}
      <div class="knob-cap">
        <div class="knob-specular"></div>
      </div>
      <div class="knob-marker" style="transform: rotate(${rotation}deg)"></div>
    </div>
  `.trim();
};
