/**
 * OMEGA UI CORE — Stateless LED Renderer (Era 7.2.3)
 * Single Source of Truth for LED HTML Structure.
 */

export interface LedProps {
  size: string;      // A, B, C, D
  colorId: string;   // cyan, red, orange, etc.
  value: number;     // 0.0 to 1.0
  id?: string;       // Optional binding ID
  transform?: string; // Optional CSS transform
}

export const renderLedHTML = (props: LedProps): string => {
  const { size, colorId, value, id, transform } = props;
  
  // Calculate visibility/glow based on value
  const isActive = value > 0.05;
  const opacity = 0.3 + (value * 0.7);
  
  // Industrial Pattern: .led.size-X.color-Y[.active]
  const classes = [
    'led',
    `size-${size}`,
    `color-${colorId}`,
    isActive ? 'active' : ''
  ].filter(Boolean).join(' ');

  const style = [
    `opacity: ${opacity}`,
    transform || ''
  ].filter(Boolean).join('; ');

  return `<div class="${classes}" ${id ? `data-source="${id}"` : ''} style="${style}">
    <div class="led-glass-overlay"></div>
    <div class="led-internal-glow"></div>
  </div>`;
};
