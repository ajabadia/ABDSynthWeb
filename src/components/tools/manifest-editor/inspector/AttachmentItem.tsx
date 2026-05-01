'use client';

import React from 'react';
import { Activity, Link2, Tag, Type, Hash } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* TYPE & POSITION */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
            <Activity className="w-2 h-2" />
            <span>Type</span>
          </label>
          <select 
            value={att.type} 
            onChange={(e) => onUpdate({ type: e.target.value })}
            className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-primary outline-none font-bold"
          >
            <option value="label">Label</option>
            <option value="display">Display</option>
            <option value="led">LED</option>
            <option value="stepper">Stepper (Pulsador)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[7px] text-foreground/40 uppercase font-bold">Position</label>
          <select 
            value={att.position} 
            onChange={(e) => onUpdate({ position: e.target.value })}
            className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-foreground outline-none"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      {/* DYNAMIC BINDING (Only for Displays, LEDs and Steppers) */}
      {(isDisplay || isLed || isStepper) && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
            <Link2 className="w-2 h-2 text-accent" />
            <span>Telemetry Source (Signal Bind)</span>
          </label>
          <select 
            value={att.bind || ''} 
            onChange={(e) => onUpdate({ bind: e.target.value })}
            className="w-full bg-black/60 border border-accent/20 rounded-xs p-1.5 text-[9px] text-accent outline-none font-mono"
          >
            <option value="">-- AUTO (Binds to Parent) --</option>
            {availableBinds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      {/* ROLE & TEXT/VALUE OVERRIDE */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
            <Tag className="w-2 h-2" />
            <span>Functional Role</span>
          </label>
          <select 
            value={att.role || 'standard'} 
            onChange={(e) => onUpdate({ role: e.target.value })}
            className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-foreground outline-none"
          >
            {isLabel && (
              <>
                <option value="standard">Standard Label</option>
                <option value="unit">Unit Marker</option>
                <option value="status">Status Text</option>
              </>
            )}
            {isDisplay && (
              <>
                <option value="value">Live Readout</option>
                <option value="peak">Peak Value</option>
              </>
            )}
            {isLed && (
              <>
                <option value="activity">Signal Activity</option>
                <option value="gate">Gate / Note-On</option>
                <option value="peak">Peak Clipping</option>
              </>
            )}
            {isStepper && (
              <>
                <option value="inc">Increment (+)</option>
                <option value="dec">Decrement (-)</option>
                <option value="reset">Reset to Default</option>
              </>
            )}
          </select>
        </div>
        
        {(isLabel || isStepper) && (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-1 duration-200">
            <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
              <Type className="w-2 h-2" />
              <span>{isStepper ? 'Button Literal' : 'Static Content'}</span>
            </label>
            <input 
              type="text" 
              value={att.text || ''} 
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder={isStepper ? 'e.g. +, -, <, >' : 'Label text...'}
              className="w-full bg-black/60 border border-outline rounded-xs p-1.5 text-[9px] text-foreground outline-none"
            />
          </div>
        )}
      </div>

      {/* STEP CONFIG (Only for Steppers) */}
      {isStepper && (
        <div className="p-2 border border-accent/20 bg-accent/5 rounded-xs space-y-2 animate-in zoom-in-95 duration-200">
          <label className="text-[7px] text-foreground/40 uppercase font-bold flex items-center gap-1">
            <Hash className="w-2 h-2" />
            <span>Stepper Operation</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[6px] text-foreground/40 uppercase font-bold block">Step Amount</label>
              <input 
                type="number" 
                value={att.amount ?? 1} 
                onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) })}
                className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-accent outline-none font-mono"
              />
            </div>
            <div className="flex items-end pb-1">
               <span className="text-[6px] text-foreground/20 italic uppercase leading-tight">Units per pulse</span>
            </div>
          </div>
        </div>
      )}

      {/* ENGINEERING FORMATTING (Only for Displays) */}
      {isDisplay && (
        <div className="p-2 border border-primary/20 bg-primary/5 rounded-xs space-y-3 animate-in zoom-in-95 duration-200">
           <div className="text-[7px] font-black text-primary/40 uppercase tracking-tighter flex items-center gap-1">
              <Hash className="w-2 h-2" />
              <span>Engineering Unit Formatting</span>
           </div>
           <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[6px] text-foreground/40 uppercase font-bold text-center block">Suffix (Unit)</label>
                <input 
                  type="text" 
                  value={att.unit || ''} 
                  onChange={(e) => onUpdate({ unit: e.target.value })}
                  className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-foreground outline-none"
                  placeholder="e.g. Hz, dB"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[6px] text-foreground/40 uppercase font-bold text-center block">UI Precision</label>
                <input 
                  type="number" 
                  value={att.precision ?? 2} 
                  onChange={(e) => onUpdate({ precision: parseInt(e.target.value) })}
                  className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-primary outline-none font-mono"
                />
              </div>
           </div>
           <div className="space-y-1">
             <label className="text-[6px] text-foreground/40 uppercase font-bold block">Display Prefix</label>
             <input 
               type="text" 
               value={att.prefix || ''} 
               onChange={(e) => onUpdate({ prefix: e.target.value })}
               className="w-full bg-black/60 border border-outline rounded-xs p-1 text-[8px] text-foreground outline-none"
               placeholder="e.g. VOL:"
             />
           </div>
        </div>
      )}

      {/* UNIVERSAL POSITIONING */}
      <div className="space-y-1 pb-2">
        <div className="flex justify-between items-center">
          <label className="text-[7px] text-foreground/40 uppercase font-bold tracking-widest">Vertical Offset</label>
          <span className="text-[8px] text-primary font-mono font-bold bg-primary/5 px-1 rounded-xs">{att.offset || 0}px</span>
        </div>
        <input 
          type="range" 
          min="-40" 
          max="40" 
          value={att.offset || 0} 
          onChange={(e) => onUpdate({ offset: parseInt(e.target.value) })}
          className="w-full accent-primary/40 h-1 bg-black/60 rounded-full appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
