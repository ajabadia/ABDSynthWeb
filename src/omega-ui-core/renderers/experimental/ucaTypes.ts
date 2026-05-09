'use client';

import { OmegaNode, OMEGA_Manifest, CellTemplate, Position } from '../../types/manifest';

export interface UCADebugContext {
  enabled: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateNode?: (id: string, updates: Partial<OmegaNode>) => void;
  showLabels: boolean;
  hideDecorative: boolean;
  showCADOverlay?: boolean;
}

export interface UniversalRendererProps {
  node: OmegaNode;
  manifest: OMEGA_Manifest;
  depth?: number;
  catalog?: Record<string, CellTemplate>; 
  resolveAsset?: (id: string | undefined) => string | undefined;
  debugContext?: UCADebugContext;
  parentWorldPos?: Position;
  parentNode?: OmegaNode | null;
}
