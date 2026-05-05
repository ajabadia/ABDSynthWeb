'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  Fingerprint, Settings, Palette, Paperclip, 
  Settings2, Zap, Move, Layout 
} from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest } from '@/types/manifest';

export const usePropertyPanel = (
  item: ManifestEntity | OMEGA_Manifest,
  highlightPath?: string | null
) => {
  const [activeSection, setActiveSection] = useState<string>('identity');
  const isModule = 'metadata' in item;

  const sections = useMemo(() => (
    isModule ? [
      { id: 'identity', label: 'Identity', icon: Fingerprint, color: 'text-primary' },
      { id: 'layout', label: 'Layout', icon: Layout, color: 'text-accent' },
      { id: 'controls', label: 'Controls', icon: Settings2, color: 'text-blue-400' },
      { id: 'signals', label: 'Signals', icon: Zap, color: 'text-yellow-400' },
      { id: 'assets', label: 'Assets', icon: Palette, color: 'text-purple-400' },
      { id: 'modulations', label: 'Modulations', icon: Move, color: 'text-cyan-400' },
    ] : [
      { id: 'identity', label: 'Identity', icon: Fingerprint, color: 'text-primary' },
      { id: 'logic', label: 'Logic', icon: Settings, color: 'text-blue-400' },
      { id: 'spatial', label: 'Spatial', icon: Move, color: 'text-amber-400' },
      { id: 'aesthetic', label: 'Aesthetic', icon: Palette, color: 'text-purple-400' },
      { id: 'attachments', label: 'Attachments', icon: Paperclip, color: 'text-green-400' },
    ]
  ), [isModule]);

  // AUDIT GPS: Auto-switch section based on highlightPath
  useEffect(() => {
    if (!highlightPath) return;

    setTimeout(() => {
      if (isModule) {
         if (highlightPath.includes('layout')) setActiveSection('layout');
         if (highlightPath.includes('resources')) setActiveSection('assets');
      } else {
         if (highlightPath.includes('bind')) setActiveSection('logic');
         if (highlightPath.includes('variant') || highlightPath.includes('color')) setActiveSection('aesthetic');
         if (highlightPath.includes('attachments')) setActiveSection('attachments');
         if (highlightPath.includes('pos') || highlightPath.includes('size') || highlightPath.includes('container')) setActiveSection('spatial');
         if (highlightPath.includes('label') || highlightPath.includes('id') || highlightPath.includes('unit') || highlightPath.includes('role') || highlightPath.includes('type')) setActiveSection('identity');
      }
    }, 0);
  }, [highlightPath, isModule]);

  // Auto-reset tab if current one disappears
  useEffect(() => {
    if (!sections.find(s => s.id === activeSection)) {
      setTimeout(() => setActiveSection('identity'), 0);
    }
  }, [isModule, sections, activeSection]);

  return {
    activeSection,
    setActiveSection,
    isModule,
    sections
  };
};
