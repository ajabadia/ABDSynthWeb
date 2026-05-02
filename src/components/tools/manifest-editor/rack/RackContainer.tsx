import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { OMEGA_Manifest } from '../../../../types/manifest';
import { AuditResult } from '@/services/auditService';

interface RackContainerProps {
  container: any;
  isSelected: boolean;
  activeContainers: Record<string, number>;
  audit: AuditResult;
  skin: string;
  rackWidthPx: number;
  isLiveMode?: boolean;
  onToggleCollapse?: () => void;
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
  rackWidthPx,
  isLiveMode = false,
  onToggleCollapse
}: RackContainerProps) => {
  const c = container;
  const isCollapsed = c.collapsed;
  
  const resolveWidth = (w: any): number => {
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

  const getVariantStyles = (variant: string, isSelected: boolean) => {
    switch (variant) {
      case 'header':
        return {
          borderColor: isSelected ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)',
          backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(0, 240, 255, 0.04)',
          borderWidth: '1px'
        };
      case 'section':
        return {
          borderColor: isSelected ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.05)',
          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
          borderLeft: `2px solid ${isSelected ? 'var(--primary)' : 'rgba(0, 240, 255, 0.2)'}`
        };
      case 'inset':
        return {
          borderColor: isSelected ? 'var(--primary)' : 'rgba(0, 0, 0, 0.4)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)'
        };
      case 'panel':
        return {
          borderColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.025)',
        };
      case 'minimal':
        return {
          borderColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          backgroundColor: 'transparent',
        };
      default:
        return {
          borderColor: isSelected ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)',
          backgroundColor: isSelected ? 'rgba(0, 240, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)',
        };
    }
  };

  const cw = resolveWidth(c.size.w);
  const ch = isCollapsed ? 30 : (c.size.h * 1.5);
  const cx = c.pos.x * 1.5;
  const cy = c.pos.y * 1.5;
  const styles = getVariantStyles(c.variant, isSelected);
  
  const containerIssues = React.useMemo(() => 
    audit?.issues?.filter((i: any) => i.path.includes(c.id) || i.message.includes(`'${c.id}'`)) || [],
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
        ...styles,
        backgroundColor: isLiveMode ? 'transparent' : styles.backgroundColor,
        borderColor: isLiveMode && !isSelected ? 'rgba(255,255,255,0.1)' : styles.borderColor,
      }}
      className={`absolute rounded-xs pointer-events-none transition-all duration-500 container-${skin} ${isSelected ? 'z-[5]' : 'z-0'} ${hasIntegrityError ? 'border-red-500/50' : ''}`}
      style={{ 
        left: cx, 
        top: cy, 
        width: cw, 
        height: ch,
        borderStyle: 'solid',
        borderWidth: styles.borderWidth || '1px',
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

        <div 
          onClick={(e) => { e.stopPropagation(); onToggleCollapse?.(); }}
          className={`absolute px-1.5 py-0.5 border rounded-full text-[6px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-500 z-[10] flex items-center gap-1.5 cursor-pointer pointer-events-auto
          ${isSelected ? 'bg-primary border-primary text-black' : (hasIntegrityError ? 'bg-red-600 border-red-500 text-white' : 'bg-black/80 border-white/20 text-white/60')}
          ${c.labelPosition === 'bottom' ? '-bottom-3 left-2' : 
            c.labelPosition === 'inside-top' ? 'top-2 left-2' :
            c.labelPosition === 'inside-bottom' ? 'bottom-2 left-2' :
            '-top-3 left-2'}
        `}>
          {hasIntegrityError ? '⚠️ INTEGRITY_LEAK' : c.label}
          {!isLiveMode && (
            <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
          )}
        </div>
    </motion.div>
  );
};

export const RackContainer = React.memo(RackContainerBase, (prev, next) => {
  return (
    prev.container.id === next.container.id &&
    prev.container.collapsed === next.container.collapsed &&
    prev.isSelected === next.isSelected &&
    prev.skin === next.skin &&
    prev.isLiveMode === next.isLiveMode &&
    prev.activeContainers[prev.container.id] === next.activeContainers[next.container.id] &&
    prev.audit.issues.length === next.audit.issues.length
  );
});
