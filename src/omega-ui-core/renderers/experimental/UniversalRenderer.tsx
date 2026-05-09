'use client';

import React from 'react';
import { OmegaNode, OMEGA_Manifest, CellTemplate, ManifestEntity } from '../../types/manifest';
import { CellRenderer } from '../CellRenderer';
import { resolveNodeSemantics } from '../../uca/ucaSemantics';

export interface UCADebugContext {
  enabled: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
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
  debugContext 
}: UniversalRendererProps) {
  // Resolve semantics (Template expansion + style inheritance)
  const node = resolveNodeSemantics(rawNode, { catalog });

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

  const renderDebugLabel = () => {
    if (!debugContext?.enabled || !debugContext.showLabels) return null;
    const colors: Record<string, string> = {
      rack: 'rgb(147, 51, 234)',
      face: 'rgb(59, 130, 246)',
      container: 'rgb(16, 185, 129)',
      cell: 'rgb(245, 158, 11)',
      layer: 'rgb(239, 68, 68)'
    };
    const color = colors[node.kind] || '#fff';
    
    return (
      <div 
        className="absolute top-0 left-0 text-[9px] font-mono px-1 text-white z-50 pointer-events-none whitespace-nowrap"
        style={{ 
          backgroundColor: color,
          transform: 'translateY(-100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {node.kind}:{node.id} [d:{depth}]
      </div>
    );
  };

  // 1. Dispatch Structural Nodes
  if (node.kind === 'rack' || node.kind === 'face' || node.kind === 'container') {
    return (
      <div 
        id={`uca-${node.id}`}
        className={`uca-node uca-${node.kind}`}
        onClick={handleDebugClick}
        style={{
          position: 'absolute',
          left: `${node.layout?.pos.x}px`,
          top: `${node.layout?.pos.y}px`,
          width: node.layout?.size?.width ? `${node.layout.size.width}px` : 'auto',
          height: node.layout?.size?.height ? `${node.layout.size.height}px` : 'auto',
          zIndex: node.layout?.zIndex || 0,
          pointerEvents: (node.locked && !debugContext?.enabled) ? 'none' : 'auto',
          ...debugStyle
        }}
      >
        {renderDebugLabel()}
        {/* RECURSE: Render children within this coordinate space */}
        {node.children?.map(child => (
          <UniversalRenderer 
            key={child.id} 
            node={child} 
            manifest={manifest} 
            depth={depth + 1} 
            catalog={catalog}
            resolveAsset={resolveAsset}
            debugContext={debugContext}
          />
        ))}
      </div>
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
        component: 'knob', // Default, will be overridden by type resolution in CellRenderer
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
      <div 
        className="uca-node uca-cell"
        onClick={handleDebugClick}
        style={{
          position: 'absolute',
          left: `${node.layout?.pos.x}px`,
          top: `${node.layout?.pos.y}px`,
          zIndex: node.layout?.zIndex || 0,
          pointerEvents: debugContext?.enabled ? 'auto' : 'none',
          ...debugStyle
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
            catalog={catalog}
            resolveAsset={resolveAsset}
            debugContext={debugContext}
          />
        ))}
      </div>
    );
  }

  // 3. Dispatch Layers
  if (node.kind === 'layer') {
    // Simple layer rendering (labels, masks, etc.)
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
