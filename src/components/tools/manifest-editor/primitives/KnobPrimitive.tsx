'use client';

import React from 'react';
import { renderKnobHTML } from '@/omega-ui-core/renderers/KnobRenderer';

export default function KnobPrimitive({ value, variant, isMain, isSelected, onValueChange, onClick, item }: any) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const html = renderKnobHTML({
    size,
    colorId,
    value,
    isMain,
    isSelected,
    id: item?.id
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
      className="contents cursor-pointer"
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); 
        if (onClick) onClick(); 
      }}
      onPointerUp={(e) => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); }}
      onPointerMove={(e) => { 
        if (e.buttons === 1 && onValueChange) { 
          e.stopPropagation(); 
          onValueChange(value - (e.movementY * 0.012)); 
        } 
      }}
    />
  );
}
