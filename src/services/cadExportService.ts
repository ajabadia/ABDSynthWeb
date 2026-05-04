/**
 * OMEGA CAD Export Service (v7.2.3)
 * Generates technical industrial blueprints (SVG) from manifests.
 */
import { OMEGA_Manifest } from '../types/manifest';

export class CADExportService {
  static generateSVGBlueprint(manifest: OMEGA_Manifest): string {
    const hp = manifest.metadata?.rack?.hp || 12;
    const rackWidthPx = hp * 15 * 1.5;
    const rackHeightPx = (manifest.ui?.dimensions?.height || (manifest.metadata?.rack?.height_mode === 'compact' ? 140 : 420)) * 1.5;
    const margin = 60;
    const skin = manifest.ui?.skin || 'industrial';

    const containers = manifest.ui?.layout?.containers || [];
    const elements = [
      ...(manifest.ui?.controls || []).map(e => ({ ...e, isJack: false })),
      ...(manifest.ui?.jacks || []).map(e => ({ ...e, isJack: true }))
    ];

    const skinColor = skin === 'carbon' ? '#080808' : skin === 'minimal' ? '#f0f0f0' : skin === 'glass' ? '#1a1a1a' : '#111111';
    const accentColor = skin === 'minimal' ? '#000000' : '#00f0ff';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rackWidthPx + margin * 2}" height="${rackHeightPx + margin * 2}" viewBox="0 0 ${rackWidthPx + margin * 2} ${rackHeightPx + margin * 2}">
      <rect width="100%" height="100%" fill="#050505" />
      
      <g transform="translate(${margin}, ${margin})">
        <!-- RACK CHASSIS -->
        <rect width="${rackWidthPx}" height="${rackHeightPx}" fill="${skinColor}" stroke="${accentColor}" stroke-width="2" rx="2" />
        
        <!-- SCREWS (Era 7 Standard) -->
        <g fill="#333" stroke="#555" stroke-width="0.5">
          <circle cx="12" cy="12" r="4" />
          <circle cx="${rackWidthPx - 12}" cy="12" r="4" />
          <circle cx="12" cy="${rackHeightPx - 12}" r="4" />
          <circle cx="${rackWidthPx - 12}" cy="${rackHeightPx - 12}" r="4" />
        </g>
        
        <!-- LABELS -->
        <text x="0" y="-15" fill="${accentColor}" font-family="monospace" font-size="10" font-weight="900">RACK CHASSIS [ ${hp} HP / ${Math.round(rackWidthPx)} px ]</text>
        <text x="0" y="-30" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="8">OMEGA ERA 7.2.3 | INDUSTRIAL BLUEPRINT</text>

        <!-- CONTAINERS -->
        ${containers.map(c => `
          <g>
            <rect 
              x="${c.pos.x * 1.5}" 
              y="${c.pos.y * 1.5}" 
              width="${typeof c.size.w === 'number' ? c.size.w * 1.5 : rackWidthPx - (c.pos.x * 1.5)}" 
              height="${c.size.h * 1.5}" 
              fill="rgba(255, 255, 255, 0.02)" 
              stroke="rgba(255, 255, 255, 0.1)" 
              stroke-width="0.5" 
              stroke-dasharray="2 2"
            />
            <text x="${c.pos.x * 1.5 + 4}" y="${c.pos.y * 1.5 + 8}" fill="rgba(255, 255, 255, 0.2)" font-family="monospace" font-size="6" font-weight="900">${c.label.toUpperCase()}</text>
          </g>
        `).join('')}

        <!-- ELEMENTS -->
        ${elements.map(e => {
          const ex = e.pos.x * 1.5;
          const ey = e.pos.y * 1.5;
          const color = e.presentation?.variant === 'B_cyan' ? '#00f0ff' : 
                        e.presentation?.variant === 'neon_amber' ? '#ff8c00' : 
                        e.presentation?.variant === 'white' ? '#ffffff' : 
                        e.presentation?.variant === 'orange' ? '#ffa500' : accentColor;
          
          return `
            <g transform="translate(${ex}, ${ey})">
              ${e.isJack ? `
                <circle r="12" fill="#222" stroke="${color}" stroke-width="0.5" opacity="0.3" />
                <circle r="9" fill="#000" stroke="${color}" stroke-width="2" />
              ` : `
                <circle r="16" fill="#222" stroke="${color}" stroke-width="0.5" opacity="0.3" />
                <circle r="14" fill="#151515" stroke="${color}" stroke-width="1.5" />
                <line y1="-14" y2="-8" stroke="${color}" stroke-width="2" stroke-linecap="round" transform="rotate(45)" />
              `}
              <text y="28" fill="${color}" font-family="monospace" font-size="7" font-weight="900" text-anchor="middle">${e.id.toUpperCase()}</text>
              <text y="36" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="5" text-anchor="middle">X:${e.pos.x} Y:${e.pos.y}</text>
            </g>
          `;
        }).join('')}
      </g>

      <text x="${margin}" y="${rackHeightPx + margin + 30}" fill="rgba(255, 255, 255, 0.2)" font-family="monospace" font-size="8">MODULE: ${manifest.id.toUpperCase()} | SKU: ${manifest.metadata.family.toUpperCase()} | DESIGN INTEGRITY: 100%</text>
    </svg>`;

    return svg;
  }
}
