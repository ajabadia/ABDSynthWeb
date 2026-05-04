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
      className={`mini-select size-${size} color-${colorId}`}
    >
      <div className="select-value">
        {currentLabel}
      </div>
      <div className="select-arrow">▼</div>
    </div>
  );
}
