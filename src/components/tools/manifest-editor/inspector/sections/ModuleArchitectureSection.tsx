'use client';
 
import React, { useState } from 'react';
import { Layout, Settings2, Zap, Move, Image } from 'lucide-react';
import { OMEGA_Manifest, LayoutContainer, OMEGA_Modulation, ExtraResource } from '@/types/manifest';
import ContainerSection from './ContainerSection';
import EntityListSection from './EntityListSection';
import ModulationSection from './ModulationSection';
import ResourceSection from './ResourceSection';
 
interface ModuleArchitectureSectionProps {
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<OMEGA_Manifest>) => void;
  addContainer: (c?: Partial<LayoutContainer>) => void;
  updateContainer: (id: string, updates: Partial<LayoutContainer>) => void;
  removeContainer: (id: string) => void;
  onSelectItem: (id: string | null) => void;
  onAddEntity: (type: 'control' | 'jack') => void;
  onDuplicateItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddModulation: (mod: OMEGA_Modulation) => void;
  onRemoveModulation: (id: string) => void;
  onUpdateModulation: (id: string, updates: Partial<OMEGA_Modulation>) => void;
  onOpenModGrid: () => void;
  extraResources?: ExtraResource[];
  onTriggerUpload?: () => void;
  onRemoveResource?: (name: string) => void;
  highlightPath?: string | null;
  setActiveSection?: (sectionId: string) => void;
  onOpenLibrary?: () => void;
}
 
export default function ModuleArchitectureSection({
  manifest,
  addContainer,
  updateContainer,
  removeContainer,
  onSelectItem,
  onAddEntity,
  onDuplicateItem,
  onRemoveItem,
  onAddModulation,
  onRemoveModulation,
  onUpdateModulation,
  onOpenModGrid,
  extraResources,
  onTriggerUpload,
  onRemoveResource,
  highlightPath,
  onUpdate,
  setActiveSection
}: ModuleArchitectureSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'infra' | 'controls' | 'ports' | 'routing' | 'assets'>('infra');
 
  const subTabs = [
    { id: 'infra', label: 'Infrastructure', icon: Layout, color: 'text-accent' },
    { id: 'controls', label: 'Controls', icon: Settings2, color: 'text-amber-400' },
    { id: 'ports', label: 'Signal I/O', icon: Zap, color: 'text-cyan-400' },
    { id: 'routing', label: 'Routing', icon: Move, color: 'text-blue-400' },
    { id: 'assets', label: 'Assets', icon: Image, color: 'text-purple-400' },
  ] as const;
 
  return (
    <div className="flex flex-col h-full">
      {/* UCA EXPERIMENTAL TOGGLE */}
      <div className="mb-4 p-2 bg-amber-500/5 border border-amber-500/20 rounded-xs flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase text-amber-500 tracking-widest">UCA Architecture</span>
          <span className="text-[6px] text-amber-500/60 font-medium">Recursive composite engine (Experimental)</span>
        </div>
        <button
          onClick={() => onUpdate({ ui: { ...manifest.ui, useUCA: !manifest.ui?.useUCA } })}
          className={`px-3 py-1 text-[8px] font-black uppercase rounded-full border transition-all ${
            manifest.ui?.useUCA 
              ? 'bg-amber-500 border-amber-500 text-black' 
              : 'border-amber-500/30 text-amber-500/50 hover:bg-amber-500/10'
          }`}
        >
          {manifest.ui?.useUCA ? 'ACTIVE' : 'STABLE'}
        </button>
      </div>

      {/* SUB-NAVIGATION */}
      <div className="flex gap-1 mb-6 bg-black/20 p-1 rounded-xs border wb-outline shrink-0">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex-1 py-1.5 flex flex-col items-center gap-1 rounded-xs transition-all ${
              activeSubTab === tab.id 
                ? 'bg-primary/10 border border-primary/20 text-primary' 
                : 'wb-text-muted hover:wb-text hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className={`w-3 h-3 ${activeSubTab === tab.id ? tab.color : ''}`} />
            <span className="text-[6px] font-black uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>
 
      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {activeSubTab === 'infra' && (
          <ContainerSection 
            containers={manifest.ui.layout?.containers || []} 
            manifest={manifest} 
            onAdd={addContainer} 
            onUpdate={updateContainer} 
            onRemove={removeContainer} 
            highlightPath={highlightPath} 
            setActiveSection={setActiveSection}
          />
        )}
        
        {activeSubTab === 'controls' && (
          <EntityListSection 
            items={manifest.ui?.controls || []} 
            title="Interactive Controls" 
            type="control" 
            onSelectItem={onSelectItem} 
            onAddEntity={onAddEntity} 
            onDuplicateItem={onDuplicateItem} 
            onRemoveItem={onRemoveItem} 
            manifest={manifest} 
          />
        )}
 
        {activeSubTab === 'ports' && (
          <EntityListSection 
            items={manifest.ui?.jacks || []} 
            title="Signal Ports / Jacks" 
            type="jack" 
            onSelectItem={onSelectItem} 
            onAddEntity={onAddEntity} 
            onDuplicateItem={onDuplicateItem} 
            onRemoveItem={onRemoveItem} 
            manifest={manifest} 
          />
        )}
 
        {activeSubTab === 'routing' && (
          <ModulationSection 
            manifest={manifest} 
            onAdd={onAddModulation} 
            onRemove={onRemoveModulation} 
            onUpdate={onUpdateModulation} 
            onOpenModGrid={onOpenModGrid} 
          />
        )}
 
        {activeSubTab === 'assets' && extraResources && (
          <ResourceSection 
            resources={extraResources} 
            onTriggerUpload={onTriggerUpload || (() => {})} 
            onRemove={onRemoveResource || (() => {})} 
          />
        )}
      </div>
    </div>
  );
}
