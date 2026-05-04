'use client';

import React from 'react';

interface PortProps {
  value: number;
  variant: string;
  isMain?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  color?: string; // Explicit color token from manifest
  item?: any;    // For inference logic
}

export default function Port({ value, variant, isMain, isSelected, onClick, color, item }: PortProps) {
  const parts = (variant || 'B_accent').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'accent';
  
  // OMEGA ERA 7.2.3: Infer color if not provided
  const inferPortColor = () => {
    if (color) return `var(--signal-${color.toLowerCase()}, var(--wb-primary))`;
    
    const id = item?.id?.toLowerCase() || '';
    const label = item?.label?.toLowerCase() || '';
    const bind = item?.bind?.toLowerCase() || '';

    if (id.includes('midi') || label.includes('midi') || bind.includes('midi')) return 'var(--signal-midi)';
    if (id.includes('gate') || label.includes('gate') || id.includes('trig')) return 'var(--signal-gate)';
    if (id.includes('cv') || label.includes('cv') || id.includes('mod')) return 'var(--signal-cv)';
    if (id.includes('pitch') || id.includes('freq') || id.includes('out') || id.includes('in')) return 'var(--signal-audio)';
    
    return 'var(--wb-primary)';
  };

  const finalColor = inferPortColor();
  const dims: Record<string, number> = { A: 28, B: 24, C: 20, D: 16 };
  const d = dims[size] || 24;

  return (
    <div 
      style={{ width: `${d}px`, height: `${d}px` }} 
      className={`rounded-full border-2 bg-[#000] flex items-center justify-center cursor-pointer transition-all duration-300 ${isMain && isSelected ? 'border-accent shadow-[0_0_15px_rgba(255,140,0,0.3)] scale-110' : 'border-[#444] hover:border-[#666]'}`}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <div className="w-[60%] h-[60%] rounded-full bg-[#111] border border-white/5 shadow-inner flex items-center justify-center">
         <div 
           style={{ backgroundColor: finalColor, opacity: 0.3 + (value * 0.7) }} 
           className={`w-1.5 h-1.5 rounded-full ${value > 0.1 ? 'shadow-[0_0_8px_currentColor]' : ''} transition-all duration-200`}
           // Use currentColor for the shadow to match the background color
         />
      </div>
    </div>
  );
}
