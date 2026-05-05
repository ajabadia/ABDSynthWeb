import React from 'react';
import { renderPortHTML } from '@/omega-ui-core/renderers/PortRenderer';
import { ManifestEntity } from '@/types/manifest';

interface PortProps {
  value: number;
  variant: string;
  isMain?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  color?: string; // Explicit color token from manifest
  item?: ManifestEntity;    // For inference logic
}

export default function Port({ value, variant, isMain, isSelected, onClick, color, item }: PortProps) {
  const parts = (variant || 'B_accent').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'accent';
  
  const html = renderPortHTML({
    size,
    colorId,
    value,
    isMain,
    isSelected,
    id: item?.id,
    label: item?.label,
    explicitColor: color
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="contents cursor-pointer"
    />
  );
}
