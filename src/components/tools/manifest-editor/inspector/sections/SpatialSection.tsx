'use client';
 
import React from 'react';
import { Move, Grid3X3, Layout, Info } from 'lucide-react';
import { ManifestEntity, LayoutContainer, OmegaNode } from '@/types/manifest';
import { getInspectorModel, buildInspectorPatch } from '@/hooks/manifest-editor/entities/ucaInspectorModel';
import { calculateWorldPosition } from '@/hooks/manifest-editor/entities/ucaInspectorAdapter';
import ContainerSelector from '../ContainerSelector';
import InspectorCollapsible from '../shared/InspectorCollapsible';
import InfoBlock from '../shared/InfoBlock';
 
import { getElementDefinition } from '@/omega-ui-core/governance/ElementCatalog';
 
interface SpatialSectionProps {
  item: ManifestEntity | OmegaNode;
  onUpdate: (updates: Partial<ManifestEntity> | Partial<OmegaNode>) => void;
  onHelp?: (sectionId?: string) => void;
  highlightPath?: string | null;
  containers?: LayoutContainer[];
  rootTree?: OmegaNode;
}
 
export default function SpatialSection({ item, onUpdate, onHelp, highlightPath, containers = [], rootTree }: SpatialSectionProps) {
  const model = getInspectorModel(item, rootTree);
  
  const componentType = model.component || 'knob';
  const elementDef = getElementDefinition(componentType);
  const pos = model.pos || { x: 0, y: 0 };
  const colSpan = model.colSpan || 1;
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  const [localX, setLocalX] = React.useState<string>(pos.x.toString());
  const [localY, setLocalY] = React.useState<string>(pos.y.toString());
  const isFocused = React.useRef<string | null>(null);

  const worldPos = rootTree ? calculateWorldPosition(rootTree, item.id) : pos;

  // Sync local state when external item changes (selection change or drag end)
  React.useEffect(() => {
    if (isFocused.current !== 'x') setLocalX(Math.round(pos.x).toString());
    if (isFocused.current !== 'y') setLocalY(Math.round(pos.y).toString());
  }, [item.id, pos.x, pos.y]);

  const handleCommit = (axis: 'x' | 'y', val: string) => {
    const numeric = parseFloat(val);
    if (!isNaN(numeric)) {
      onUpdate(buildInspectorPatch(item, { pos: { ...pos, [axis]: numeric } }));
    }
  };

  const isUCA = 'kind' in item;
  const isRack = isUCA && (item as OmegaNode).kind === 'rack';
  const canMove = (isUCA && !isRack) || !elementDef || elementDef.capabilities.includes('position');
  const canScale = (isUCA && !isRack) || !elementDef || elementDef.capabilities.includes('size');
 
  return (
    <div className="space-y-4 pt-2">
      <ContainerSelector 
        item={item} 
        onUpdate={onUpdate} 
        containers={containers} 
        onHelp={onHelp} 
        highlightPath={highlightPath} 
        rootTree={rootTree}
      />

      {/* COORDINATES */}
      {canMove && (
        <InspectorCollapsible 
          title="Local Offset (Parent Relative)" 
          icon={Move}
          onHelp={() => onHelp?.('spatial')}
        >
          <div className="space-y-4 pt-2">
            {/* World Position Indicator */}
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-xs border border-dashed border-white/10 opacity-60">
               <span className="text-[6px] font-black uppercase text-foreground/40">World (Absolute):</span>
               <span className="text-[7px] font-mono font-bold">X: {worldPos?.x || 0}, Y: {worldPos?.y || 0}</span>
               <span className="text-[6px] font-bold text-accent italic ml-auto">UCA-Rel [{Math.round(pos?.x || 0)}, {Math.round(pos?.y || 0)}]</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[8px] uppercase font-bold tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('pos') ? 'text-amber-500' : 'text-foreground/60'}`}>
                  <span>Axis X (Horizontal)</span>
                </label>
                <input 
                  type="text" 
                  value={localX} 
                  onFocus={() => { isFocused.current = 'x'; }}
                  onBlur={() => { isFocused.current = null; handleCommit('x', localX); }}
                  onChange={(e) => setLocalX(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCommit('x', localX); }}
                  className={`w-full bg-black/40 border ${isHighlighted('pos') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'border-outline'} rounded-sm p-2 text-[11px] font-mono text-foreground outline-none focus:border-primary/40 transition-all transition-colors duration-500`}
                />
              </div>
              <div className="space-y-1.5">
                <label className={`text-[8px] uppercase font-bold tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('pos') ? 'text-amber-500' : 'text-foreground/60'}`}>
                  <span>Axis Y (Vertical)</span>
                </label>
                <input 
                  type="text" 
                  value={localY} 
                  onFocus={() => { isFocused.current = 'y'; }}
                  onBlur={() => { isFocused.current = null; handleCommit('y', localY); }}
                  onChange={(e) => setLocalY(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCommit('y', localY); }}
                  className={`w-full bg-black/40 border ${isHighlighted('pos') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'border-outline'} rounded-sm p-2 text-[11px] font-mono text-foreground outline-none focus:border-primary/40 transition-all transition-colors duration-500`}
                />
              </div>
            </div>
          </div>
        </InspectorCollapsible>
      )}

      {/* GRID LOGIC (Era 6 Compatibility) */}
      {canScale && (
        <InspectorCollapsible 
          title="Grid Dimensionality" 
          icon={Grid3X3}
          onHelp={() => onHelp?.('dimensiones')}
        >
          <div className="space-y-1.5 pt-2">
            <label className="text-[8px] text-foreground/60 uppercase font-bold tracking-tighter">
              Column Span (Rack Width)
            </label>
            <select 
              value={colSpan} 
              onChange={(e) => onUpdate(buildInspectorPatch(item, { colSpan: parseInt(e.target.value) }))}
              className="w-full bg-black/40 border border-outline rounded-sm p-2 text-[10px] font-bold text-foreground outline-none transition-colors duration-500 [color-scheme:dark]"
            >
              <option value={1}>1 Column (Standard)</option>
              <option value={2}>2 Columns (Wide)</option>
              <option value={3}>3 Columns (Full Width)</option>
            </select>
          </div>
        </InspectorCollapsible>
      )}

      {/* NO SPATIAL GOVERNANCE WARNING */}
      {!canMove && !canScale && (
        <div className="p-4 bg-white/5 border border-dashed wb-outline rounded-xs flex items-center gap-3 opacity-40">
           <Layout className="w-5 h-5" />
           <p className="text-[7px] wb-text-muted font-bold uppercase leading-tight italic">
              Spatial governance is locked for this element. Its position and size are managed by the internal rack engine.
           </p>
        </div>
      )}

      <InfoBlock 
        title="Industrial Note"
        icon={Info}
        message="Era 7.2 enforces strict architectural framing. Use containers to define columns and sections for studio parity."
        variant="primary"
        className="mt-6"
      />
    </div>
  );
}
