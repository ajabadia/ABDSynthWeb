import { useState } from 'react';
import { Plus, Layout, Trash2, Move, Box, Maximize2, Type, Layers, ChevronDown, ChevronRight, Minimize2, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutContainer, ContainerVariant, ContainerSizeUnit } from '@/types/manifest';

interface ContainerSectionProps {
  containers: LayoutContainer[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<LayoutContainer>) => void;
  onRemove: (id: string) => void;
}

export default function ContainerSection({
  containers,
  onAdd,
  onUpdate,
  onRemove
}: ContainerSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  const variants: ContainerVariant[] = ['default', 'header', 'section', 'panel', 'inset', 'minimal'];
  const widthUnits: ContainerSizeUnit[] = ['full', '3/4', '2/3', '1/2', '1/3', '1/4'];

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-xs border border-outline/10 shadow-inner">
        <div className="flex items-center gap-3">
          <Layout className="w-4 h-4 text-primary/60" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Layout Architecture</span>
        </div>
        <button 
          onClick={onAdd}
          className="p-1.5 hover:bg-primary hover:text-black rounded-xs transition-all text-primary/60 flex items-center gap-2 group shadow-lg"
        >
          <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Build Container</span>
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {containers.map((container) => {
          const isExpanded = expandedIds[container.id] ?? true;
          
          return (
            <div key={container.id} className="bg-black/40 border border-outline/5 rounded-xs overflow-hidden group hover:border-outline/20 transition-all">
              {/* HEADER / TOGGLE */}
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleExpand(container.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xs transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-white/5 text-foreground/20'}`}>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <input 
                      type="text" 
                      value={container.label} 
                      onChange={(e) => { e.stopPropagation(); onUpdate(container.id, { label: e.target.value }); }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-[11px] font-bold text-foreground outline-none focus:text-primary transition-colors"
                    />
                    <span className="text-[7px] font-mono opacity-20 uppercase tracking-tighter">{container.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdate(container.id, { collapsed: !container.collapsed }); }}
                    className={`p-1.5 rounded-xs transition-all ${container.collapsed ? 'text-accent bg-accent/10' : 'text-foreground/20 hover:text-accent hover:bg-white/5'}`}
                    title={container.collapsed ? "Unfold in Rack" : "Fold in Rack"}
                  >
                    {container.collapsed ? <Maximize className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(container.id); }}
                    className="p-1.5 text-foreground/20 hover:text-red-400 hover:bg-red-500/5 rounded-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE BODY */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="p-4 pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/5">
                        {/* POSITION */}
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 opacity-40">
                             <Move className="w-2.5 h-2.5" />
                             <span className="text-[7px] font-black uppercase tracking-widest">Base Coordinates</span>
                           </div>
                           <div className="flex gap-2">
                              <div className="flex-1 flex items-center bg-black/40 border border-outline/10 rounded-xs px-2 py-1">
                                 <span className="text-[7px] font-bold opacity-30 w-4">X</span>
                                 <input 
                                   type="number" 
                                   value={container.pos.x} 
                                   onChange={(e) => onUpdate(container.id, { pos: { ...container.pos, x: parseInt(e.target.value) } })}
                                   className="bg-transparent text-[9px] font-mono text-primary w-full outline-none" 
                                 />
                              </div>
                              <div className="flex-1 flex items-center bg-black/40 border border-outline/10 rounded-xs px-2 py-1">
                                 <span className="text-[7px] font-bold opacity-30 w-4">Y</span>
                                 <input 
                                   type="number" 
                                   value={container.pos.y} 
                                   onChange={(e) => onUpdate(container.id, { pos: { ...container.pos, y: parseInt(e.target.value) } })}
                                   className="bg-transparent text-[9px] font-mono text-primary w-full outline-none" 
                                 />
                              </div>
                           </div>
                        </div>

                        {/* SIZE */}
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 opacity-40">
                             <Maximize2 className="w-2.5 h-2.5" />
                             <span className="text-[7px] font-black uppercase tracking-widest">Industrial Sizing</span>
                           </div>
                           <div className="flex gap-2">
                              <select 
                                value={typeof container.size.w === 'string' ? container.size.w : 'custom'} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  onUpdate(container.id, { size: { ...container.size, w: val === 'custom' ? 100 : val as any } });
                                }}
                                className="flex-1 bg-black/40 border border-outline/10 rounded-xs px-2 py-1 text-[9px] font-bold text-primary outline-none"
                              >
                                {widthUnits.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                                <option value="custom">PX</option>
                              </select>
                              <div className="flex-1 flex items-center bg-black/40 border border-outline/10 rounded-xs px-2 py-1">
                                 <span className="text-[7px] font-bold opacity-30 w-4">H</span>
                                 <input 
                                   type="number" 
                                   value={container.size.h} 
                                   onChange={(e) => onUpdate(container.id, { size: { ...container.size, h: parseInt(e.target.value) } })}
                                   className="bg-transparent text-[9px] font-mono text-primary w-full outline-none" 
                                 />
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         {/* VARIANT */}
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 opacity-40">
                              <Box className="w-2.5 h-2.5" />
                              <span className="text-[7px] font-black uppercase tracking-widest">Visual Variant</span>
                            </div>
                            <select 
                              value={container.variant} 
                              onChange={(e) => onUpdate(container.id, { variant: e.target.value as any })}
                              className="w-full bg-black/40 border border-outline/10 rounded-xs px-2 py-1 text-[9px] font-bold text-primary outline-none"
                            >
                              {variants.map(v => <option key={v} value={v}>{v.toUpperCase()}</option>)}
                            </select>
                         </div>

                         {/* LABEL POSITION */}
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 opacity-40">
                              <Type className="w-2.5 h-2.5" />
                              <span className="text-[7px] font-black uppercase tracking-widest">Label Anchor</span>
                            </div>
                            <select 
                              value={container.labelPosition || 'top'} 
                              onChange={(e) => onUpdate(container.id, { labelPosition: e.target.value as any })}
                              className="w-full bg-black/40 border border-outline/10 rounded-xs px-2 py-1 text-[9px] font-bold text-primary outline-none"
                            >
                              {['top', 'bottom', 'inside-top', 'inside-bottom'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                            </select>
                         </div>
                      </div>

                      {/* ERA 7.2.1 ARCHITECTURAL PLANE */}
                      <div className="pt-4 border-t border-outline/5 space-y-2">
                         <div className="flex items-center gap-2 opacity-40">
                           <Layers className="w-2.5 h-2.5 text-accent" />
                           <span className="text-[7px] font-black uppercase tracking-widest text-accent">Architectural Plane (Tab)</span>
                         </div>
                         <div className="flex flex-wrap gap-1">
                           {['GLOBAL', 'MAIN', 'FX', 'EDIT', 'MIDI', 'MOD', 'PATCHING'].map(t => (
                             <button
                               key={t}
                               onClick={() => onUpdate(container.id, { tab: t === 'GLOBAL' ? undefined : t as any })}
                               className={`px-2 py-1 text-[7px] font-black uppercase rounded-xs border transition-all ${
                                 (container.tab || 'GLOBAL') === t 
                                   ? 'bg-accent/20 border-accent text-accent' 
                                   : 'bg-black/40 border-outline/10 text-foreground/20 hover:border-outline/30'
                               }`}
                             >
                               {t}
                             </button>
                           ))}
                         </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {containers.length === 0 && (
          <div className="py-20 border border-dashed border-outline/10 rounded-xs flex flex-col items-center justify-center gap-4 opacity-20 grayscale hover:grayscale-0 transition-all">
             <Layout className="w-8 h-8 text-primary/40" />
             <div className="text-center space-y-1">
               <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Infrastructure</p>
               <p className="text-[7px] font-medium uppercase tracking-widest text-foreground/60">Build containers to frame your components</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
