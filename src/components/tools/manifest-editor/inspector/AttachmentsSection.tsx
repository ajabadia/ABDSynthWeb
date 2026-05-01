'use client';

import React from 'react';
import { Plus, X, Activity, Paperclip, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AttachmentItem from './AttachmentItem';

import { ManifestEntity } from '../../../types/manifest';
import { Info } from 'lucide-react';

interface AttachmentsSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  availableBinds?: string[];
  onHelp?: (sectionId?: string) => void;
}

export default function AttachmentsSection({ item, onUpdate, availableBinds = [], onHelp }: AttachmentsSectionProps) {
  const [expandedIdx, setExpandedIdx] = React.useState<number | string | null>('core');
  const attachments = item.presentation?.attachments || [];

  // VIRTUAL CORE ATTACHMENT: Represents the main component itself
  const coreAtt = {
    isCore: true,
    type: item.presentation?.component || (item.isJack ? 'port' : 'knob'),
    position: 'center',
    variant: item.presentation?.variant || 'B_cyan',
    bind: item.bind,
    offsetX: item.presentation?.offsetX || 0,
    offsetY: item.presentation?.offsetY || 0,
  };

  const addAttachment = () => {
    const newAtt = { type: 'label', position: 'bottom', offsetY: 0, offsetX: 0, role: 'standard', variant: 'B_cyan' };
    const nextAtts = [...attachments, newAtt];
    onUpdate({ presentation: { ...item.presentation, attachments: nextAtts } });
    setExpandedIdx(nextAtts.length - 1);
  };

  const removeAttachment = (idx: number) => {
    onUpdate({ presentation: { ...item.presentation, attachments: attachments.filter((_: any, i: number) => i !== idx) } });
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateAttachment = (idx: number | string, updates: any) => {
    if (idx === 'core') {
      // Mapping virtual core properties back to the actual item root/presentation
      const rootUpdates: any = {};
      const presUpdates: any = { ...item.presentation };

      if (updates.variant !== undefined) presUpdates.variant = updates.variant;
      if (updates.type !== undefined) presUpdates.component = updates.type;
      if (updates.offsetX !== undefined) presUpdates.offsetX = updates.offsetX;
      if (updates.offsetY !== undefined) presUpdates.offsetY = updates.offsetY;
      if (updates.bind !== undefined) rootUpdates.bind = updates.bind;

      onUpdate({ ...rootUpdates, presentation: presUpdates });
    } else {
      const newAtts = [...attachments];
      newAtts[idx as number] = { ...newAtts[idx as number], ...updates };
      onUpdate({ presentation: { ...item.presentation, attachments: newAtts } });
    }
  };

  const renderItemContainer = (att: any, idx: number | string, isCore = false) => {
    const isExpanded = expandedIdx === idx;
    
    return (
      <div key={idx} className={`border border-outline/20 rounded-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-black/60 shadow-xl' : 'bg-black/20 hover:bg-black/40'}`}>
        <div 
          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
          className="flex items-center justify-between p-3 cursor-pointer group select-none"
        >
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${isCore ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.8)]' : att.type === 'led' ? 'bg-accent shadow-[0_0_5px_rgba(255,140,0,0.5)]' : att.type === 'display' ? 'bg-primary shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'bg-foreground/20'}`} />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isExpanded ? 'text-foreground' : 'text-foreground/40'}`}>
                  {att.type} • {att.position}
                </span>
                {isCore && (
                  <span className="flex items-center gap-0.5 px-1 py-0.5 bg-primary/10 border border-primary/20 rounded-xs text-[6px] font-black text-primary">
                    <ShieldCheck className="w-2 h-2" />
                    <span>CORE</span>
                  </span>
                )}
              </div>
              {(att.bind || att.variant) && (
                <div className="flex gap-2">
                   {att.variant && <span className="text-[7px] font-mono text-foreground/20 italic">{att.variant}</span>}
                   {att.bind && <span className="text-[7px] font-mono text-accent/60">{att.bind}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCore && (
              <button 
                onClick={(e) => { e.stopPropagation(); removeAttachment(idx as number); }} 
                className="p-1 text-foreground/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
               <ChevronDown className="w-3 h-3 text-foreground/20" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-outline/10"
            >
              <div className="p-4">
                <AttachmentItem 
                  att={att}
                  availableBinds={availableBinds}
                  onUpdate={(updates) => updateAttachment(idx, updates)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-xs border border-outline/10">
        <div className="flex items-center gap-2">
           <Paperclip className="w-3 h-3 text-primary" />
           <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Aesthetic Components</span>
           <button onClick={() => onHelp?.('attachments')} className="hover:text-primary transition-colors ml-1">
              <Info className="w-3 h-3 opacity-40" />
           </button>
        </div>
        <button 
          onClick={addAttachment}
          className="flex items-center gap-1.5 px-2 py-1 bg-primary text-background hover:scale-105 transition-all rounded-xs shadow-lg shadow-primary/20"
        >
          <Plus className="w-2.5 h-2.5" />
          <span className="text-[8px] font-black uppercase">Add Fragment</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {/* FIRST: RENDER THE CORE VIRTUAL ATTACHMENT */}
        {renderItemContainer(coreAtt, 'core', true)}

        {/* THEN: RENDER ALL OTHER ATTACHMENTS */}
        {attachments.map((att: any, idx: number) => renderItemContainer(att, idx))}
      </div>
    </div>
  );
}
