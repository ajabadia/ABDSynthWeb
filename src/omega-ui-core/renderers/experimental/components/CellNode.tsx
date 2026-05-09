'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OmegaNode, OMEGA_Manifest, CellTemplate, ManifestEntity } from '../../../types/manifest';
import { CellRenderer } from '../../CellRenderer';
import { useUCADrag } from '../hooks/useUCADrag';
import { UCADebugHUD } from './UCADebugHUD';
import { CADOverlay } from './CADOverlay';
import { GovernedOverlay } from './GovernedOverlay';
import { UniversalRenderer } from '../UniversalRenderer';
import { UCADebugContext } from '../ucaTypes';

interface CellNodeProps {
  node: OmegaNode;
  manifest: OMEGA_Manifest;
  depth: number;
  catalog: Record<string, CellTemplate>;
  resolveAsset?: (id: string | undefined) => string | undefined;
  debugContext?: UCADebugContext;
  worldPos: { x: number, y: number };
  isLayoutGoverned: boolean;
  parentNode?: OmegaNode | null;
  handleDebugClick: (e: React.MouseEvent) => void;
}

export function CellNode({
  node,
  manifest,
  depth,
  catalog,
  resolveAsset,
  debugContext,
  worldPos,
  isLayoutGoverned,
  parentNode,
  handleDebugClick
}: CellNodeProps) {
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const localLabelRef = React.useRef<HTMLSpanElement>(null);

  const { dragOffset, targetIndex, handleDrag, handleDragEnd } = useUCADrag({
    node,
    manifest,
    debugContext,
    worldPos,
    labelRef,
    localLabelRef,
    isLayoutGoverned,
    parentNode
  });

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
      className="uca-node uca-cell group"
      onClick={handleDebugClick}
      drag={debugContext?.enabled}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
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
      <UCADebugHUD 
        node={node} 
        debugContext={debugContext || { enabled: false, showLabels: false, onSelect: () => {}, selectedId: null, hideDecorative: false }} 
        worldPos={worldPos}
        labelRef={labelRef}
        localLabelRef={localLabelRef}
      />

      <GovernedOverlay enabled={!!isLayoutGoverned} />

      {(dragOffset || debugContext?.showCADOverlay) && debugContext?.enabled && (
          <CADOverlay 
            node={node} 
            manifest={manifest} 
            dragOffset={dragOffset} 
            parent={parentNode || undefined} 
            targetIndex={targetIndex}
          />
      )}

      <div 
        className="absolute inset-0 pointer-events-none"
        dangerouslySetInnerHTML={{ __html: cellHTML }}
      />
      
      {node.children?.map(child => (
        <UniversalRenderer 
          key={child.id} 
          node={child} 
          manifest={manifest}
          depth={depth + 1} 
          debugContext={debugContext}
          catalog={catalog}
          resolveAsset={resolveAsset}
          parentWorldPos={worldPos}
          parentNode={node}
        />
      ))}
    </motion.div>
  );
}
