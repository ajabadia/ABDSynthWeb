'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

interface CellPreviewProps {
  item: any;
}

export default function CellPreview({ item }: CellPreviewProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const componentType = item.presentation?.component || 'knob';
  const attachments = item.presentation?.attachments || [];

  const renderCore = () => {
    switch (componentType) {
      case 'knob':
        return (
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 bg-black/40 shadow-[0_0_20px_rgba(0,240,255,0.1)]" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-lg relative">
               <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
            </div>
          </div>
        );
      case 'port':
      case 'jack':
        return (
          <div className="w-14 h-14 rounded-full border-4 border-outline/30 bg-black flex items-center justify-center shadow-inner relative">
             <div className="w-8 h-8 rounded-full border-2 border-outline/10 bg-white/5 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-black border border-white/20" />
             </div>
          </div>
        );
      case 'slider-v':
        return (
          <div className="w-8 h-24 bg-black/60 border border-outline/20 rounded-sm relative flex flex-col items-center p-1">
             <div className="w-px h-full bg-white/10 absolute left-1/2 -translate-x-1/2" />
             <div className="w-6 h-10 bg-primary/20 border border-primary/40 rounded-xs z-10 mt-6 shadow-[0_0_10px_rgba(0,240,255,0.2)] flex items-center justify-center">
                <div className="w-4 h-0.5 bg-primary/60" />
             </div>
          </div>
        );
      case 'led':
        return (
          <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]" />
        );
      case 'display':
        return (
          <div className="w-24 h-10 bg-black/80 border border-outline/30 rounded-xs flex items-center justify-center font-mono text-primary text-[10px] shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
             <span className="opacity-80">--.---</span>
          </div>
        );
      default:
        return <div className="w-12 h-12 border-2 border-dashed border-outline/20 rounded-full" />;
    }
  };

  const renderAttachment = (att: any) => {
    const offsetStyle = {
      marginTop: att.position === 'bottom' ? `${6 + (att.offset || 0)}px` : 0,
      marginBottom: att.position === 'top' ? `${6 + (att.offset || 0)}px` : 0,
      marginLeft: att.position === 'right' ? `${6 + (att.offset || 0)}px` : 0,
      marginRight: att.position === 'left' ? `${6 + (att.offset || 0)}px` : 0,
    };

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={offsetStyle}
        className="flex items-center justify-center whitespace-nowrap z-10"
      >
        {att.type === 'label' && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/80 bg-black/80 px-2 py-1 rounded-xs border border-outline/20 backdrop-blur-md shadow-2xl">
            {att.text || item.label || 'LABEL'}
          </span>
        )}
        {att.type === 'led' && (
          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(240,0,255,0.8)] border border-white/20" />
        )}
        {att.type === 'display' && (
          <div className="px-2 py-1 bg-black border border-outline/40 rounded-xs shadow-2xl flex items-center gap-1.5 min-w-[40px] justify-center">
             <span className="text-[8px] font-mono text-primary font-bold">0.00</span>
             {att.unit && <span className="text-[6px] text-foreground/40 font-black uppercase">{att.unit}</span>}
          </div>
        )}
      </motion.div>
    );
  };

  const topAtts = attachments.filter((a: any) => a.position === 'top');
  const bottomAtts = attachments.filter((a: any) => a.position === 'bottom');
  const leftAtts = attachments.filter((a: any) => a.position === 'left');
  const rightAtts = attachments.filter((a: any) => a.position === 'right');

  return (
    <div className="relative group">
      {/* COLLAPSE TOGGLE */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-2 right-2 z-50 p-1.5 rounded-xs bg-black/40 hover:bg-black/60 border wb-outline text-white/40 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        title={isCollapsed ? "Expand Preview" : "Collapse Preview"}
      >
        {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 240, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full bg-[#080808] border-b wb-outline flex items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.03),transparent)]"
          >
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            
            {/* CANONICAL FLEX CONTAINER (Mirroring the Rack's Column Layout) */}
            <div className="flex flex-col items-center justify-center relative min-w-[120px]">
              
              {/* TOP STACK */}
              <div className="flex flex-col items-center justify-end">
                 {topAtts.map((att: any, i: number) => <div key={i}>{renderAttachment(att)}</div>)}
              </div>

              {/* MIDDLE ROW (Component + Lateral Attachments) */}
              <div className="flex items-center justify-center relative">
                {/* LEFT STACK */}
                <div className="flex items-center justify-end">
                   {leftAtts.map((att: any, i: number) => <div key={i}>{renderAttachment(att)}</div>)}
                </div>

                {/* CORE */}
                <motion.div 
                  key={componentType}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="shrink-0 z-0"
                >
                  {renderCore()}
                </motion.div>

                {/* RIGHT STACK */}
                <div className="flex items-center justify-start">
                   {rightAtts.map((att: any, i: number) => <div key={i}>{renderAttachment(att)}</div>)}
                </div>
              </div>

              {/* BOTTOM STACK */}
              <div className="flex flex-col items-center justify-start">
                 {bottomAtts.map((att: any, i: number) => <div key={i}>{renderAttachment(att)}</div>)}
              </div>
            </div>

            {/* RULER INFO */}
            <div className="absolute bottom-3 left-4 flex items-center gap-3 opacity-20">
               <div className="h-[1px] w-12 bg-primary/40" />
               <span className="text-[7px] font-black uppercase tracking-[0.4em] text-primary italic">Canonical Flex Preview</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isCollapsed && (
        <div 
          onClick={() => setIsCollapsed(false)}
          className="w-full h-8 bg-black/40 border-b wb-outline flex items-center justify-center cursor-pointer hover:bg-black/60 transition-all"
        >
          <span className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20">Preview Hidden • Click to Expand</span>
        </div>
      )}
    </div>
  );
}
