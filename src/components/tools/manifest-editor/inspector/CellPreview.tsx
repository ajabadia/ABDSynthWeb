'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';

import { CellRenderer } from '@/omega-ui-core/renderers/CellRenderer';

interface CellPreviewProps {
  item: ManifestEntity;
  skin?: string;
  resolveAsset?: (id: string | undefined) => string | undefined;
}

export default function CellPreview({ item, skin = 'industrial', resolveAsset }: CellPreviewProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
            animate={{ height: 180, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full bg-[#050505] border-b wb-outline flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* GRID BACKGROUND */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            
            {/* RENDERER BRIDGE — 100% PARITY (ERA 7.2.3) */}
            <div className="relative scale-[1.5] flex items-center justify-center">
               <div 
                  dangerouslySetInnerHTML={{ 
                    __html: CellRenderer.renderCellHTML(item, {
                      skin,
                      zoom: 1.0,
                      runtimeValue: 0.5, // Visual reference state
                      steps: 100,
                      isSelected: false,
                      isLiveMode: false,
                      resolveAsset
                    }) 
                  }}
               />
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
