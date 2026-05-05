'use client';

import React, { useRef, useMemo } from 'react';
import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';

// Modular Components & Hooks
import { RackScrews } from './rack/RackScrews';
import { RackContainer } from './rack/RackContainer';
import { RackEntity } from './rack/RackEntity';
import { SignalInjector } from './rack/SignalInjector';
import { ModulationCables } from './rack/ModulationCables';
import { RackHUD } from './rack/RackHUD';
import { useRackSimulation } from '@/hooks/manifest-editor/rack/useRackSimulation';

interface VirtualRackProps {
  manifest: OMEGA_Manifest;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  zoom?: number;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  audit: AuditResult;
  activeTab: string;
  setActiveTab: (val: string) => void;
}

/**
 * VirtualRack (v7.2.3) - Refactored Orchestrator
 * High-fidelity modular instrument viewport.
 */
export default function VirtualRack({ 
  manifest, 
  selectedItemId, 
  onSelectItem, 
  onUpdateItem, 
  zoom = 1.0, 
  isLiveMode, 
  setIsLiveMode, 
  audit,
  activeTab,
  setActiveTab
}: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  
  const skin = manifest.ui?.skin || 'industrial';
  const allElements = useMemo(() => [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ], [manifest.ui]);

  const { 
    runtimeValues, 
    activeContainers, 
    activeInjectorPort, 
    setActiveInjectorPort 
  } = useRackSimulation(allElements, isLiveMode);

  const getSkinConfig = () => {
    return { className: `skin-${skin}`, style: {} };
  };

  const skinConfig = getSkinConfig();
  const hp = manifest?.metadata?.rack?.hp || 12;
  const isCompact = manifest?.metadata?.rack?.height_mode === 'compact';
  const width = hp * 15 * 1.5;
  const height = (manifest.ui?.dimensions?.height || (isCompact ? 140 : 420)) * 1.5;

  const containers = manifest.ui.layout?.containers || [];
  const visibleElements = allElements.filter(entity => {
    const containerId = entity.presentation?.container;
    const container = containers.find(c => c.id === containerId);
    if (container) {
      if (container.collapsed) return false;
      return !container.tab || container.tab === activeTab;
    }
    return (entity.presentation?.tab || 'MAIN') === activeTab;
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-12 relative overflow-hidden" onClick={() => onSelectItem(null)}>
      <RackHUD 
        isLiveMode={isLiveMode} 
        setIsLiveMode={setIsLiveMode} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        allElements={allElements} 
      />

      {/* RACK FRAME */}
      <div 
        ref={rackRef} 
        className={`relative border-x-[4px] border-y-[1px] transition-all duration-700 ${skinConfig.className} ${isLiveMode ? 'shadow-[0_0_120px_rgba(0,0,0,1)]' : ''}`}
        style={{ ...skinConfig.style, width: `${width}px`, height: `${height}px` }}
        onClick={(e) => { e.stopPropagation(); onSelectItem(null); }}
      >
        <RackScrews />

        {/* ARCHITECTURAL PLANES */}
        {containers.filter(c => !c.tab || c.tab === activeTab).map((c) => (
          <RackContainer 
            key={c.id} 
            container={c} 
            isSelected={allElements.some(e => e.id === selectedItemId && (e.presentation?.container === c.id || e.presentation?.group === c.id))} 
            activeContainers={activeContainers} 
            audit={audit} 
            skin={skin} 
            rackWidthPx={width}
          />
        ))}

        <ModulationCables manifest={manifest} allElements={allElements} activeTab={activeTab} />

        {/* ENTITIES LAYER */}
        {visibleElements.map((item) => (
          <RackEntity 
            key={item.id} item={item} rackRef={rackRef} zoom={zoom} isLiveMode={isLiveMode} 
            selectedItemId={selectedItemId} onSelectItem={onSelectItem} onUpdateItem={onUpdateItem} 
            runtimeValue={runtimeValues[item.id] || 0} steps={item.presentation?.component === 'select' ? 16 : 100} 
            onPortClick={setActiveInjectorPort} audit={audit} skin={skin} 
          />
        ))}

        {activeInjectorPort && <SignalInjector portId={activeInjectorPort} onClose={() => setActiveInjectorPort(null)} />}
      </div>
    </div>
  );
}
