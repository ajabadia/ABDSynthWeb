'use client';

import React from 'react';

interface SliderProps {
  type: 'slider-v' | 'slider-h';
  value: number;
  variant: string;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  isMain?: boolean;
}

export default function Slider({ type, value, variant, onValueChange, onClick, isMain }: SliderProps) {
  const isHoriz = type === 'slider-h';
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
  const dims: Record<string, number> = { A: 80, B: 60, C: 40, D: 30 };
  const d = dims[size] || 60;
  
  const w = isHoriz ? d : d/3;
  const h = isHoriz ? d/3 : d;

  return (
    <div 
      className="bg-black/40 border border-outline rounded-full p-1 relative cursor-crosshair"
      style={{ width: `${w}px`, height: `${h}px` }}
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); 
        if (onClick) onClick(); 
      }}
      onPointerUp={(e) => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); }}
      onPointerMove={(e) => { 
        if (e.buttons === 1) { 
          e.stopPropagation(); 
          onValueChange(value + (isHoriz ? e.movementX : -e.movementY) * 0.015); 
        } 
      }}
    >
      <div 
        className="absolute bg-primary/20 pointer-events-none rounded-full" 
        style={{ 
          left: '2px', right: '2px', bottom: '2px', top: '2px', 
          [isHoriz ? 'width' : 'height']: `${value * 100}%`, 
          [isHoriz ? 'bottom' : 'left']: '2px' 
        }} 
      />
      <div 
        style={{ 
          [isHoriz ? 'left' : 'bottom']: `${value * 80}%`, 
          backgroundColor: color 
        }} 
        className={`absolute rounded-xs shadow-[0_0_10px_rgba(0,240,255,0.4)] z-10 pointer-events-none ${isHoriz ? 'w-2 h-4' : 'w-4 h-2'}`} 
      />
    </div>
  );
}
