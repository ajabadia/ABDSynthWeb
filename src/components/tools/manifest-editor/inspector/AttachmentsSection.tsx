'use client';

import React from 'react';
import { Plus, X, Activity, Paperclip, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AttachmentItem from './AttachmentItem';

interface AttachmentsSectionProps {
  item: any;
  onUpdate: (updates: any) => void;
  availableBinds?: string[];
}

export default function AttachmentsSection({ item, onUpdate, availableBinds = [] }: AttachmentsSectionProps) {
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(0);
  const attachments = item.presentation?.attachments || [];

  const addAttachment = () => {
    const newAtt = { type: 'label', position: 'bottom', offset: 0, role: 'standard' };
    const nextAtts = [...attachments, newAtt];
    onUpdate({ presentation: { ...item.presentation, attachments: nextAtts } });
    setExpandedIdx(nextAtts.length - 1);
  };

  const removeAttachment = (idx: number) => {
    onUpdate({ presentation: { ...item.presentation, attachments: attachments.filter((_: any, i: number) => i !== idx) } });
    if (expandedIdx === idx) setExpandedIdx(null);
  };

  const updateAttachment = (idx: number, updates: any) => {
    const newAtts = [...attachments];
    newAtts[idx] = { ...newAtts[idx], ...updates };
    onUpdate({ presentation: { ...item.presentation, attachments: newAtts } });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-xs border border-outline/10">
        <div className="flex items-center gap-2">
           <Paperclip className="w-3 h-3 text-primary" />
           <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Active Attachments</span>
        </div>
        <button 
          onClick={addAttachment}
          className="flex items-center gap-1.5 px-2 py-1 bg-primary text-background hover:scale-105 transition-all rounded-xs shadow-lg shadow-primary/20"
        >
          <Plus className="w-2.5 h-2.5" />
          <span className="text-[8px] font-black uppercase">Add New</span>
        </button>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {attachments.map((att: any, idx: number) => {
          const isExpanded = expandedIdx === idx;
          
          return (
            <div key={idx} className={`border border-outline/20 rounded-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'bg-black/60 shadow-xl' : 'bg-black/20 hover:bg-black/40'}`}>
              <div 
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="flex items-center justify-between p-3 cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${att.type === 'led' ? 'bg-accent shadow-[0_0_5px_rgba(255,140,0,0.5)]' : att.type === 'display' ? 'bg-primary shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'bg-foreground/20'}`} />
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isExpanded ? 'text-foreground' : 'text-foreground/40'}`}>
                      {att.type} • {att.position}
                    </span>
                    {att.bind && <span className="text-[7px] font-mono text-accent/60 -mt-0.5">{att.bind}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }} 
                    className="p-1 text-foreground/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
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
        })}
      </div>
    </div>
  );
}
