'use client';
 
import React from 'react';
import { Settings2, Info } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';

interface BindingFieldProps {
  item: ManifestEntity;
  availableBinds: string[];
  isHighlighted: (key: string) => boolean | undefined;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (id: string) => void;
}

export function BindingField({ item, availableBinds, isHighlighted, onUpdate, onHelp }: BindingFieldProps) {
  return (
    <div className="space-y-3">
      <div className="text-[7px] font-black uppercase wb-text-muted flex items-center justify-between tracking-[0.2em]">
         <div className="flex items-center gap-2">
           <Settings2 className="w-3 h-3 text-primary" />
           <span>Canonical Binding</span>
         </div>
         <button onClick={() => onHelp?.('binding')} className="hover:text-primary transition-colors">
            <Info className="w-3 h-3" />
         </button>
      </div>
      <div className="space-y-1.5 relative">
        <div className="relative group">
          <select 
            value={item.bind || ''} 
            onChange={(e) => onUpdate({ bind: e.target.value })}
            className={`w-full bg-black/5 border ${isHighlighted('bind') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : (availableBinds.length === 0 ? 'border-amber-500/20' : 'wb-outline')} rounded-xs px-3 py-2.5 text-[10px] font-mono text-primary outline-none focus:border-primary/60 transition-all appearance-none cursor-pointer pr-10 transition-colors duration-500`}
          >
            <option value="">-- UNBOUND (Static) --</option>
            {availableBinds.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
             <span className="text-[8px] text-primary">▼</span>
          </div>
        </div>
        {availableBinds.length === 0 && (
          <p className="text-[7px] text-amber-500/60 font-bold uppercase tracking-tighter ml-1 animate-pulse">
            ⚠ No technical contract loaded. Upload .wasm or .json to sync logic.
          </p>
        )}
      </div>
    </div>
  );
}
