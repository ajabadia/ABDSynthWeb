'use client';

import React from 'react';

interface SelectProps {
  value: number;
  variant: string;
  options?: string[];
  lookup?: string;
  onValueChange?: (val: number) => void;
}

export default function Select({ value, variant, options = [], lookup }: SelectProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  

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
