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
    cyan: '#00f2ff',
    red: '#ff4444',
    orange: '#ff8800',
    green: '#00ff88',
    white: '#ffffff'
  };
  
  const color = colorMap[colorId] || '#00f0ff';
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
      style={{ width: `${d}px`, height: `${d * 1.8}px` }}
      className="bg-black border border-outline rounded-full p-1 flex flex-col items-center justify-between cursor-pointer"
    >
      <div 
        className="rounded-full transition-all" 
        style={{ 
          width: `${d/3}px`, 
          height: `${d/3}px`, 
          backgroundColor: value < 0.5 ? color : '#ffffff11', 
          boxShadow: value < 0.5 ? `0 0 8px ${color}` : 'none' 
        }} 
      />
      <div 
        className="rounded-full transition-all" 
        style={{ 
          width: `${d/3}px`, 
          height: `${d/3}px`, 
          backgroundColor: value >= 0.5 ? color : '#ffffff11', 
          boxShadow: value >= 0.5 ? `0 0 8px ${color}` : 'none' 
        }} 
      />
    </div>
  );
}
