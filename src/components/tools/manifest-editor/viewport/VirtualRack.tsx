'use client';

import React, { useRef } from 'react';
import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';

// Modular Components & Hooks
import { RackScrews } from '../rack/RackScrews';
import { RackContainer } from '../rack/RackContainer';
import { RackEntity } from '../rack/RackEntity';
import { SignalInjector } from '../rack/SignalInjector';
import { ModulationCables } from '../rack/ModulationCables';
import { RackHUD } from '../rack/RackHUD';
import { useRackSimulation } from '@/hooks/manifest-editor/rack/useRackSimulation';
import { useRackLayout } from '@/hooks/manifest-editor/rack/useRackLayout';
 
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
  resolveAsset?: (ref: string | undefined) => string | undefined;
}
 
/**
 * VirtualRack (v7.2.3) - Aseptic Orchestrator
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
  setActiveTab,
  resolveAsset
}: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  const skin = manifest.ui?.skin || 'industrial';
  
  // ASEPTIC LAYOUT & SIMULATION
  const { width, height, allElements, visibleElements, containers } = useRackLayout(manifest, activeTab);
  const { runtimeValues, activeContainers, activeInjectorPort, setActiveInjectorPort } = useRackSimulation(allElements, isLiveMode);
 
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-8 p-12 relative overflow-hidden" onClick={() => onSelectItem(null)}>
      <RackHUD 
        isLiveMode={isLiveMode} 
        setIsLiveMode={setIsLiveMode} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        allElements={allElements} 
      />
 
      {/* RACK FRAME (1.5x INDUSTRIAL SCALE) */}
      <div 
        ref={rackRef} 
        className={`relative border-x-[4px] border-y-[1px] transition-all duration-700 skin-${skin} ${isLiveMode ? 'shadow-[0_0_120px_rgba(0,0,0,1)]' : ''}`}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={(e) => { e.stopPropagation(); onSelectItem(null); }}
      >
        <RackScrews />
 
        {/* ARCHITECTURAL PLANES */}
        {containers.filter(c => !c.tab || c.tab === activeTab).map((c) => (
          <RackContainer 
            key={c.id} 
            container={c} 
            isSelected={allElements.some(e => e.id === selectedItemId && e.presentation?.container === c.id)} 
            activeContainers={activeContainers} 
            audit={audit} 
            skin={skin} 
            rackWidthPx={width}
            resolveAsset={resolveAsset}
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
            resolveAsset={resolveAsset} manifest={manifest}
          />
        ))}
 
        {activeInjectorPort && <SignalInjector portId={activeInjectorPort} onClose={() => setActiveInjectorPort(null)} />}
      </div>
    </div>
  );
}
