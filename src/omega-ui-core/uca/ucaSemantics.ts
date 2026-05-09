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
  // 1. EXPAND TEMPLATE
  let templateBase: Partial<OmegaNode> = {};
  if (node.kind === 'cell' && node.cellRef) {
    const template = ctx.catalog[node.cellRef];
    if (template) {
      // Deep clone to prevent mutating the catalog
      templateBase = JSON.parse(JSON.stringify(template.baseNode));
    }
  }

  // 2. MERGE INSTANCE OVERRIDES
  const resolved: OmegaNode = {
    ...templateBase,
    ...node,
    layout: {
      ...templateBase.layout,
      ...node.layout,
      // Ensure position is at least 0,0 if not provided
      pos: node.layout?.pos || templateBase.layout?.pos || { x: 0, y: 0 }
    },
    style: {
      ...templateBase.style,
      ...node.style
    },
    children: [
      ...(templateBase.children || []),
      ...(node.children || [])
    ]
  };

  // 3. APPLY INHERITED STYLE/TOKENS (Era 7.2.3 Genetic Propagation)
  if (ctx.parentStyle) {
    resolved.style = {
      font: resolved.style?.font || ctx.parentStyle.font,
      fontColor: resolved.style?.fontColor || ctx.parentStyle.fontColor,
      // Color tokens don't usually inherit unless they are generic
      ...resolved.style
    };
  }

  // 4. RESOLVE LAYOUT/FRAME
  // If the instance didn't provide a size but the template did, ensure it's kept
  if (resolved.layout && !resolved.layout.size && templateBase.layout?.size) {
    resolved.layout.size = { ...templateBase.layout.size };
  }

  // 5. COMPUTE RENDERABLE CHILDREN (Recursive Resolution)
  if (resolved.children && resolved.children.length > 0) {
    resolved.children = resolved.children.map((child, index) => {
      const childCtx = {
        ...ctx,
        parentStyle: resolved.style
      };
      
      const resolvedChild = resolveNodeSemantics(child, childCtx);
      
      // Prevent ID collisions for nested template children
      // If the child doesn't have an ID or comes from a generic template
      if (!child.id) {
        resolvedChild.id = `${resolved.id}_child_${index}`;
      } else if (templateBase.children?.some(tc => tc.id === child.id)) {
        resolvedChild.id = `${resolved.id}_${child.id}`;
      }

      return resolvedChild;
    });
  }

  // 6. DISPATCH PRIMITIVE/COMPOUND
  return resolved;
}
