'use client';

import React from 'react';

interface LedProps {
  value: number;
  variant: string;
  role?: string;
}

import { renderLedHTML } from '@/omega-ui-core/renderers/LedRenderer';

export default function Led({ value, variant }: LedProps) {
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const html = renderLedHTML({ size, colorId, value });
  
  return (
    <div dangerouslySetInnerHTML={{ __html: html }} style={{ display: 'contents' }} />
  );
}
