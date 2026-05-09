'use client';

import { useState, useCallback, useMemo } from 'react';
import { ModuleTemplate } from '@/omega-ui-core/types/manifest';

/**
 * useTemplateGallery (Phase 5.4)
 * Manages discovery and selection of UCA blueprints.
 */
export const useTemplateGallery = (
  onSelect: (template: ModuleTemplate) => void
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Hardcoded for now, will be fetched from a registry in Phase 5.5
  const templates = useMemo<ModuleTemplate[]>(() => [
    {
      id: 'standard_vcf',
      version: '1.0.0',
      label: 'Industrial VCF',
      family: 'Filter',
      contractVersion: '7.2.3',
      policy: [
        { path: 'layout.mode', mode: 'locked' },
        { path: 'style.color', mode: 'editable' }
      ],
      slots: [
        { id: 'cutoff_binding', label: 'Cutoff', kind: 'parameter', required: true, path: 'cutoff_cell' }
      ],
      root: {
        id: 'vcf_root',
        kind: 'container',
        layout: { pos: { x: 0, y: 0 }, mode: 'stack-v', padding: 10, gap: 10 },
        children: [
          {
            id: 'cutoff_cell',
            kind: 'cell',
            bind: 'cutoff_binding',
            layout: { pos: { x: 0, y: 0 }, size: { width: 60, height: 60 } },
            style: { color: '#00f2ff' }
          }
        ]
      }
    },
    {
      id: 'stereo_io',
      version: '1.0.0',
      label: 'Stereo I/O Block',
      family: 'I/O',
      contractVersion: '7.2.3',
      policy: [],
      slots: [
        { id: 'in_l', label: 'Input L', kind: 'port', required: true, path: 'in_l_cell' },
        { id: 'in_r', label: 'Input R', kind: 'port', required: true, path: 'in_r_cell' }
      ],
      root: {
        id: 'io_root',
        kind: 'container',
        layout: { pos: { x: 0, y: 0 }, mode: 'stack-h', gap: 20 },
        children: [
          { id: 'in_l_cell', kind: 'cell', bind: 'in_l', layout: { pos: { x: 0, y: 0 }, size: { width: 30, height: 30 } } },
          { id: 'in_r_cell', kind: 'cell', bind: 'in_r', layout: { pos: { x: 0, y: 0 }, size: { width: 30, height: 30 } } }
        ]
      }
    }
  ], []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.family.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !activeCategory || t.family === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchQuery, activeCategory]);

  const categories = useMemo(() => {
    const set = new Set(templates.map(t => t.family));
    return Array.from(set);
  }, [templates]);

  const toggleGallery = useCallback(() => setIsOpen(prev => !prev), []);

  const handleSelect = useCallback((template: ModuleTemplate) => {
    onSelect(template);
    setIsOpen(false);
  }, [onSelect]);

  return {
    isOpen,
    setIsOpen,
    toggleGallery,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    templates: filteredTemplates,
    categories,
    handleSelect
  };
};
