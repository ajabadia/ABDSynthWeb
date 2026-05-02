'use client';

import React from 'react';
import { Activity, Link2, Tag, Type, Hash, Move, Box } from 'lucide-react';

interface AttachmentItemProps {
  att: any;
  availableBinds: string[];
  onUpdate: (updates: any) => void;
}

export default function AttachmentItem({ att, availableBinds, onUpdate }: AttachmentItemProps) {
  const isLabel = att.type === 'label';
  const isDisplay = att.type === 'display';
  const isLed = att.type === 'led';
  const isStepper = att.type === 'stepper';
  const isCore = att.isCore === true; // New flag for the special Core attachment

  const currentVariant = att.variant || 'B_cyan';

  return (
    <div className="space-y-4">
      {/* TYPE & POSITION SELECTORS (CANONICAL ANCHORS) */}
      <div className="grid grid-cols-2 gap-3 wb-surface-inset p-2 rounded-xs border wb-outline shadow-inner transition-colors duration-500">
        <div className="space-y-1">
          <label className="text-[7px] wb-text-muted uppercase font-black flex items-center gap-1 tracking-widest transition-colors duration-500">
            <Activity className="w-2 h-2" />
            <span>Fragment Type</span>
          </label>
          <select 
            value={att.type} 
            disabled={isCore}
            onChange={(e) => onUpdate({ type: e.target.value })}
            className={`w-full wb-surface-inset border wb-outline rounded-xs p-1.5 text-[9px] outline-none font-bold transition-colors duration-500 shadow-sm ${isCore ? 'opacity-50 cursor-not-allowed' : 'text-primary hover:border-primary/40'} transition-all`}
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
          <label className="text-[7px] wb-text-muted uppercase font-black tracking-widest transition-colors duration-500">Anchor Position</label>
          <select 
            value={att.position || 'center'} 
            disabled={isCore}
            onChange={(e) => onUpdate({ position: e.target.value })}
            className={`w-full wb-surface-inset border wb-outline rounded-xs p-1.5 text-[9px] outline-none font-bold transition-colors duration-500 shadow-sm ${isCore ? 'opacity-50 cursor-not-allowed' : 'text-foreground hover:border-accent/40'} transition-all`}
          >
            <option value="center">Center (Core)</option>
            <option value="top">Top (3U/1U)</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {/* CANONICAL VARIANT SELECTION */}
      <div className="space-y-1">
        <label className="text-[7px] wb-text-muted uppercase font-bold flex items-center gap-1 transition-colors duration-500">
          <Box className="w-2 h-2 text-primary" />
          <span>OMEGA Variant (Size_Color)</span>
        </label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={currentVariant} 
            onChange={(e) => onUpdate({ variant: e.target.value })}
            placeholder="e.g. A_red, B_cyan"
            className="flex-1 wb-surface-inset border wb-outline rounded-xs p-1.5 text-[9px] text-primary font-mono outline-none transition-colors duration-500 shadow-sm"
          />
          <div className="flex gap-1">
            {['A', 'B', 'C', 'D'].map(s => (
              <button 
                key={s}
                onClick={() => {
                  const parts = currentVariant.split('_');
                  onUpdate({ variant: `${s}_${parts[1] || 'cyan'}` });
                }}
                className={`w-5 h-5 flex items-center justify-center text-[8px] font-black rounded-xs border transition-all ${currentVariant.startsWith(s) ? 'bg-primary/20 border-primary text-primary' : 'bg-black/40 border-outline text-white/20'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC BINDING */}
      {(isDisplay || isLed || isStepper || isCore) && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-[7px] wb-text-muted uppercase font-bold flex items-center gap-1 transition-colors duration-500">
            <Link2 className="w-2 h-2 text-accent" />
            <span>Telemetry Source (Signal Bind)</span>
          </label>
          <select 
            value={att.bind || ''} 
            onChange={(e) => onUpdate({ bind: e.target.value })}
            className="w-full wb-surface-inset border border-accent/20 rounded-xs p-1.5 text-[9px] wb-accent outline-none font-mono transition-colors duration-500"
          >
            <option value="">-- AUTO (Binds to Parent) --</option>
            {availableBinds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* TEXT/LITERAL OVERRIDE */}
      {(isLabel || isStepper) && (
        <div className="space-y-1 animate-in fade-in slide-in-from-left-1 duration-200">
          <label className="text-[7px] wb-text-muted uppercase font-bold flex items-center gap-1 transition-colors duration-500">
            <Type className="w-2 h-2" />
            <span>{isStepper ? 'Button Literal' : 'Static Content'}</span>
          </label>
          <input 
            type="text" 
            value={att.text || ''} 
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder={isStepper ? 'e.g. +, -, <, >' : 'Label text...'}
            className="w-full wb-surface-inset border wb-outline rounded-xs p-1.5 text-[9px] wb-text outline-none focus:border-primary/40 transition-all transition-colors duration-500 font-bold"
          />
        </div>
      )}

      {/* DUAL OFFSETS (X/Y) */}
      <div className="p-2 wb-surface-inset border wb-outline rounded-xs space-y-3 transition-colors duration-500 shadow-sm">
        <label className="text-[7px] wb-text-muted uppercase font-bold flex items-center gap-1 transition-colors duration-500">
          <Move className="w-2 h-2" />
          <span>Industrial Precision Offset</span>
        </label>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[6px] wb-text-muted uppercase font-black tracking-widest transition-colors duration-500">Vertical (Y)</span>
            <span className="text-[8px] wb-text font-mono font-bold transition-colors duration-500">{att.offsetY || 0}px</span>
          </div>
          <input 
            type="range" min="-64" max="64" 
            value={att.offsetY || 0} 
            onChange={(e) => onUpdate({ offsetY: parseInt(e.target.value) })}
            className="w-full accent-primary h-1 wb-surface-inset rounded-full appearance-none cursor-pointer transition-colors"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <span className="text-[6px] wb-text-muted uppercase font-black tracking-widest transition-colors duration-500">Horizontal (X)</span>
            <span className="text-[8px] wb-text font-mono font-bold transition-colors duration-500">{att.offsetX || 0}px</span>
          </div>
          <input 
            type="range" min="-64" max="64" 
            value={att.offsetX || 0} 
            onChange={(e) => onUpdate({ offsetX: parseInt(e.target.value) })}
            className="w-full accent-primary h-1 wb-surface-inset rounded-full appearance-none cursor-pointer transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
