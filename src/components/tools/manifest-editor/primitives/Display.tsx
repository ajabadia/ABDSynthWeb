'use client';

import React from 'react';
import { renderDisplayHTML } from '@/omega-ui-core/renderers/DisplayRenderer';

interface DisplayProps {
  value: number;
  steps: number;
  variant: string;
  onValueChange?: (val: number) => void;
  id?: string;
}

export default function Display({ value, steps, variant, onValueChange, id }: DisplayProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  

  const mode = parts[2] || 'oled';
  
  const handleStep = (dir: number) => {
    if (!onValueChange) return;
    const stepSize = 1 / Math.max(1, steps);
    onValueChange(Math.max(0, Math.min(1, value + (dir * stepSize))));
  };

  const html = renderDisplayHTML({
    size,
    colorId,
    mode,
    value,
    steps,
    id
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
      className="contents"
      onClick={(e) => {
        e.stopPropagation();
        const target = e.target as HTMLElement;
        const action = target.getAttribute('data-action');
        if (action === 'step-down') handleStep(-1);
        if (action === 'step-up') handleStep(1);
      }}
    />
  );
}
