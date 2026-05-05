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

export default function Knob({ value, variant, isSelected, onValueChange, onClick }: KnobProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const rotation = -135 + (value * 270);

  return (
    <div 
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
      className={`knob-container size-${size} color-${colorId} ${isSelected ? 'selected' : ''}`}
      style={{ 
        '--knob-rotation': `${rotation}deg`,
        position: 'relative',
        cursor: 'ns-resize'
      } as React.CSSProperties}
    >
      <div className="knob-cap" />
      <motion.div 
        animate={{ rotate: rotation }} 
        transition={{ type: 'spring', stiffness: 350, damping: 25 }} 
        className="knob-marker" 
      />
    </div>
  );
}
