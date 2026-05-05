'use client';

import React from 'react';

interface SwitchProps {
  value: number;
  variant: string;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  isMain?: boolean;
}

export default function Switch({ value, variant, onValueChange, onClick }: SwitchProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  

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
