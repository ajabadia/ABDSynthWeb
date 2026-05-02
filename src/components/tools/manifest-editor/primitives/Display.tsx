'use client';

import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface DisplayProps {
  value: number;
  steps: number;
  variant: string;
  onValueChange?: (val: number) => void;
}

export default function Display({ value, steps, variant, onValueChange }: DisplayProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const colorMap: Record<string, string> = {
    cyan: 'var(--color-primary, #00f2ff)',
    red: '#ff4444',
    orange: 'var(--color-accent, #ff8800)',
    green: '#00ff88',
    white: '#ffffff',
    primary: 'var(--color-primary, #00f0ff)',
    accent: 'var(--color-accent, #ff8c00)'
  };
  
  const color = colorMap[colorId] || colorMap.primary;
  const dims: Record<string, number> = { A: 100, B: 80, C: 60, D: 40 };
  const d = dims[size] || 80;
  const h = d / 3;

  const handleStep = (dir: number) => {
    if (!onValueChange) return;
    const stepSize = 1 / Math.max(1, steps);
    onValueChange(Math.max(0, Math.min(1, value + (dir * stepSize))));
  };

  return (
    <div 
      style={{ width: `${d}px`, height: `${h}px` }} 
      className="bg-black border border-outline/40 rounded-xs flex items-stretch overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] group"
    >
      {/* MINUS BUTTON */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleStep(-1); }}
        className="flex-none w-[20%] flex items-center justify-center border-r border-outline/20 hover:bg-white/5 active:bg-primary/20 transition-colors"
      >
        <Minus className="w-2.5 h-2.5 text-white/40" />
      </button>

      {/* VALUE DISPLAY */}
      <div className="flex-1 flex items-center justify-center bg-black/40 px-1">
        <span 
          style={{ color, fontSize: `${d/7}px`, textShadow: `0 0 10px ${color}33` }} 
          className="font-mono font-black tracking-tighter tabular-nums leading-none"
        >
          {Math.round(value * steps)}
        </span>
      </div>

      {/* PLUS BUTTON */}
      <button 
        onClick={(e) => { e.stopPropagation(); handleStep(1); }}
        className="flex-none w-[20%] flex items-center justify-center border-l border-outline/20 hover:bg-white/5 active:bg-primary/20 transition-colors"
      >
        <Plus className="w-2.5 h-2.5 text-white/40" />
      </button>
    </div>
  );
}
