/**
 * OMEGA Scope Primitive Renderer
 * Era 7.2.3 Industrial Aseptic
 */

export interface ScopeProps {
  variant: string;
  bind: string;
  size: { w: number; h: number };
  color?: string;
}

export function renderScopeHTML(props: ScopeProps): string {
  const { variant, bind, size, color = 'var(--scope-color, #00ff88)' } = props;
  const zoom = 1.5;
  const w = size.w * zoom;
  const h = size.h * zoom;

  return `
    <div class="scope-display variant-${variant}" 
         data-bind="${bind}"
         style="--scope-width: ${w}px; --scope-height: ${h}px; --scope-color: ${color};">
        <canvas class="scope-canvas" width="${w}" height="${h}"></canvas>
        <div class="scope-grid"></div>
    </div>
  `;
}
