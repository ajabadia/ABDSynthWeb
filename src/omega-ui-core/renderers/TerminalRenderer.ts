/**
 * OMEGA Terminal Primitive Renderer
 * Era 7.2.3 Industrial Aseptic
 */

export interface TerminalProps {
  variant: string;
  bind: string;
  size: { w: number; h: number };
  color?: string;
  font?: string;
}

export function renderTerminalHTML(props: TerminalProps): string {
  const { variant, bind, size, color = 'var(--terminal-color, #ffcc00)', font = 'monospace' } = props;
  const zoom = 1.5;
  const w = size.w * zoom;
  const h = size.h * zoom;

  return `
    <div class="terminal-display variant-${variant}" 
         data-bind="${bind}"
         style="--terminal-width: ${w}px; --terminal-height: ${h}px; color: ${color}; font-family: ${font};">
        <div class="terminal-container"></div>
    </div>
  `;
}
