import React from 'react';
import { motion } from 'framer-motion';
import { LayoutContainer, OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';
import { ValidationIssue } from '@/types/validation';
import IndustrialContainer from '../shared/IndustrialContainer';

interface RackContainerProps {
  container: LayoutContainer;
  isSelected: boolean;
  activeContainers: Record<string, number>;
  audit: AuditResult;
  skin: string;
  rackWidthPx: number;
  isLiveMode?: boolean;
  resolveAsset?: (ref: string | undefined) => string | undefined;
  manifest?: OMEGA_Manifest;
}

import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';

const RackContainerBase = ({ 
  container, 
  isSelected, 
  activeContainers, 
  audit, 
  skin, 
  rackWidthPx,
  resolveAsset,
  manifest
}: RackContainerProps) => {
  const c = container;
  const isCollapsed = c.collapsed;
  
  // INDUSTRIAL TOKEN RESOLUTION
  useDesignTokens(manifest as OMEGA_Manifest, c as unknown as ManifestEntity);

  const resolveWidth = (w: string | number): number => {
    if (typeof w === 'number') return w * 1.5;
    switch (w) {
      case 'full': return rackWidthPx;
      case '3/4': return rackWidthPx * 0.75;
      case '2/3': return rackWidthPx * 0.667;
      case '1/2': return rackWidthPx * 0.5;
      case '1/3': return rackWidthPx * 0.333;
      case '1/4': return rackWidthPx * 0.25;
      default: return (parseInt(w) || 100) * 1.5;
    }
  };

  const cw = resolveWidth(c.size.w);
  const ch = isCollapsed ? 30 : (c.size.h * 1.5);
  const cx = c.pos.x * 1.5;
  const cy = c.pos.y * 1.5;
  const containerIssues = React.useMemo(() => 
    audit?.issues?.filter((i: ValidationIssue) => i.path.includes(c.id) || i.message.includes(`'${c.id}'`)) || [],
    [audit.issues, c.id]
  );
  
  const hasIntegrityError = containerIssues.some(i => i.keyword === 'era7_integrity');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: 1,
        boxShadow: isSelected 
          ? '0 0 40px rgba(0,240,255,0.15)' 
          : (hasIntegrityError ? '0 0 20px rgba(255,62,62,0.1)' : '0 0 0px rgba(0,0,0,0)'),
      }}
      className="absolute pointer-events-none"
      style={{ 
        left: cx, 
        top: cy, 
        width: cw, 
        height: ch,
        zIndex: isSelected ? 5 : 0,
      }}
    >
      <IndustrialContainer 
        container={c}
        manifest={manifest as OMEGA_Manifest}
        resolveAsset={resolveAsset}
        isSelected={isSelected}
        isError={hasIntegrityError}
        className={`w-full h-full container-${skin}`}
        style={{ '--omega-z-index': c.zIndex ?? (isSelected ? 10 : 1) } as React.CSSProperties}
      />

      {/* ACTIVITY HEATMAP PULSE */}
      <motion.div 
        animate={{ 
          opacity: (activeContainers[c.id] || 0) * 0.2 + 0.05,
          scale: 1 + (activeContainers[c.id] || 0) * 0.01
        }}
        transition={{ type: 'spring', damping: 20 }}
        className={`absolute inset-0 rounded-xs pointer-events-none ${hasIntegrityError ? 'bg-red-500/20' : 'bg-primary/20'}`}
        style={{ borderRadius: c.rounding ? `${c.rounding}px` : 'var(--omega-rounding)' }}
      />
    </motion.div>
  );
};

export const RackContainer = React.memo(RackContainerBase, (prev, next) => {
  return (
    prev.container.id === next.container.id &&
    prev.container.collapsed === next.container.collapsed &&
    JSON.stringify(prev.container.pos) === JSON.stringify(next.container.pos) &&
    JSON.stringify(prev.container.size) === JSON.stringify(next.container.size) &&
    prev.isSelected === next.isSelected &&
    prev.skin === next.skin &&
    prev.isLiveMode === next.isLiveMode &&
    prev.container.asset === next.container.asset &&
    prev.container.color === next.container.color &&
    prev.container.rounding === next.container.rounding &&
    prev.container.borderWidth === next.container.borderWidth &&
    prev.container.font === next.container.font &&
    prev.container.fontSize === next.container.fontSize &&
    prev.container.fontColor === next.container.fontColor &&
    prev.container.zIndex === next.container.zIndex &&
    JSON.stringify(prev.container.style) === JSON.stringify(next.container.style) &&
    prev.activeContainers[prev.container.id] === next.activeContainers[next.container.id] &&
    prev.audit.issues.length === next.audit.issues.length &&
    JSON.stringify(prev.manifest?.ui?.styles) === JSON.stringify(next.manifest?.ui?.styles) &&
    JSON.stringify(prev.manifest?.ui?.typography) === JSON.stringify(next.manifest?.ui?.typography)
  );
});
