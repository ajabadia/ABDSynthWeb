import React from 'react';
import { motion } from 'framer-motion';
import { LayoutContainer } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';
import { ValidationIssue } from '@/types/validation';

interface RackContainerProps {
  container: LayoutContainer;
  isSelected: boolean;
  activeContainers: Record<string, number>;
  audit: AuditResult;
  skin: string;
  rackWidthPx: number;
  isLiveMode?: boolean;
}

/**
 * RackContainer (v7.2.3)
 * Renders architectural containers (sections, panels, headers) within the rack.
 */
const RackContainerBase = ({ 
  container, 
  isSelected, 
  activeContainers, 
  audit, 
  skin, 
  rackWidthPx
}: RackContainerProps) => {
  const c = container;
  const isCollapsed = c.collapsed;
  
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
  const variant = c.variant || 'default';
  
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
      className={`layout-container container-${skin} variant-${variant} ${isSelected ? 'selected' : ''} ${hasIntegrityError ? 'error' : ''}`}
      style={{ 
        position: 'absolute',
        left: cx, 
        top: cy, 
        width: cw, 
        height: ch,
        zIndex: isSelected ? 5 : 0,
        pointerEvents: 'none'
      }}
    >
      {/* ACTIVITY HEATMAP PULSE */}
      <motion.div 
        animate={{ 
          opacity: (activeContainers[c.id] || 0) * 0.2 + 0.05,
          scale: 1 + (activeContainers[c.id] || 0) * 0.01
        }}
        transition={{ type: 'spring', damping: 20 }}
        className={`absolute inset-0 rounded-xs pointer-events-none ${hasIntegrityError ? 'bg-red-500/20' : 'bg-primary/20'}`}
      />

      {/* CANONICAL LABEL PILL */}
      <div className="container-label-pill">
          {hasIntegrityError ? '⚠️ INTEGRITY_LEAK' : c.label}
      </div>
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
    prev.activeContainers[prev.container.id] === next.activeContainers[next.container.id] &&
    prev.audit.issues.length === next.audit.issues.length
  );
});
