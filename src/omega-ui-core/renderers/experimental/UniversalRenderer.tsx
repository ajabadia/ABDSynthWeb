'use client';

import React from 'react';
import { OmegaNode, OMEGA_Manifest } from '../../types/manifest';
import { CellRenderer } from '../CellRenderer';
import { resolveNodeSemantics } from '../../uca/ucaSemantics';

interface UniversalRendererProps {
  node: OmegaNode;
  manifest: OMEGA_Manifest;
  depth?: number;
  catalog?: any; 
  resolveAsset?: (id: string | undefined) => string | undefined;
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
  resolveAsset 
}: UniversalRendererProps) {
  // Resolve semantics (Template expansion + style inheritance)
  const node = resolveNodeSemantics(rawNode, { catalog });

  if (node.visible === false) return null;

  // 1. Dispatch Structural Nodes
  if (node.kind === 'rack' || node.kind === 'face' || node.kind === 'container') {
    return (
      <div 
        id={`uca-${node.id}`}
        className={`uca-node uca-${node.kind}`}
        style={{
          position: 'absolute',
          left: `${node.layout?.pos.x}px`,
          top: `${node.layout?.pos.y}px`,
          width: node.layout?.size?.width ? `${node.layout.size.width}px` : 'auto',
          height: node.layout?.size?.height ? `${node.layout.size.height}px` : 'auto',
          zIndex: node.layout?.zIndex || 0,
          pointerEvents: node.locked ? 'none' : 'auto'
        }}
      >
        {/* RECURSE: Render children within this coordinate space */}
        {node.children?.map(child => (
          <UniversalRenderer 
            key={child.id} 
            node={child} 
            manifest={manifest} 
            depth={depth + 1} 
            catalog={catalog}
            resolveAsset={resolveAsset}
          />
        ))}
      </div>
    );
  }

  // 2. Dispatch Atomic Cells
  if (node.kind === 'cell') {
    // Map OmegaNode back to a temporary ManifestEntity for CellRenderer parity
    const phantomEntity = {
      id: node.id,
      type: node.cellRef as any,
      pos: node.layout?.pos || { x: 0, y: 0 },
      size: node.layout?.size,
      role: node.role as any,
      bind: node.bind,
      presentation: {
        style: node.style
      }
    };

    const cellHTML = CellRenderer.renderCellHTML(phantomEntity as any, {
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
        style={{
          position: 'absolute',
          left: `${node.layout?.pos.x}px`,
          top: `${node.layout?.pos.y}px`,
          zIndex: node.layout?.zIndex || 0
        }}
      >
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
        style={{
          position: 'absolute',
          left: `${node.layout?.pos.x}px`,
          top: `${node.layout?.pos.y}px`,
          color: node.style?.color,
          fontSize: node.style?.fontSize,
          opacity: node.style?.opacity
        }}
      >
        {node.role === 'label' && <span>{node.id}</span>}
      </div>
    );
  }

  return null;
}
