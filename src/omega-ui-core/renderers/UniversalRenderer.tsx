'use client';

import React from 'react';
import { resolveNodeSemantics } from '../uca/ucaSemantics';
import { resolveLayout } from '../uca/layoutResolver';
import { StructuralNode } from './components/StructuralNode';
import { CellNode } from './components/CellNode';
import { UCADebugHUD } from './components/UCADebugHUD';
import { UniversalRendererProps } from './ucaTypes';

/**
 * UNIVERSAL RENDERER (Phase 1 Experimental - Refactored)
 * Recursive orchestrator for UCA hierarchies.
 */
export function UniversalRenderer({ 
  node: rawNode, 
  manifest, 
  depth = 0,
  catalog = {},
  resolveAsset,
  debugContext,
  parentWorldPos = { x: 0, y: 0 },
  parentNode = null
}: UniversalRendererProps) {
  
  // 1. Resolve semantics & Layout (Phase 4.4.1)
  const semanticNode = resolveNodeSemantics(rawNode, { catalog });
  const node = resolveLayout(semanticNode);

  const isLayoutGoverned = !!(parentNode?.layout?.mode && parentNode.layout.mode !== 'absolute');
  const worldX = parentWorldPos.x + (node.layout?.pos?.x || 0);
  const worldY = parentWorldPos.y + (node.layout?.pos?.y || 0);
  const worldPos = { x: worldX, y: worldY };

  if (node.visible === false) return null;
  if (debugContext?.enabled && debugContext.hideDecorative && node.role === 'decor') return null;

  const handleDebugClick = (e: React.MouseEvent) => {
    if (debugContext?.enabled) {
      e.stopPropagation();
      debugContext.onSelect(node.id);
    }
  };

  // 2. Dispatchers
  
  // A. Structural Nodes (Rack, Face, Container)
  if (node.kind === 'rack' || node.kind === 'face' || node.kind === 'container') {
    return (
      <StructuralNode 
        node={node}
        manifest={manifest}
        depth={depth}
        catalog={catalog}
        resolveAsset={resolveAsset}
        debugContext={debugContext}
        worldPos={worldPos}
        isLayoutGoverned={isLayoutGoverned}
        handleDebugClick={handleDebugClick}
      />
    );
  }

  // B. Atomic Cells
  if (node.kind === 'cell') {
    return (
      <CellNode 
        node={node}
        manifest={manifest}
        depth={depth}
        catalog={catalog}
        resolveAsset={resolveAsset}
        debugContext={debugContext}
        worldPos={worldPos}
        isLayoutGoverned={isLayoutGoverned}
        handleDebugClick={handleDebugClick}
      />
    );
  }

  // C. Layers (Simple rendering)
  if (node.kind === 'layer') {
    const isSelected = debugContext?.selectedId === node.id;
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
          outline: isSelected ? '1px solid white' : 'none'
        }}
      >
        <UCADebugHUD 
          node={node} 
          debugContext={debugContext || { enabled: false, showLabels: false, onSelect: () => {}, selectedId: null, hideDecorative: false }} 
          worldPos={worldPos}
        />
        {node.role === 'label' && <span>{node.id}</span>}
      </div>
    );
  }

  return null;
}
