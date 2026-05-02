/**
 * OMEGA CAD Export Service (v7.2.3)
 * Generates technical industrial blueprints (SVG) from manifests.
 */
import { OMEGA_Manifest } from '../types/manifest';

export class CADExportService {
  static generateSVGBlueprint(manifest: OMEGA_Manifest): string {
    const hp = manifest.metadata?.rack?.hp || 12;
    const rackWidthPx = hp * 15 * 1.5;
    const rackHeightPx = 420 * 1.5;
    const margin = 60;
    const skin = manifest.ui?.skin || 'industrial';

    const containers = manifest.ui.layout?.containers || [];
    const elements = [
      ...(manifest.ui?.controls || []),
      ...(manifest.ui?.jacks || [])
    ];

    const skinColor = skin === 'carbon' ? '#080808' : skin === 'minimal' ? '#f0f0f0' : skin === 'glass' ? '#1a1a1a' : '#111111';
    const accentColor = skin === 'minimal' ? '#000000' : '#00f0ff';
    const textColor = skin === 'minimal' ? '#333' : '#fff';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rackWidthPx + margin * 2}" height="${rackHeightPx + margin * 2}" viewBox="0 0 ${rackWidthPx + margin * 2} ${rackHeightPx + margin * 2}">
      <rect width="100%" height="100%" fill="#050505" />
      
      <g transform="translate(${margin}, ${margin})">
        <!-- RACK CHASSIS -->
        <rect width="${rackWidthPx}" height="${rackHeightPx}" fill="${skinColor}" stroke="${accentColor}" stroke-width="2" rx="2" />
        
        <!-- SCREWS -->
        <circle cx="8" cy="8" r="3" fill="#333" stroke="#555" stroke-width="0.5" />
        <circle cx="${rackWidthPx - 8}" cy="8" r="3" fill="#333" stroke="#555" stroke-width="0.5" />
        <circle cx="8" cy="${rackHeightPx - 8}" r="3" fill="#333" stroke="#555" stroke-width="0.5" />
        <circle cx="${rackWidthPx - 8}" cy="${rackHeightPx - 8}" r="3" fill="#333" stroke="#555" stroke-width="0.5" />

        <!-- LABELS -->
        <text x="0" y="-15" fill="${accentColor}" font-family="monospace" font-size="10" font-weight="900">RACK CHASSIS [ ${hp} HP / ${rackWidthPx} px ]</text>
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
          const isJack = e.type === 'jack' || e.role === 'stream';
          const ex = e.pos.x * 1.5;
          const ey = e.pos.y * 1.5;
          
          return `
            <g transform="translate(${ex}, ${ey})">
              ${isJack ? `
                <circle r="10" fill="#222" stroke="${accentColor}" stroke-width="0.5" opacity="0.3" />
                <circle r="7" fill="#000" stroke="${accentColor}" stroke-width="1.5" />
              ` : `
                <circle r="14" fill="#222" stroke="${accentColor}" stroke-width="0.5" opacity="0.3" />
                <circle r="12" fill="#151515" stroke="${accentColor}" stroke-width="1" />
                <line y1="-12" y2="-6" stroke="${accentColor}" stroke-width="2" stroke-linecap="round" transform="rotate(45)" />
              `}
              <text y="24" fill="${accentColor}" font-family="monospace" font-size="7" font-weight="900" text-anchor="middle">${e.id.toUpperCase()}</text>
              <text y="32" fill="rgba(255,255,255,0.2)" font-family="monospace" font-size="5" text-anchor="middle">X:${e.pos.x} Y:${e.pos.y}</text>
              
              <line x1="-18" x2="18" stroke="${accentColor}" stroke-width="0.2" opacity="0.1" />
              <line y1="-18" y2="18" stroke="${accentColor}" stroke-width="0.2" opacity="0.1" />
            </g>
          `;
        }).join('')}
      </g>

      <text x="${margin}" y="${rackHeightPx + margin + 30}" fill="rgba(255, 255, 255, 0.2)" font-family="monospace" font-size="8">MODULE: ${manifest.id.toUpperCase()} | SKU: ${manifest.metadata.family.toUpperCase()} | DESIGN INTEGRITY: 100%</text>
    </svg>`;

    return svg;
  }
}
