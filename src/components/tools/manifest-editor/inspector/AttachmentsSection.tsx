'use client';

import React from 'react';
import { Plus, X, Type, Tag, Activity, Link2, Hash } from 'lucide-react';

interface AttachmentsSectionProps {
  item: any;
  onUpdate: (updates: any) => void;
  availableBinds?: string[];
}

export default function AttachmentsSection({ item, onUpdate, availableBinds = [] }: AttachmentsSectionProps) {
  const attachments = item.presentation?.attachments || [];

  const addAttachment = () => {
    const newAtt = { type: 'label', position: 'bottom', offset: 0, role: 'standard' };
    onUpdate({ presentation: { ...item.presentation, attachments: [...attachments, newAtt] } });
  };

  const removeAttachment = (idx: number) => {
    onUpdate({ presentation: { ...item.presentation, attachments: attachments.filter((_: any, i: number) => i !== idx) } });
  };

  const updateAttachment = (idx: number, updates: any) => {
    const newAtts = [...attachments];
    newAtts[idx] = { ...newAtts[idx], ...updates };
    onUpdate({ presentation: { ...item.presentation, attachments: newAtts } });
  };

  const updateFormat = (idx: number, formatUpdates: any) => {
    const att = attachments[idx];
    const newFormat = { ...(att.format || {}), ...formatUpdates };
    updateAttachment(idx, { format: newFormat });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-center bg-white/5 p-2 rounded-xs border border-outline/10">
        <span className="text-[8px] font-black text-foreground/40 uppercase tracking-widest">Active Attachments</span>
        <button 
          onClick={addAttachment}
          className="p-1 bg-primary text-background hover:scale-110 transition-transform rounded-xs"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {attachments.map((att: any, idx: number) => (
          <div key={idx} className="p-3 bg-black/40 border border-outline/20 rounded-sm space-y-4 relative group shadow-lg">
            <button 
              onClick={() => removeAttachment(idx)} 
              className="absolute top-2 right-2 text-foreground/20 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* TYPE & POSITION */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
                  <Activity className="w-2 h-2" />
                  <span>Type</span>
                </label>
                <select 
                  value={att.type} 
                  onChange={(e) => updateAttachment(idx, { type: e.target.value })}
                  className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-primary outline-none"
                >
                  <option value="label">Label</option>
                  <option value="display">Display</option>
                  <option value="led">LED</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] text-foreground/40 uppercase font-bold">Position</label>
                <select 
                  value={att.position} 
                  onChange={(e) => updateAttachment(idx, { position: e.target.value })}
                  className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-foreground outline-none"
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            {/* BINDING (New Era 6 feature in Era 7) */}
            <div className="space-y-1">
              <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
                <Link2 className="w-2 h-2" />
                <span>Dynamic Signal Bind (Source)</span>
              </label>
              <select 
                value={att.bind || ''} 
                onChange={(e) => updateAttachment(idx, { bind: e.target.value })}
                className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-accent outline-none font-mono"
              >
                <option value="">-- AUTO (Binds to Parent) --</option>
                {availableBinds.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* ROLE & TEXT */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
                  <Tag className="w-2 h-2" />
                  <span>Role</span>
                </label>
                <select 
                  value={att.role || 'standard'} 
                  onChange={(e) => updateAttachment(idx, { role: e.target.value })}
                  className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-foreground outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="value">Live Value</option>
                  <option value="unit">Unit Marker</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
                  <Type className="w-2 h-2" />
                  <span>Static Text</span>
                </label>
                <input 
                  type="text" 
                  value={att.text || ''} 
                  onChange={(e) => updateAttachment(idx, { text: e.target.value })}
                  placeholder="Override text..."
                  className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-foreground outline-none"
                />
              </div>
            </div>

            {/* FORMATTING BLOCK (New Era 6 feature in Era 7) */}
            <div className="p-2 border border-outline/10 bg-white/5 rounded-xs space-y-3">
               <div className="text-[7px] font-black text-foreground/20 uppercase tracking-tighter flex items-center gap-1">
                  <Hash className="w-2 h-2" />
                  <span>Value Formatting</span>
               </div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[6px] text-foreground/40 uppercase font-bold text-center block">Prefix</label>
                    <input 
                      type="text" 
                      value={att.format?.prefix || ''} 
                      onChange={(e) => updateFormat(idx, { prefix: e.target.value })}
                      className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-foreground outline-none"
                      placeholder="e.g. Vol:"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[6px] text-foreground/40 uppercase font-bold text-center block">Suffix</label>
                    <input 
                      type="text" 
                      value={att.format?.suffix || ''} 
                      onChange={(e) => updateFormat(idx, { suffix: e.target.value })}
                      className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-foreground outline-none"
                      placeholder="e.g. Hz"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[6px] text-foreground/40 uppercase font-bold text-center block">Decimals</label>
                    <input 
                      type="number" 
                      value={att.format?.decimals ?? 2} 
                      onChange={(e) => updateFormat(idx, { decimals: parseInt(e.target.value) })}
                      className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-primary outline-none font-mono"
                    />
                  </div>
               </div>
            </div>

            {/* OFFSET SLIDER */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[7px] text-foreground/40 uppercase font-bold tracking-widest">Vertical Offset</label>
                <span className="text-[8px] text-primary font-mono font-bold bg-primary/5 px-1 rounded-xs">{att.offset || 0}px</span>
              </div>
              <input 
                type="range" 
                min="-40" 
                max="40" 
                value={att.offset || 0} 
                onChange={(e) => updateAttachment(idx, { offset: parseInt(e.target.value) })}
                className="w-full accent-primary/40 h-1 bg-black/60 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
