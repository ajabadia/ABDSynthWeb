'use client';

import React from 'react';
import { Activity } from 'lucide-react';

import { Attachment, AttachmentType } from '@/types/manifest';

interface AttachmentTypeAnchorProps {
  type: AttachmentType;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  isCore: boolean;
  onUpdate: (updates: Partial<Attachment>) => void;
}

export default function AttachmentTypeAnchor({ type, position, isCore, onUpdate }: AttachmentTypeAnchorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      <div className="space-y-1">
        <label className="text-[7px] wb-text-muted uppercase font-black flex items-center gap-1 tracking-widest transition-colors duration-500">
          <Activity className="w-2 h-2" />
          <span>Fragment Type</span>
        </label>
        <select 
          value={type} 
          disabled={isCore}
          onChange={(e) => onUpdate({ type: e.target.value as AttachmentType })}
          className={`w-full wb-surface-inset border wb-outline rounded-xs p-1.5 text-[9px] outline-none font-bold transition-colors duration-500 shadow-sm ${isCore ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:border-primary/40'} transition-all [color-scheme:dark]`}
        >
          <option value="knob">Knob</option>
          <option value="port">Jack / Port</option>
          <option value="slider-v">V-Slider</option>
          <option value="slider-h">H-Slider</option>
          <option value="switch">Switch</option>
          <option value="push">Push Button</option>
          <option value="label">Label</option>
          <option value="display">Display</option>
          <option value="led">LED</option>
          <option value="stepper">Stepper (Pulsador)</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[7px] wb-text-muted uppercase font-black flex items-center gap-1 tracking-widest transition-colors duration-500">
           <Activity className="w-2 h-2 opacity-40 rotate-90" />
           <span>Anchor Position</span>
        </label>
        <select 
          value={position || 'center'} 
          disabled={isCore}
          onChange={(e) => onUpdate({ position: e.target.value as 'top' | 'bottom' | 'left' | 'right' | 'center' })}
          className={`w-full wb-surface-inset border wb-outline rounded-xs p-1.5 text-[9px] outline-none font-bold transition-colors duration-500 shadow-sm ${isCore ? 'opacity-50 cursor-not-allowed' : 'text-foreground hover:border-accent/40'} transition-all [color-scheme:dark]`}
        >
          <option value="center">Center (Core)</option>
          <option value="top">Top (3U/1U)</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}
