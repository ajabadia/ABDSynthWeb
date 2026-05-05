'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import ArchPreview from './ArchPreview';

import { ManifestEntity } from '@/types/manifest';

interface ArchitectureSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  scale: number;
}

export default function ArchitectureSection({ item, onUpdate, scale }: ArchitectureSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const compType = item.presentation?.component || 'knob';

  return (
    <section className="space-y-4">
      <div 
        className="flex items-center justify-between group cursor-pointer border-b wb-outline pb-2 transition-colors duration-500"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Eye className="w-3 h-3 text-primary" />
          <div className="text-[9px] font-bold wb-text-muted uppercase tracking-widest transition-colors duration-500">Visual Architecture</div>
        </div>
        <div className="wb-text-muted group-hover:wb-text transition-colors">
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <ArchPreview item={item} scale={scale} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-1">
        <label className="text-[8px] wb-text-muted uppercase font-bold tracking-tighter transition-colors duration-500">Component Type</label>
        <select 
          value={compType} 
          onChange={(e) => onUpdate({ presentation: { ...item.presentation, component: e.target.value } })} 
          className="w-full wb-surface-inset border wb-outline rounded-sm p-2 text-[10px] text-primary outline-none transition-colors duration-500 [color-scheme:dark]"
        >
          <option value="knob">Knob (Analog)</option>
          <option value="slider-v">Slider (Vertical)</option>
          <option value="slider-h">Slider (Horizontal)</option>
          <option value="select">Select (List/Menu)</option>
          <option value="display">Display (Digital + Buttons)</option>
          <option value="switch">Switch (Toggle)</option>
          <option value="button">Button (Momentary)</option>
          <option value="port">Signal Port (Jack)</option>
          <option value="led">LED Indicator</option>
        </select>
      </div>
    </section>
  );
}
