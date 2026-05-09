'use client';

import React from 'react';
import { Layout } from 'lucide-react';

interface GovernedOverlayProps {
  enabled: boolean;
}

export function GovernedOverlay({ enabled }: GovernedOverlayProps) {
  if (!enabled) return null;

  return (
    <div className="absolute inset-0 bg-blue-500/5 pointer-events-none flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
      <div className="px-1.5 py-0.5 bg-blue-500 text-black text-[5px] font-black uppercase tracking-tighter rounded-full flex items-center gap-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
        <Layout className="w-2 h-2" />
        <span>Layout Governed</span>
      </div>
    </div>
  );
}
