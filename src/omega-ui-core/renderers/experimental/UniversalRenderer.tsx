'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OmegaNode, OMEGA_Manifest, CellTemplate, ManifestEntity } from '../../types/manifest';
import { CellRenderer } from '../CellRenderer';
import { resolveNodeSemantics } from '../../uca/ucaSemantics';

export interface UCADebugContext {
  enabled: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateNode?: (id: string, updates: Partial<OmegaNode>) => void;
  showLabels: boolean;
  hideDecorative: boolean;
}

interface UniversalRendererProps {
  node: OmegaNode;
  manifest: OMEGA_Manifest;
  depth?: number;
  catalog?: Record<string, CellTemplate>; 
  resolveAsset?: (id: string | undefined) => string | undefined;
  debugContext?: UCADebugContext;
  parentWorldPos?: { x: number, y: number };
}

/**
 * UNIVERSAL RENDERER (Phase 1 Experimental)
 * Recursive engine for UCA hierarchies.
 */
export function UniversalRenderer({ 
  node: rawNode, 
  manifest, 
  depth = 0,
  catalog = {},
  resolveAsset,
  debugContext,
  parentWorldPos = { x: 0, y: 0 }
}: UniversalRendererProps) {
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const localLabelRef = React.useRef<HTMLSpanElement>(null);
  
  // Resolve semantics (Template expansion + style inheritance)
  const node = resolveNodeSemantics(rawNode, { catalog });

  // Absolute coordinate calculation (Base) - Verified Era 7.2.3
  const worldX = parentWorldPos.x + (node.layout?.pos?.x || 0);
  const worldY = parentWorldPos.y + (node.layout?.pos?.y || 0);

  if (node.visible === false) return null;

  // Debug mode filtering
  if (debugContext?.enabled && debugContext.hideDecorative && node.role === 'decor') {
    return null;
  }

  // Debug styles
  let debugStyle: React.CSSProperties = {};
  
  if (debugContext?.enabled) {
    const isSelected = debugContext.selectedId === node.id;
    const colors: Record<string, string> = {
      rack: 'rgba(147, 51, 234, 0.8)', // purple
      face: 'rgba(59, 130, 246, 0.8)', // blue
      container: 'rgba(16, 185, 129, 0.8)', // green
      cell: 'rgba(245, 158, 11, 0.8)', // orange
      layer: 'rgba(239, 68, 68, 0.8)' // red
    };
    const color = colors[node.kind] || 'white';
    
    debugStyle = {
      outline: isSelected ? `2px solid ${color}` : `1px dashed ${color}`,
      outlineOffset: '-1px',
      backgroundColor: isSelected ? color.replace('0.8', '0.2') : 'transparent',
      transition: 'all 0.2s ease',
      cursor: 'crosshair'
    };
  }

  const handleDebugClick = (e: React.MouseEvent) => {
    if (debugContext?.enabled) {
      e.stopPropagation();
      debugContext.onSelect(node.id);
    }
  };

  const updateHUD = (offset: { x: number, y: number }) => {
    if (labelRef.current) {
      const wx = Math.round(worldX + offset.x);
      const wy = Math.round(worldY + offset.y);
      labelRef.current.innerText = `W: ${wx}, ${wy}`;
    }
    if (localLabelRef.current) {
      const lx = Math.round((node.layout?.pos?.x || 0) + offset.x);
      const ly = Math.round((node.layout?.pos?.y || 0) + offset.y);
      localLabelRef.current.innerText = `L: ${lx}, ${ly}`;
    }
  };

  const renderDebugLabel = () => {
    if (!debugContext?.enabled || !debugContext.showLabels) return null;
    
    return (
      <div className="absolute -top-3 left-0 flex items-center gap-1 z-50 whitespace-nowrap pointer-events-none select-none">
        <div className={`px-1 py-0.5 rounded-xs text-[6px] font-black uppercase text-white shadow-lg ${node.kind === 'rack' ? 'bg-purple-600' : node.kind === 'face' ? 'bg-blue-600' : 'bg-amber-600'}`}>
          {node.kind}:{node.id} [<span ref={labelRef}>W: {Math.round(worldX)}, {Math.round(worldY)}</span>]
        </div>
        <div className="bg-emerald-600 px-1 py-0.5 rounded-xs text-[5px] font-bold text-white shadow-lg opacity-80">
          <span ref={localLabelRef}>L: {Math.round(node.layout?.pos?.x || 0)}, {Math.round(node.layout?.pos?.y || 0)}</span>
        </div>
      </div>
    );
  };

  // 1. Dispatch Structural Nodes
  if (node.kind === 'rack' || node.kind === 'face' || node.kind === 'container') {
    return (
      <motion.div 
        id={`uca-${node.id}`}
        className={`uca-node uca-${node.kind}`}
        onClick={handleDebugClick}
        drag={debugContext?.enabled && node.kind !== 'rack'}
        dragMomentum={false}
        onDrag={(_, info) => updateHUD(info.offset)}
        onDragEnd={(_, info) => {
          if (debugContext?.onUpdateNode) {
            const finalX = Math.round((node.layout?.pos?.x || 0) + info.offset.x);
            const finalY = Math.round((node.layout?.pos?.y || 0) + info.offset.y);
            debugContext.onUpdateNode(node.id, { 
              layout: { ...node.layout, pos: { x: finalX, y: finalY } } 
            });
          }
        }}
        style={{
          position: 'absolute',
          left: `${node.layout?.pos?.x || 0}px`,
          top: `${node.layout?.pos?.y || 0}px`,
          width: node.layout?.size?.width ? `${node.layout.size.width}px` : 'auto',
          height: node.layout?.size?.height ? `${node.layout.size.height}px` : 'auto',
          zIndex: node.layout?.zIndex || 0,
          border: debugContext?.enabled ? `1px dashed ${node.kind === 'rack' ? '#9333ea' : node.kind === 'face' ? '#3b82f6' : '#10b981'}` : 'none',
          padding: '2px',
          boxSizing: 'border-box'
        }}
      >
        {renderDebugLabel()}
        {node.children?.map(child => (
          <UniversalRenderer 
            key={child.id} 
            node={child} 
            manifest={manifest}
            depth={depth + 1} 
            debugContext={debugContext}
            catalog={catalog}
            resolveAsset={resolveAsset}
            parentWorldPos={{ x: worldX, y: worldY }}
          />
        ))}
      </motion.div>
    );
  }

  // 2. Dispatch Atomic Cells
  if (node.kind === 'cell') {
    // Map OmegaNode back to a temporary ManifestEntity for CellRenderer parity
    const phantomEntity: ManifestEntity = {
      id: node.id,
      type: node.cellRef || 'knob',
      pos: node.layout?.pos || { x: 0, y: 0 },
      role: node.role || 'control',
      bind: node.bind || 'none',
      presentation: {
        tab: 'MAIN',
        component: node.cellRef || 'knob', 
        variant: 'default',
        offsetX: 0,
        offsetY: 0,
        attachments: [],
        style: node.style
      }
    };

    const cellHTML = CellRenderer.renderCellHTML(phantomEntity, {
      skin: manifest.ui?.skin || 'industrial',
      zoom: 1.0,
      runtimeValue: 0, 
      steps: 100,
      manifest,
      resolveAsset
    });

    return (
      <motion.div 
        id={`uca-${node.id}`}
        className="uca-node uca-cell"
        onClick={handleDebugClick}
        drag={debugContext?.enabled}
        dragMomentum={false}
        onDrag={(_, info) => updateHUD(info.offset)}
        onDragEnd={(_, info) => {
          if (debugContext?.onUpdateNode) {
            const finalX = Math.round((node.layout?.pos?.x || 0) + info.offset.x);
            const finalY = Math.round((node.layout?.pos?.y || 0) + info.offset.y);
            debugContext.onUpdateNode(node.id, { 
              layout: { ...node.layout, pos: { x: finalX, y: finalY } } 
            });
          }
        }}
        style={{
          position: 'absolute',
          left: `${node.layout?.pos?.x || 0}px`,
          top: `${node.layout?.pos?.y || 0}px`,
          width: node.layout?.size?.width ? `${node.layout.size.width}px` : '48px', 
          height: node.layout?.size?.height ? `${node.layout.size.height}px` : '48px',
          zIndex: node.layout?.zIndex || 0,
          pointerEvents: debugContext?.enabled ? 'auto' : 'none'
        }}
      >
        {renderDebugLabel()}
        {/* Render legacy primitive HTML */}
        <div 
          className="absolute inset-0 pointer-events-none"
          dangerouslySetInnerHTML={{ __html: cellHTML }}
        />
        
        {/* Recursive Layers / Children of the Cell */}
        {node.children?.map(child => (
          <UniversalRenderer 
            key={child.id} 
            node={child} 
            manifest={manifest}
            depth={depth + 1} 
            debugContext={debugContext}
            catalog={catalog}
            resolveAsset={resolveAsset}
            parentWorldPos={{ x: worldX, y: worldY }}
          />
        ))}
      </motion.div>
    );
  }

  // 3. Dispatch Layers
  if (node.kind === 'layer') {
    return (
      <div 
        className="uca-node uca-layer"
        onClick={handleDebugClick}
        style={{
          position: 'absolute',
          left: `${node.layout?.pos.x}px`,
          top: `${node.layout?.pos.y}px`,
          color: node.style?.color,
          fontSize: node.style?.fontSize,
          opacity: node.style?.opacity,
          pointerEvents: debugContext?.enabled ? 'auto' : 'none',
          ...debugStyle
        }}
      >
        {renderDebugLabel()}
        {node.role === 'label' && <span>{node.id}</span>}
      </div>
    );
  }

  return null;
}
