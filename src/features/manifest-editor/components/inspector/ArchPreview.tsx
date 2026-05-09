'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ManifestEntity, Attachment } from '@/types/manifest';

interface ArchPreviewProps {
  item: ManifestEntity;
  scale: number;
}

export default function ArchPreview({ item, scale }: ArchPreviewProps) {
  const compType = item.presentation?.component || 'knob';
  const attachments = (item.presentation?.attachments || []) as Attachment[];

  return (
    <div className="w-full aspect-[21/9] wb-surface-inset rounded-sm border wb-outline flex items-center justify-center relative overflow-hidden transition-colors duration-500 mb-2">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
      <div className="relative flex items-center justify-center scale-90">
        
        {/* ATTACHMENTS PREVIEW */}
        {attachments.map((att: Attachment, idx: number) => {
          const offX = att.offsetX || 0;
          const offY = att.offsetY || 0;
          const pos = att.position || 'bottom';
          
          return (
            <motion.div 
              key={idx}
              animate={{ 
                x: (pos === 'left' ? -35 : pos === 'right' ? 35 : 0) * scale + offX,
                y: (pos === 'top' ? -35 : pos === 'bottom' ? 35 : 0) * scale + offY,
              }}
              className="absolute z-20"
            >
              {att.type === 'label' ? (
                <span className="text-[6px] uppercase font-black text-primary/60 tracking-widest whitespace-nowrap bg-black/40 px-1">LABEL</span>
              ) : att.type === 'led' ? (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
              ) : (
                <div className="w-8 h-3 bg-black border border-primary/40 rounded-xs flex items-center justify-center">
                    <span className="text-[5px] text-primary/60 font-mono">0.00</span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* MAIN COMPONENT PREVIEW */}
        <div className="relative z-10 flex items-center justify-center">
            {compType === 'knob' ? (
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <div className="w-0.5 h-3 bg-primary rounded-full origin-bottom -translate-y-1.5" />
              </div>
            ) : compType === 'display' ? (
              <div className="w-16 h-7 bg-black border-2 border-outline rounded-sm flex items-center overflow-hidden shadow-xl">
                <div className="flex-1 h-full flex items-center justify-center border-r border-outline/20 bg-primary/5">
                  <span className="text-[8px] text-primary font-mono font-bold">000</span>
                </div>
                <div className="w-4 h-full flex flex-col border-l border-outline/10">
                  <div className="flex-1 flex items-center justify-center text-[5px] text-primary/40">+</div>
                  <div className="flex-1 flex items-center justify-center text-[5px] text-primary/40">-</div>
                </div>
              </div>
            ) : compType === 'port' ? (
              <div className="w-8 h-8 rounded-full border-2 border-outline bg-black flex items-center justify-center shadow-inner">
                <div className="w-4 h-4 rounded-full border border-outline/40 bg-zinc-900" />
              </div>
            ) : compType === 'led' ? (
              <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_15px_rgba(0,240,255,0.6)] border border-white/20" />
            ) : compType === 'select' ? (
              <div className="w-16 h-5 bg-black border border-outline rounded-xs flex items-center justify-between px-2">
                <span className="text-[5px] text-primary/60 font-black">LIST</span>
                <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-t-[3px] border-t-primary/40" />
              </div>
            ) : (
              <div className="w-6 h-10 bg-primary/10 border-2 border-primary rounded-xs shadow-[0_0_10px_rgba(0,240,255,0.1)]" />
            )}
        </div>
      </div>
    </div>
  );
}
