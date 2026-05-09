import { OmegaNode, CellTemplate, OmegaStyleNode } from '../types/manifest';

/**
 * UCA SEMANTICS (Phase 1)
 * Rules for node resolution, template expansion, and style inheritance.
 */

export interface ResolutionContext {
  catalog: Record<string, CellTemplate>;
  parentStyle?: OmegaStyleNode;
}

/**
 * resolveNodeSemantics
 * Expands a node based on its template and applies the inheritance chain.
 */
export function resolveNodeSemantics(
  node: OmegaNode, 
  ctx: ResolutionContext
): OmegaNode {
  let resolved: OmegaNode = { ...node };

  // 1. TEMPLATE EXPANSION
  if (node.kind === 'cell' && node.cellRef) {
    const template = ctx.catalog[node.cellRef];
    if (template) {
      // Merge: Template Base -> Instance Overrides
      resolved = {
        ...template.baseNode,
        ...node,
        // Ensure children are merged (Template layers + Instance children)
        children: [
          ...(template.baseNode.children || []),
          ...(node.children || [])
        ],
        // Merge styles
        style: {
          ...template.baseNode.style,
          ...node.style
        }
      };
    }
  }

  // 2. STYLE INHERITANCE (Era 7.2.3 Genetic Propagation)
  if (ctx.parentStyle) {
    resolved.style = {
      font: resolved.style?.font || ctx.parentStyle.font,
      fontColor: resolved.style?.fontColor || ctx.parentStyle.fontColor,
      // Color tokens don't usually inherit unless they are generic
      ...resolved.style
    };
  }

  // 3. RECURSIVE RESOLUTION
  if (resolved.children) {
    resolved.children = resolved.children.map(child => 
      resolveNodeSemantics(child, {
        ...ctx,
        parentStyle: resolved.style
      })
    );
  }

  return resolved;
}
