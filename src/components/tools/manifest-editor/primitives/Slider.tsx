'use client';

import React from 'react';
import { renderSliderHTML } from '@/omega-ui-core/renderers/SliderRenderer';

interface SliderProps {
  type: 'slider-v' | 'slider-h';
  value: number;
  variant: string;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  isMain?: boolean;
}

export default function Slider({ type, value, variant, onValueChange, onClick }: SliderProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const html = renderSliderHTML({
    type,
    size,
    colorId,
    value
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
      className="contents cursor-crosshair"
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); 
        if (onClick) onClick(); 
      }}
      onPointerUp={(e) => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); }}
      onPointerMove={(e) => { 
        if (e.buttons === 1) { 
          e.stopPropagation(); 
          const isHoriz = type === 'slider-h';
          onValueChange(value + (isHoriz ? e.movementX : -e.movementY) * 0.015); 
        } 
      }}
    />
  );
}
