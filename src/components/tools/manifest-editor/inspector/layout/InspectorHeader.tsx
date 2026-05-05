'use client';

import React from 'react';
import { X, Package, Settings } from 'lucide-react';

interface InspectorHeaderProps {
  id: string;
  isModule: boolean;
  onClose: () => void;
}

export default function InspectorHeader({ id, isModule, onClose }: InspectorHeaderProps) {
  return (
    <header className="p-4 border-b wb-outline bg-black/5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center">
           {isModule ? <Package className="w-4 h-4 text-primary" /> : <Settings className="w-4 h-4 text-primary" />}
        </div>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest wb-text">
            {isModule ? 'Module Configuration' : 'Entity Inspector'}
          </h2>
          <p className="text-[8px] font-mono wb-text-muted truncate max-w-[200px]">{id}</p>
        </div>
      </div>
      {!isModule && (
        <button 
          onClick={onClose}
          className="p-1.5 hover:wb-surface-hover rounded-xs wb-text-muted hover:wb-text transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </header>
  );
}
