'use client';

import React from 'react';
import { OmegaNode, OMEGA_Manifest, GridConfig } from '@/omega-ui-core/types/manifest';
import { getParentRect, getNodeSize, snapToGrid, clampChildToParent } from '../../uca/spatialConstraints';

interface CADOverlayProps {
  node: OmegaNode;
  manifest: OMEGA_Manifest;
  dragOffset: { x: number, y: number } | null;
  parent?: OmegaNode;
  targetIndex?: number | null;
}

/**
 * CADOverlay (Phase 4.3.2)
 * High-precision spatial visualization for design and debugging.
 */
export function CADOverlay({ 
  node, 
  manifest, 
  dragOffset, 
  parent,
  targetIndex
}: CADOverlayProps) {
  if (!parent || !node.layout) return null;

  const parentRect = getParentRect(parent, manifest);
  const size = getNodeSize(node);
  const rawX = (node.layout.pos?.x || 0) + (dragOffset?.x || 0);
  const rawY = (node.layout.pos?.y || 0) + (dragOffset?.y || 0);
  
  const gridConfig = manifest.ui.layout?.grid as GridConfig | undefined;
  const snappedPos = gridConfig?.enabled ? snapToGrid({ x: rawX, y: rawY }, gridConfig) : { x: rawX, y: rawY };

  const clamped = clampChildToParent(
    { x: snappedPos.x, y: snappedPos.y, w: size.w, h: size.h },
    parentRect,
    node.constraints?.margin || 0
  );

  const isClamped = clamped.x !== snappedPos.x || clamped.y !== snappedPos.y;
  const isSnapped = snappedPos.x !== rawX || snappedPos.y !== rawY;

  return (
    <div className="absolute top-0 left-0 pointer-events-none z-[100]" style={{ width: parentRect.w, height: parentRect.h }}>
      {/* Grid Visualization */}
      {gridConfig?.enabled && (
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: `${gridConfig.spacingX}px ${gridConfig.spacingY}px`
          }} 
        />
      )}

      {/* Parent Bounding Box */}
      <div 
        className="absolute border border-dashed border-blue-500/50 bg-blue-500/5"
        style={{ left: 0, top: 0, width: parentRect.w, height: parentRect.h }}
      >
        <span className="absolute -top-3 left-0 text-[5px] font-black uppercase text-blue-400 bg-black/80 px-1 rounded-xs">
          Parent: {parent.id} ({parentRect.w}x{parentRect.h})
        </span>
      </div>

      {/* Proposed Box (Ghost) */}
      {dragOffset && (isClamped || isSnapped) && (
        <div 
          className="absolute border border-dashed border-red-500/40"
          style={{ left: rawX, top: rawY, width: size.w, height: size.h }}
        >
          <span className="absolute -top-2 left-0 text-[4px] font-bold uppercase text-red-400">Proposed</span>
        </div>
      )}

      {/* Reorder Slot Indicator (Phase 4.4.3) */}
      {targetIndex !== null && targetIndex !== undefined && parent.children && (
        (() => {
          const mode = parent.layout?.mode || 'absolute';
          if (mode === 'absolute') return null;

          const axis = mode === 'stack-v' ? 'y' : 'x';
          const otherSiblings = parent.children.filter(s => s.id !== node.id);
          
          let slotPos = 0;
          if (targetIndex < otherSiblings.length) {
            const targetSibling = otherSiblings[targetIndex];
            slotPos = targetSibling.layout?.pos?.[axis] || 0;
          } else if (otherSiblings.length > 0) {
            const lastSibling = otherSiblings[otherSiblings.length - 1];
            slotPos = (lastSibling.layout?.pos?.[axis] || 0) + (mode === 'stack-v' ? (lastSibling.layout?.size?.height || 48) : (lastSibling.layout?.size?.width || 48)) + (parent.layout?.gap || 0);
          } else {
            slotPos = parent.layout?.padding || 0;
          }

          return (
            <div 
              className="absolute bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] z-[110] animate-pulse"
              style={{
                left: mode === 'stack-h' ? `${slotPos}px` : '0',
                top: mode === 'stack-v' ? `${slotPos}px` : '0',
                width: mode === 'stack-h' ? '2px' : '100%',
                height: mode === 'stack-v' ? '2px' : '100%',
                transform: mode === 'stack-h' ? 'translateX(-50%)' : 'translateY(-50%)'
              }}
            >
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[5px] font-black uppercase px-1 rounded-xs whitespace-nowrap">
                  Insert at {targetIndex}
               </div>
            </div>
          );
        })()
      )}

      {/* Clamped / Final Box */}
      <div 
        className={`absolute border-1 ${isClamped ? 'border-emerald-400' : isSnapped ? 'border-amber-400' : 'border-white/20'} ${dragOffset ? 'bg-emerald-500/10' : ''}`}
        style={{ left: clamped.x, top: clamped.y, width: size.w, height: size.h }}
      >
        <span className="absolute -bottom-3 left-0 text-[5px] font-mono font-bold text-white bg-black/80 px-1 rounded-xs">
          {Math.round(clamped.x)},{Math.round(clamped.y)} [{size.w}x{size.h}]
        </span>
      </div>
    </div>
  );
}
