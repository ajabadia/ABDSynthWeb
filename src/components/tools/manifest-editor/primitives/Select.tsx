'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: number;
  variant: string;
  options?: string[];
  lookup?: string;
  onValueChange?: (val: number) => void;
}

export default function Select({ value, variant, options = [], lookup, onValueChange }: SelectProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const colorMap: Record<string, string> = {
    cyan: '#00f2ff',
    red: '#ff4444',
    orange: '#ff8800',
    green: '#00ff88',
    white: '#ffffff'
  };
  
  const color = colorMap[colorId] || '#00f0ff';
  const dims: Record<string, number> = { A: 120, B: 100, C: 80, D: 60 };
  const d = dims[size] || 100;
  const h = 24;

  const labels = options.length > 0 ? options : [lookup || 'No Options'];
  const currentIndex = Math.min(labels.length - 1, Math.floor(value * labels.length));
  const currentLabel = labels[currentIndex];

  return (
    <div 
      style={{ width: `${d}px`, height: `${h}px` }} 
      className="bg-black/60 border border-outline/30 rounded-xs flex items-center px-2 gap-2 cursor-pointer hover:border-primary/40 transition-all group"
    >
      <div className="flex-1 overflow-hidden">
        <span 
          style={{ color: currentIndex >= 0 ? color : 'white' }} 
          className="text-[9px] font-black uppercase tracking-widest truncate block"
        >
          {currentLabel}
        </span>
      </div>
      <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
    </div>
  );
}
