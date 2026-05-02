'use client';

import React from 'react';

interface LedProps {
  value: number;
  variant: string;
  role?: string;
}

export default function Led({ value, variant, role }: LedProps) {
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
  
  const baseColor = colorMap[colorId] || colorMap.primary;
  const color = role === 'activity' ? baseColor : role === 'gate' ? colorMap.accent : role === 'peak' ? colorMap.red : baseColor;
  
  const dims: Record<string, number> = { A: 12, B: 8, C: 5, D: 3 };
  const d = dims[size] || 8;

  return (
    <div 
      style={{ 
        width: `${d}px`, 
        height: `${d}px`, 
        backgroundColor: color, 
        boxShadow: `0 0 ${d}px ${color}99`, 
        opacity: 0.3 + (value * 0.7) 
      }} 
      className="rounded-full border border-white/20 transition-all duration-75" 
    />
  );
}
