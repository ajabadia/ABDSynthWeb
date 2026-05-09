import { OmegaNode, OMEGA_Manifest } from '../types/manifest';
 
/**
 * OMEGA ERA 7.2.3 - SPATIAL GOVERNANCE
 * Hierarchical Constraints & Bounding Box Logic
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridConfig {
  enabled: boolean;
  spacingX: number;
  spacingY: number;
}

/**
 * snapToGrid
 * Discretizes a position based on grid settings.
 */
export function snapToGrid(pos: { x: number; y: number }, config: GridConfig): { x: number; y: number } {
  if (!config.enabled) return pos;
  
  return {
    x: Math.round(pos.x / config.spacingX) * config.spacingX,
    y: Math.round(pos.y / config.spacingY) * config.spacingY,
  };
}

/**
 * clampChildToParent
 * Clamps a child rectangle so it remains entirely within the parent rectangle.
 * Coordinates are local to the parent.
 */
export function clampChildToParent(child: Rect, parent: Rect, margin = 0): { x: number; y: number } {
  // Calculate valid range for child position
  const minX = margin;
  const maxX = parent.w - margin - child.w;
  const minY = margin;
  const maxY = parent.h - margin - child.h;

  // Clamp position
  return {
    x: Math.min(Math.max(child.x, minX), maxX),
    y: Math.min(Math.max(child.y, minY), maxY),
  };
}

/**
 * getParentRect
 * Resolves the bounding box of a parent node in its own local coordinate system.
 */
export function getParentRect(parent: OmegaNode, manifest: OMEGA_Manifest): Rect {
  if (parent.kind === 'rack') {
    return {
      x: 0,
      y: 0,
      w: manifest.ui?.dimensions?.width || 1200,
      h: manifest.ui?.dimensions?.height || 800
    };
  }

  // For containers and other structural nodes, use their resolved size
  return {
    x: 0,
    y: 0,
    w: parent.layout?.size?.width || 400, // Fallback to safe defaults
    h: parent.layout?.size?.height || 300
  };
}

/**
 * getNodeSize
 * Resolves the size of a node, with fallbacks for cells.
 */
export function getNodeSize(node: OmegaNode): { w: number; h: number } {
  return {
    w: node.layout?.size?.width || 48,
    h: node.layout?.size?.height || 48
  };
}
