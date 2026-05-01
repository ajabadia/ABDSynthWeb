'use client';

import React from 'react';

interface StepperProps {
  type: 'stepper' | 'button' | 'push';
  value: number;
  variant: string;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  text?: string;
  isMain?: boolean;
}

export default function Stepper({ type, value, variant, onValueChange, onClick, text, isMain }: StepperProps) {
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
  const dims: Record<string, number> = { A: 24, B: 18, C: 14, D: 12 };
  const d = dims[size] || 18;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (type === 'push') onValueChange(1);
    if (onClick) onClick();
  };

  const handlePointerUp = () => {
    if (type === 'push') onValueChange(0);
  };

  return (
    <div 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`bg-black/60 border border-outline/30 rounded-xs flex items-center justify-center cursor-pointer shadow-lg active:scale-90 hover:bg-white/5 transition-all overflow-hidden ${value > 0.5 ? 'border-primary/40' : ''}`} 
      style={{ width: `${d}px`, height: `${d}px` }}
    >
      {text ? (
        <span 
          style={{ color: value > 0.5 ? color : 'white', fontSize: `${d/2}px` }} 
          className="font-mono font-black select-none pointer-events-none opacity-80"
        >
          {text}
        </span>
      ) : (
        <div 
          className={`w-1.5 h-1.5 rounded-full ${value > 0.5 ? 'bg-primary' : 'bg-white/10'}`} 
          style={{ 
            backgroundColor: value > 0.5 ? color : undefined, 
            boxShadow: value > 0.5 ? `0 0 10px ${color}` : 'none' 
          }} 
        />
      )}
    </div>
  );
}
