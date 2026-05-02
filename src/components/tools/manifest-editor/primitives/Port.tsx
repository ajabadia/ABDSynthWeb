'use client';

import React from 'react';

interface PortProps {
  value: number;
  variant: string;
  isMain?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function Port({ value, variant, isMain, isSelected, onClick }: PortProps) {
  const parts = (variant || 'B_accent').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'accent';
  
  const colorMap: Record<string, string> = {
    cyan: 'var(--color-primary, #00f2ff)',
    red: '#ff4444',
    orange: 'var(--color-accent, #ff8800)',
    green: '#00ff88',
    white: '#ffffff',
    accent: 'var(--color-accent, #ff8c00)',
    primary: 'var(--color-primary, #00f0ff)'
  };
  
  const color = colorMap[colorId] || colorMap.accent;
  const dims: Record<string, number> = { A: 28, B: 24, C: 20, D: 16 };
  const d = dims[size] || 24;

  return (
    <div 
      style={{ width: `${d}px`, height: `${d}px` }} 
      className={`rounded-full border-2 bg-[#000] flex items-center justify-center cursor-pointer ${isMain && isSelected ? 'border-accent shadow-[0_0_10px_rgba(255,140,0,0.2)]' : 'border-[#444]'}`}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <div className="w-[60%] h-[60%] rounded-full bg-[#111] border border-white/5 shadow-inner flex items-center justify-center">
         <div style={{ opacity: value, backgroundColor: color }} className="w-1 h-1 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
