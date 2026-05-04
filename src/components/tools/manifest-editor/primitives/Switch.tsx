'use client';

import React from 'react';

interface SwitchProps {
  value: number;
  variant: string;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  isMain?: boolean;
}

export default function Switch({ value, variant, onValueChange, onClick, isMain }: SwitchProps) {
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
  const dims: Record<string, number> = { A: 16, B: 12, C: 10, D: 8 };
  const d = dims[size] || 12;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value > 0.5 ? 0 : 1);
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleToggle}
      className={`switch-container size-${size} color-${colorId}`}
    >
      <div className={`sw-led ${value < 0.5 ? 'active' : ''}`} />
      <div className={`sw-led ${value >= 0.5 ? 'active' : ''}`} />
    </div>
  );
}
