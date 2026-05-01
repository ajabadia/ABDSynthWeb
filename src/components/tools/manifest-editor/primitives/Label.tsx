'use client';

import React from 'react';

interface LabelProps {
  variant: string;
  text: string;
}

export default function Label({ variant, text }: LabelProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  
  const dims: Record<string, number> = { A: 32, B: 24, C: 16, D: 12 };
  const d = dims[size] || 24;

  return (
    <div 
      style={{ fontSize: `${Math.max(6, d/8)}px` }} 
      className="font-bold uppercase whitespace-nowrap tracking-widest text-white/40 bg-black/40 px-1 py-0.5 rounded-xs pointer-events-none border border-white/5"
    >
      {text}
    </div>
  );
}
