import React from 'react';
import { motion } from 'framer-motion';
import { OMEGA_Manifest, ManifestEntity, TabName } from '@/types/manifest';

interface ModulationCablesProps {
  manifest: OMEGA_Manifest;
  allElements: ManifestEntity[];
  activeTab: TabName;
}

/**
 * ModulationCables (v7.2.3)
 * Renders SVG patch cables to visualize signal modulations.
 */
export const ModulationCables = ({ manifest, allElements, activeTab }: ModulationCablesProps) => {
  if (activeTab !== 'MOD') return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
      {(manifest.modulations || []).map((mod) => {
        const src = allElements.find(e => e.id === mod.source);
        const tgt = allElements.find(e => e.id === mod.target);
        if (!src || !tgt) return null;

        return (
          <g key={mod.id}>
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              d={`M ${src.pos.x * 1.5} ${src.pos.y * 1.5} C ${(src.pos.x + 20) * 1.5} ${src.pos.y * 1.5}, ${(tgt.pos.x - 20) * 1.5} ${tgt.pos.y * 1.5}, ${tgt.pos.x * 1.5} ${tgt.pos.y * 1.5}`}
              fill="none"
              stroke="cyan"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
            />
            <motion.circle 
              cx={src.pos.x * 1.5} cy={src.pos.y * 1.5} r="3" fill="cyan" 
              animate={{ r: [3, 5, 3] }} transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.circle cx={tgt.pos.x * 1.5} cy={tgt.pos.y * 1.5} r="3" fill="cyan" />
          </g>
        );
      })}
    </svg>
  );
};
