'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface KnobProps {
  value: number;
  variant: string;
  skin: string;
  isMain?: boolean;
  isSelected?: boolean;
  onValueChange: (val: number) => void;
  onClick?: () => void;
}

export default function Knob({ value, variant, skin, isMain, isSelected, onValueChange, onClick }: KnobProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const colorMap: Record<string, string> = {
    cyan: '#00f2ff',
    red: '#ff4444',
    orange: '#ff8800',
    green: '#00ff88',
    white: '#ffffff',
    primary: '#00f0ff'
  };
  
  const color = colorMap[colorId] || colorMap.primary;
  
  const dims: Record<string, number> = { A: 32, B: 24, C: 16, D: 12 };
  const d = dims[size] || 24;
  
  const rotation = -135 + (value * 270);

  return (
    <div 
      style={{ width: `${d}px`, height: `${d}px` }} 
      className={`rounded-full border-2 border-[#333] bg-[#111] flex items-center justify-center relative cursor-ns-resize ${isMain && isSelected ? 'border-primary shadow-[0_0_15px_rgba(0,240,255,0.2)]' : ''}`}
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); 
        if (onClick) onClick(); 
      }}
      onPointerUp={(e) => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); }}
      onPointerMove={(e) => { 
        if (e.buttons === 1) { 
          e.stopPropagation(); 
          onValueChange(value - (e.movementY * 0.012)); 
        } 
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
         <motion.div 
           animate={{ rotate: rotation }} 
           transition={{ type: 'spring', stiffness: 350, damping: 25 }} 
           className="w-[2px] h-[35%] rounded-full origin-bottom" 
           style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66`, position: 'relative', top: '-17.5%' }} 
         />
      </div>
      {skin === 'industrial' && <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />}
    </div>
  );
}
