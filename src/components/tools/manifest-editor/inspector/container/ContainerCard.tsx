'use client';

import React from 'react';
import { ChevronDown, ChevronRight, Maximize, Minimize2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutContainer } from '@/types/manifest';
import ContainerForm from './ContainerForm';

interface ContainerCardProps {
  container: LayoutContainer;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (id: string, updates: Partial<LayoutContainer>) => void;
  onRemove: (id: string) => void;
}

export default function ContainerCard({
  container, isExpanded, onToggleExpand, onUpdate, onRemove
}: ContainerCardProps) {
  return (
    <div className="bg-black/40 border border-outline/5 rounded-xs overflow-hidden group hover:border-outline/20 transition-all">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xs transition-colors ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-white/5 text-foreground/20'}`}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
          <div className="flex flex-col">
            <input 
              type="text" 
              value={container.label} 
              onChange={(e) => { e.stopPropagation(); onUpdate(container.id, { label: e.target.value }); }}
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent text-[11px] font-bold text-foreground outline-none focus:text-primary transition-colors"
            />
            <span className="text-[7px] font-mono opacity-20 uppercase tracking-tighter">{container.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdate(container.id, { collapsed: !container.collapsed }); }}
            className={`p-1.5 rounded-xs transition-all ${container.collapsed ? 'text-accent bg-accent/10' : 'text-foreground/20 hover:text-accent hover:bg-white/5'}`}
            title={container.collapsed ? "Unfold in Rack" : "Fold in Rack"}
          >
            {container.collapsed ? <Maximize className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(container.id); }}
            className="p-1.5 text-foreground/20 hover:text-red-400 hover:bg-red-500/5 rounded-xs transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
            <ContainerForm container={container} onUpdate={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
