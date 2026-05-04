/**
 * OMEGA UI CORE — Stateless Display Renderer (Era 7.2.3)
 * Single Source of Truth for Display HTML Structure.
 */

export interface DisplayProps {
  size: string;      // A, B, C, D
  colorId: string;   // cyan, orange, etc.
  mode: string;      // oled, lcd, led
  value: number;     // 0.0 to 1.0
  steps: number;     // Total steps to display
  id?: string;       // Canonical ID
}

export const renderDisplayHTML = (props: DisplayProps): string => {
  const { size, colorId, mode, value, steps, id } = props;
  
  const displayValue = Math.round(value * (steps || 100));

  return `
    <div class="mini-display variant-${mode} size-${size} color-${colorId}" ${id ? `data-source="${id}"` : ''}>
      <button class="display-btn minus" data-action="step-down">−</button>
      <div class="display-value">${displayValue}</div>
      <button class="display-btn plus" data-action="step-up">+</button>
    </div>
  `.trim();
};
