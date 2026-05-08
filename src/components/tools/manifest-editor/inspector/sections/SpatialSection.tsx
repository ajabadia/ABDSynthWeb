'use client';
 
import React from 'react';
import { Move, Grid3X3, Layout, Info } from 'lucide-react';
import { ManifestEntity, LayoutContainer } from '@/types/manifest';
import ContainerSelector from '../ContainerSelector';
import InspectorCollapsible from '../shared/InspectorCollapsible';
import InfoBlock from '../shared/InfoBlock';
 
import { getElementDefinition } from '@/omega-ui-core/governance/ElementCatalog';
 
interface SpatialSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  highlightPath?: string | null;
  containers?: LayoutContainer[];
}
 
export default function SpatialSection({ item, onUpdate, onHelp, highlightPath, containers = [] }: SpatialSectionProps) {
  const componentType = item.presentation?.component || 'knob';
  const elementDef = getElementDefinition(componentType);
  const pos = item.pos || { x: 0, y: 0 };
  const pres = item.presentation || {};
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  const canMove = !elementDef || elementDef.capabilities.includes('position');
  const canScale = !elementDef || elementDef.capabilities.includes('size');
 
  return (
    <div className="space-y-4 pt-2">
      <ContainerSelector 
        item={item} 
        onUpdate={onUpdate} 
        containers={containers} 
        onHelp={onHelp} 
        highlightPath={highlightPath} 
      />

      {/* COORDINATES */}
      {canMove && (
        <InspectorCollapsible 
          title="Absolute Coordinates" 
          icon={Move}
          onHelp={() => onHelp?.('spatial')}
        >
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className={`text-[8px] uppercase font-bold tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('pos') ? 'text-amber-500' : 'text-foreground/60'}`}>
                <span>Axis X (Horizontal)</span>
              </label>
              <input 
                type="number" 
                value={pos.x || 0} 
                onChange={(e) => onUpdate({ pos: { ...pos, x: parseFloat(e.target.value) } })}
                className={`w-full bg-black/40 border ${isHighlighted('pos') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'border-outline'} rounded-sm p-2 text-[11px] font-mono text-foreground outline-none focus:border-primary/40 transition-all transition-colors duration-500`}
              />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[8px] uppercase font-bold tracking-tighter flex items-center gap-1 transition-colors ${isHighlighted('pos') ? 'text-amber-500' : 'text-foreground/60'}`}>
                <span>Axis Y (Vertical)</span>
              </label>
              <input 
                type="number" 
                value={pos.y || 0} 
                onChange={(e) => onUpdate({ pos: { ...pos, y: parseFloat(e.target.value) } })}
                className={`w-full bg-black/40 border ${isHighlighted('pos') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : 'border-outline'} rounded-sm p-2 text-[11px] font-mono text-foreground outline-none focus:border-primary/40 transition-all transition-colors duration-500`}
              />
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
              value={pres.colSpan || 1} 
              onChange={(e) => onUpdate({ presentation: { ...pres, colSpan: parseInt(e.target.value) } })}
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
