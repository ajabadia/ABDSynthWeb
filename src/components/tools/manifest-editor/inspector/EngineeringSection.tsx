import React from 'react';
import { Layers, Info } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';

interface EngineeringSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  highlightPath?: string | null;
}

export default function EngineeringSection({ item, onUpdate, onHelp, highlightPath }: EngineeringSectionProps) {
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  return (
    <div className="space-y-6 pt-2">
      {/* EXTENDED ROLES (LOW-LEVEL FINE TUNING) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={`text-[7px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isHighlighted('role') ? 'text-amber-500' : 'wb-text-muted'}`}>
            <Layers className="w-2.5 h-2.5 text-primary" />
            <span>Low-Level Registry Role</span>
          </label>
          <button onClick={() => onHelp?.('logic')} className="hover:text-primary transition-colors">
            <Info className="w-2.5 h-2.5 opacity-20" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['control', 'input', 'output', 'telemetry', 'expert', 'stream', 'mod_source', 'mod_target'].map(role => (
            <button
              key={role}
              onClick={() => onUpdate({ role })}
              className={`px-2 py-1 text-[7px] font-black uppercase tracking-tighter border rounded-full transition-all ${
                isHighlighted('role') ? 'border-amber-500 ring-1 ring-amber-500 animate-pulse' : ''
              } ${
                (item.role || 'control') === role
                  ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                  : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
