'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OmegaNode, OMEGA_Manifest, CellTemplate } from '@/omega-ui-core/types/manifest';
import { useUCADrag } from '../hooks/useUCADrag';
import { UCADebugHUD } from './UCADebugHUD';
import { CADOverlay } from './CADOverlay';
import { GovernedOverlay } from './GovernedOverlay';
import { UniversalRenderer } from '../UniversalRenderer';
import { UCADebugContext } from '../ucaTypes';

interface StructuralNodeProps {
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

export function StructuralNode({
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
}: StructuralNodeProps) {
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

  return (
    <motion.div 
      id={`uca-${node.id}`}
      className={`uca-node uca-${node.kind} group`}
      onClick={handleDebugClick}
      drag={debugContext?.enabled && node.kind !== 'rack'}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
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
