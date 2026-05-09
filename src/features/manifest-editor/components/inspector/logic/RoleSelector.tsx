'use client';
 
import React from 'react';
import { Layers } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';

import InspectorCollapsible from '../shared/InspectorCollapsible';

interface RoleSelectorProps {
  item: ManifestEntity;
  roles: string[];
  isHighlighted: (key: string) => boolean | undefined;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onHelp?: (id: string) => void;
}

export function RoleSelector({ item, roles, isHighlighted, onUpdate, onHelp }: RoleSelectorProps) {
  return (
    <InspectorCollapsible 
      title="Industrial Role (Registry)" 
      icon={Layers}
      onHelp={() => onHelp?.('logic')}
    >
      <div className="flex flex-wrap gap-1.5 pt-2">
        {roles.map(role => (
          <button
            key={role}
            onClick={() => onUpdate({ role: role })}
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
    </InspectorCollapsible>
  );
}
