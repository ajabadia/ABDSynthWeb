'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Settings2, PlayCircle } from 'lucide-react';
import { OMEGA_Manifest, ManifestEntity } from '../../../types/manifest';
import { wasmRuntime } from '../../../services/wasmRuntime';
import { AuditResult } from '@/services/auditService';

// Modular Components
import { RackScrews } from './rack/RackScrews';
import { RackContainer } from './rack/RackContainer';
import { RackEntity } from './rack/RackEntity';
import { SignalInjector } from './rack/SignalInjector';
import { ModulationCables } from './rack/ModulationCables';

interface VirtualRackProps {
  manifest: OMEGA_Manifest;
  contract: any;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  zoom?: number;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  audit: AuditResult;
}

/**
 * VirtualRack (v7.2.3) - Refactored Orchestrator
 * High-fidelity modular instrument viewport.
 */
export default function VirtualRack({ 
  manifest, 
  contract, 
  selectedItemId, 
  onSelectItem, 
  onUpdateItem, 
  zoom = 1.0, 
  isLiveMode, 
  setIsLiveMode, 
  audit 
}: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('MAIN');
  const [runtimeValues, setRuntimeValues] = useState<Record<string, number>>({});
  const [activeContainers, setActiveContainers] = useState<Record<string, number>>({});
  const [activeInjectorPort, setActiveInjectorPort] = useState<string | null>(null);

  const skin = manifest.ui?.skin || 'industrial';
  const allElements = useMemo(() => [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ], [manifest.ui]);

  // ACTIVITY DECAY
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveContainers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[id] > 0) {
            next[id] = Math.max(0, next[id] - 0.1);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);
  
  // REAL-TIME SIMULATION LOOP
  useEffect(() => {
    let rafId: number;
    const updateLoop = () => {
      if (isLiveMode) {
        setRuntimeValues(prev => {
          const next = { ...prev };
          allElements.forEach(entity => {
            if (entity.role === 'telemetry' || entity.role === 'stream') {
              next[entity.id] = wasmRuntime.getTelemetry(entity.id);
            }
          });
          return next;
        });
      }
      rafId = requestAnimationFrame(updateLoop);
    };
    rafId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(rafId);
  }, [isLiveMode, allElements]);

  const updateValue = (id: string, val: number) => {
    const clampedVal = Math.max(0, Math.min(1, parseFloat(val.toFixed(4))));
    setRuntimeValues(prev => ({ ...prev, [id]: clampedVal }));
    wasmRuntime.setParameter(id, clampedVal);

    const element = allElements.find(e => e.id === id);
    const containerId = element?.presentation?.container;
    if (containerId) {
      setActiveContainers(prev => ({ ...prev, [containerId]: 1.0 }));
    }
  };

  const getSkinConfig = () => {
    switch (skin) {
      case 'industrial': 
      case 'dark':
        return {
          className: 'bg-[#121212] border-y-[#222] border-x-[#333] shadow-[0_60px_100px_rgba(0,0,0,0.9)]',
          style: {
            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 100%)`,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.5), 0 30px 60px rgba(0,0,0,0.5)'
          }
        };
      default: return { className: `skin-${skin}`, style: {} };
    }
  };

  const skinConfig = getSkinConfig();
  const hp = manifest?.metadata?.rack?.hp || 12;
  const isCompact = manifest?.metadata?.rack?.height_mode === 'compact';
  const width = hp * 15 * 1.5;
  const height = (isCompact ? 210 : 420) * 1.5;

  const containers = manifest.ui.layout?.containers || [];
  const visibleElements = allElements.filter(entity => {
    const containerId = entity.presentation?.container;
    const container = containers.find(c => c.id === containerId);
    if (container) return !container.tab || container.tab === activeTab;
    return (entity.presentation?.tab || 'MAIN') === activeTab;
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 gap-8 p-12 relative overflow-hidden" onClick={() => onSelectItem(null)}>
      {/* HUD OVERLAY */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50" onClick={(e) => e.stopPropagation()}>
         <div className="flex bg-black/80 border border-white/10 rounded-full p-1 shadow-2xl backdrop-blur-md">
            <button onClick={() => setIsLiveMode(false)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${!isLiveMode ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}><Settings2 className="w-3 h-3" /><span>ENGINEERING</span></button>
            <button onClick={() => setIsLiveMode(true)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${isLiveMode ? 'bg-accent text-background shadow-lg' : 'text-white/40 hover:text-white'}`}><PlayCircle className="w-3 h-3" /><span>LIVE</span></button>
         </div>
         <div className="flex gap-1 bg-black/60 p-1 rounded-full border border-white/10 shadow-2xl">
            {['MAIN', 'FX', 'EDIT', 'MIDI', 'MOD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all flex items-center gap-2 ${activeTab === t ? (isLiveMode ? 'bg-accent text-background' : 'bg-primary text-background') : 'text-white/40 hover:text-white'}`}>
                <span>{t}</span>{!isLiveMode && <span className={`px-1.5 rounded-full text-[7px] ${activeTab === t ? 'bg-background text-primary' : 'bg-white/10 text-white/40'}`}>{allElements.filter(i => (i.presentation?.tab || 'MAIN') === t).length}</span>}
              </button>
            ))}
         </div>
      </div>

      {/* RACK FRAME */}
      <div 
        ref={rackRef} 
        className={`relative border-x-[4px] border-y-[1px] transition-all duration-700 ${skinConfig.className} ${isLiveMode ? 'shadow-[0_0_120px_rgba(0,0,0,1)]' : ''}`}
        style={{ ...skinConfig.style, width: `${width}px`, height: `${height}px` }}
        onClick={(e) => { e.stopPropagation(); onSelectItem(null); }}
      >
        <RackScrews skin={skin} />

        {/* ARCHITECTURAL PLANES */}
        {containers.filter(c => !c.tab || c.tab === activeTab).map((c) => (
          <RackContainer key={c.id} container={c} isSelected={allElements.some(e => e.id === selectedItemId && (e.presentation?.container === c.id || e.presentation?.group === c.id))} activeContainers={activeContainers} audit={audit} skin={skin} rackWidthPx={width} />
        ))}

        <ModulationCables manifest={manifest} allElements={allElements} activeTab={activeTab} />

        {/* ENTITIES LAYER */}
        {visibleElements.map((item) => (
          <RackEntity 
            key={item.id} item={item} contract={contract} rackRef={rackRef} zoom={zoom} isLiveMode={isLiveMode} 
            selectedItemId={selectedItemId} onSelectItem={onSelectItem} onUpdateItem={onUpdateItem} 
            runtimeValue={runtimeValues[item.id] || 0} steps={item.presentation?.component === 'select' ? 16 : 100} 
            onUpdateValue={updateValue} onPortClick={setActiveInjectorPort} audit={audit} skin={skin} 
          />
        ))}

        {activeInjectorPort && <SignalInjector portId={activeInjectorPort} onClose={() => setActiveInjectorPort(null)} />}
      </div>
    </div>
  );
}
