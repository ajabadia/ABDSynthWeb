'use client';

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Move, Settings2, PlayCircle, AlertCircle } from 'lucide-react';
import { OMEGA_Manifest, ManifestEntity } from '../../../types/manifest';
import { wasmRuntime } from '../../../services/wasmRuntime';
import { inputSignalService, SignalType } from '../../../services/inputSignalService';
import { Waves, Zap, X, Activity } from 'lucide-react';
import PrimitiveFactory from './primitives/PrimitiveFactory';
import SignalScope from './primitives/SignalScope';

interface VirtualRackProps {
  manifest: OMEGA_Manifest;
  contract: any;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  zoom?: number;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
}

export default function VirtualRack({ manifest, contract, selectedItemId, onSelectItem, onUpdateItem, zoom = 1.0, isLiveMode, setIsLiveMode }: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('MAIN');
  const [runtimeValues, setRuntimeValues] = useState<Record<string, number>>({});
  const [activeInjectorPort, setActiveInjectorPort] = useState<string | null>(null);
  
  const skin = manifest.ui?.skin || 'industrial';
  const allElements = [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ];
  
  // REAL-TIME SIMULATION LOOP (ERA 7.1 TELEMETRY)
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
  };

  const getSteps = (item: ManifestEntity) => {
    return (item.presentation?.component === 'select' ? 16 : 100);
  };

  const getTabCount = (tab: string) => allElements.filter(item => (item.presentation?.tab || 'MAIN') === tab).length;
  const visibleElements = allElements.filter(item => (item.presentation?.tab || 'MAIN') === activeTab);
  
  const getSkinConfig = () => {
    switch (skin) {
      case 'industrial': 
      case 'dark':
        return {
          className: 'bg-[#121212] border-y-[#222] border-x-[#333] shadow-[0_60px_100px_rgba(0,0,0,0.9)]',
          style: {
            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%), 
                             radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 100%)`,
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.5), 0 30px 60px rgba(0,0,0,0.5)'
          }
        };
      case 'silver':
      case 'minimal':
        return {
          className: 'bg-[#d0d0d0] border-y-[#999] border-x-[#bbb] shadow-[0_40px_80px_rgba(0,0,0,0.4)] text-black',
          style: {
            backgroundImage: `linear-gradient(to right, #ccc 0%, #eee 10%, #ddd 20%, #eee 30%, #ccc 40%, #eee 50%, #ddd 60%, #eee 70%, #ccc 80%, #eee 90%, #ccc 100%)`,
            backgroundSize: '200% 100%',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.2), 0 20px 40px rgba(0,0,0,0.3)'
          }
        };
      case 'carbon':
        return {
          className: 'bg-[#0a0a0a] border-[#222] shadow-[inset_0_0_100px_rgba(0,0,0,1)]',
          style: { backgroundImage: 'repeating-linear-gradient(45deg, #111 0px, #111 2px, #080808 2px, #080808 4px)' }
        };
      default:
        return { className: 'bg-[#1a1a1a] border-[#333]', style: {} };
    }
  };

  const skinConfig = getSkinConfig();
  const hp = manifest?.metadata?.rack?.hp || 12;
  const isCompact = manifest?.metadata?.rack?.height_mode === 'compact';
  const width = hp * 15 * 1.5;
  const height = (isCompact ? 210 : 420) * 1.5;

  return (
    <div 
      className={`w-full h-full flex flex-col items-center justify-center bg-black/40 gap-8 p-12 relative overflow-hidden transition-all duration-500 ${isLiveMode ? 'select-none' : ''}`}
      onClick={() => onSelectItem(null)}
    >
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50" onClick={(e) => e.stopPropagation()}>
         <div className="flex bg-black/80 border border-white/10 rounded-full p-1 shadow-2xl backdrop-blur-md">
            <button onClick={() => setIsLiveMode(false)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${!isLiveMode ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}><Settings2 className="w-3 h-3" /><span>ENGINEERING</span></button>
            <button onClick={() => setIsLiveMode(true)} className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${isLiveMode ? 'bg-accent text-background shadow-lg' : 'text-white/40 hover:text-white'}`}><PlayCircle className="w-3 h-3" /><span>LIVE</span></button>
         </div>
         <div className="flex gap-1 bg-black/60 p-1 rounded-full border border-white/10 shadow-2xl">
            {['MAIN', 'FX', 'EDIT', 'MIDI', 'MOD'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all flex items-center gap-2 ${activeTab === t ? (isLiveMode ? 'bg-accent text-background' : 'bg-primary text-background') : 'text-white/40 hover:text-white'}`}>
                <span>{t}</span>{!isLiveMode && <span className={`px-1.5 rounded-full text-[7px] ${activeTab === t ? 'bg-background text-primary' : 'bg-white/10 text-white/40'}`}>{getTabCount(t)}</span>}
              </button>
            ))}
         </div>
      </div>

      <div 
        ref={rackRef} 
        className={`relative border-x-[4px] border-y-[1px] transition-all duration-700 ${skinConfig.className} ${isLiveMode ? 'shadow-[0_0_120px_rgba(0,0,0,1)]' : ''}`}
        style={{ ...skinConfig.style, width: `${width}px`, height: `${height}px` }}
        onClick={(e) => { e.stopPropagation(); onSelectItem(null); }}
      >
        {/* VISUAL GROUPS (ERA 7.1 BOUNDARIES) */}
        {(() => {
          const groups: Record<string, { minX: number, minY: number, maxX: number, maxY: number }> = {};
          allElements.forEach((it: any) => {
            const gid = it.presentation?.group;
            if (!gid) return;
            const x = (it.pos?.x || 0) * 1.5;
            const y = (it.pos?.y || 0) * 1.5;
            if (!groups[gid]) {
              groups[gid] = { minX: x, minY: y, maxX: x, maxY: y };
            } else {
              groups[gid].minX = Math.min(groups[gid].minX, x);
              groups[gid].minY = Math.min(groups[gid].minY, y);
              groups[gid].maxX = Math.max(groups[gid].maxX, x);
              groups[gid].maxY = Math.max(groups[gid].maxY, y);
            }
          });

          return Object.entries(groups).map(([id, b]) => {
            const padding = 45;
            const gx = b.minX - padding;
            const gy = b.minY - padding;
            const gw = (b.maxX - b.minX) + (padding * 2);
            const gh = (b.maxY - b.minY) + (padding * 2);

            return (
              <motion.div
                key={`group-${id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute border border-white/5 bg-white/[0.02] rounded-xs pointer-events-none"
                style={{ left: gx, top: gy, width: gw, height: gh }}
              >
                <div className="absolute -top-3 left-2 px-1.5 py-0.5 bg-black/60 border border-white/10 rounded-full text-[6px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                  Group: {id}
                </div>
              </motion.div>
            );
          });
        })()}

        {/* INDUSTRIAL MOUNTING SCREWS */}
        {[
          { top: 12, left: 12 }, { top: 12, right: 12 },
          { bottom: 12, left: 12 }, { bottom: 12, right: 12 }
        ].map((pos, i) => (
          <div 
            key={i} 
            className="absolute w-4 h-4 rounded-full flex items-center justify-center shadow-inner z-30"
            style={{ 
              ...pos, 
              background: skin === 'silver' ? 'radial-gradient(circle at 30% 30%, #eee, #888)' : 'radial-gradient(circle at 30% 30%, #444, #111)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
          >
            <div className={`w-0.5 h-2 rotate-45 rounded-full ${skin === 'silver' ? 'bg-black/20' : 'bg-white/10'}`} />
            <div className={`absolute w-0.5 h-2 -rotate-45 rounded-full ${skin === 'silver' ? 'bg-black/20' : 'bg-white/10'}`} />
          </div>
        ))}

        {/* RAIL OVERLAYS (Eurorack simulated rails) */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-20" />

        {/* MODULATION CABLES LAYER */}
        {activeTab === 'MOD' && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
            {(manifest.modulations || []).map((mod) => {
              const src = allElements.find(e => e.id === mod.source);
              const tgt = allElements.find(e => e.id === mod.target);
              if (!src || !tgt) return null;

              return (
                <g key={mod.id}>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.6 }}
                    d={`M ${src.pos.x * 1.5} ${src.pos.y * 1.5} C ${(src.pos.x + 20) * 1.5} ${src.pos.y * 1.5}, ${(tgt.pos.x - 20) * 1.5} ${tgt.pos.y * 1.5}, ${tgt.pos.x * 1.5} ${tgt.pos.y * 1.5}`}
                    fill="none"
                    stroke="cyan"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                  />
                  <motion.circle 
                    cx={src.pos.x * 1.5} cy={src.pos.y * 1.5} r="3" fill="cyan" 
                    animate={{ r: [3, 5, 3] }} transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.circle cx={tgt.pos.x * 1.5} cy={tgt.pos.y * 1.5} r="3" fill="cyan" />
                </g>
              );
            })}
          </svg>
        )}

        {visibleElements.map((item: any) => (
          <DraggableElement key={item.id} item={item} contract={contract} rackRef={rackRef} zoom={zoom} isLiveMode={isLiveMode} selectedItemId={selectedItemId} onSelectItem={onSelectItem} onUpdateItem={onUpdateItem} runtimeValues={runtimeValues} steps={getSteps(item)} onUpdateValue={updateValue} onPortClick={(id: string) => setActiveInjectorPort(id)} />
        ))}

        {activeInjectorPort && (
          <SignalInjector portId={activeInjectorPort} onClose={() => setActiveInjectorPort(null)} />
        )}
      </div>
    </div>
  );
}

/**
 * SignalInjector
 * Floating industrial UI to configure virtual signal injection.
 */
function SignalInjector({ portId, onClose }: { portId: string, onClose: () => void }) {
  const current = inputSignalService.getActiveSignal(portId);
  const [sig, setSig] = useState(current || { type: 'sine' as SignalType, frequency: 440, amplitude: 0.5, offset: 0 });

  const update = (updates: any) => {
    const next = { ...sig, ...updates };
    setSig(next);
    inputSignalService.setSignal(portId, next);
  };

  const remove = () => {
    inputSignalService.setSignal(portId, null);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-black/90 backdrop-blur-xl border border-primary/30 rounded-xs shadow-[0_0_50px_rgba(0,255,157,0.2)] z-[200] p-4 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Signal Injector</span>
        </div>
        <button onClick={onClose} className="text-white/20 hover:text-white"><X className="w-3 h-3" /></button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {(['sine', 'square', 'saw', 'noise', 'lfo_slow', 'static'] as SignalType[]).map(t => (
          <button 
            key={t}
            onClick={() => update({ type: t })}
            className={`py-1.5 rounded-xs text-[7px] font-bold uppercase transition-all border ${sig.type === t ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'}`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <div className="space-y-1">
           <div className="flex justify-between text-[7px] font-black uppercase opacity-40">
             <span>Frequency</span>
             <span>{sig.frequency} Hz</span>
           </div>
           <input type="range" min="1" max="2000" value={sig.frequency} onChange={e => update({ frequency: parseInt(e.target.value) })} className="w-full accent-primary h-1" />
        </div>
        <div className="space-y-1">
           <div className="flex justify-between text-[7px] font-black uppercase opacity-40">
             <span>Amplitude</span>
             <span>{(sig.amplitude * 100).toFixed(0)}%</span>
           </div>
           <input type="range" min="0" max="1" step="0.01" value={sig.amplitude} onChange={e => update({ amplitude: parseFloat(e.target.value) })} className="w-full accent-primary h-1" />
        </div>
      </div>

      <button onClick={remove} className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all rounded-xs">
        Kill Signal
      </button>
    </motion.div>
  );
}

function DraggableElement({ item, contract, rackRef, zoom, isLiveMode, selectedItemId, onSelectItem, onUpdateItem, runtimeValues, steps, onUpdateValue, onPortClick }: any) {
  const dragControls = useDragControls();
  const isSelected = selectedItemId === item.id && !isLiveMode;
  const value = runtimeValues[item.id] || 0;
  const skin = 'industrial'; // Default skin for primitives

  const isJack = item.isJack || item.presentation?.component === 'port' || item.type === 'port';

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLiveMode && isJack) {
      onPortClick(item.id);
    } else {
      onSelectItem(item.id);
    }
  };

  // ORPHAN DETECTION (ERA 4 GOVERNANCE)
  const isEra7 = true; // For now default
  const hasRole = !!item.role;
  const isBound = !!item.bind;
  
  const contractIds = contract ? [
    ...(contract.parameters?.map((p: any) => p.id) || []),
    ...(contract.ports?.map((p: any) => p.id) || [])
  ] : [];

  const isOrphan = (isEra7 && !hasRole) || (isBound && !contractIds.includes(item.bind));

  return (
    <motion.div
      drag={!isLiveMode} dragControls={dragControls} dragMomentum={false} dragConstraints={rackRef} dragElastic={0}
      onDragEnd={(_, info) => { if (rackRef.current) { const rect = rackRef.current.getBoundingClientRect(); onUpdateItem(item.id, { pos: { x: Math.round((info.point.x - rect.left) / (1.5 * zoom)), y: Math.round((info.point.y - rect.top) / (1.5 * zoom)) } }); } }}
      animate={{ x: (item.pos?.x || 0) * 1.5, y: (item.pos?.y || 0) * 1.5 }}
      transition={{ type: 'tween', duration: 0 }}
      style={{ position: 'absolute', left: 0, top: 0, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -32, marginTop: -32, zIndex: isSelected ? 50 : 10, cursor: isLiveMode ? 'pointer' : 'grab' }}
    >
      <div className="relative w-full h-full flex items-center justify-center group">
        {/* INTERACTION OVERLAY (Era 7.1 Selection & Drag Logic) */}
        {!isLiveMode && (
          <div 
            className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing" 
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelectItem(item.id);
              dragControls.start(e);
            }}
          />
        )}
        {/* ORPHAN WARNING AURA */}
        {isOrphan && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-red-500/20 rounded-full blur-xl pointer-events-none"
            />
            {/* DIAGNOSTIC TOOLTIP */}
            <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]">
               <div className="bg-red-600 text-white px-3 py-1.5 rounded-xs shadow-2xl border border-red-400/40 flex flex-col gap-1 min-w-[140px]">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-1">
                     <AlertCircle className="w-3 h-3" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Orphan Detected</span>
                  </div>
                  <span className="text-[7px] font-bold uppercase leading-tight">
                    {(!hasRole) ? '• Missing Registry Role' : ''}
                    {(isBound && !contractIds.includes(item.bind)) ? '\n• Binding ID not in contract' : ''}
                  </span>
               </div>
               <div className="w-2 h-2 bg-red-600 rotate-45 mx-auto -mt-1 border-r border-b border-red-400/40" />
            </div>
          </>
        )}
        {/* ATTACHMENTS LAYER */}
        <div className="absolute inset-0 pointer-events-auto">
          {(item.presentation?.attachments || []).map((att: any, idx: number) => {
            const posClasses: any = { top: 'bottom-full left-1/2 -translate-x-1/2 mb-1', bottom: 'top-full left-1/2 -translate-x-1/2 mt-1', left: 'right-full top-1/2 -translate-y-1/2 mr-2', right: 'left-full top-1/2 -translate-y-1/2 ml-2' };
            return (
              <div key={idx} className={`absolute ${posClasses[att.position] || ''}`} style={{ transform: `translate(${(att.offsetX || 0) * 1.5}px, ${(att.offsetY || 0) * 1.5}px)` }}>
                <PrimitiveFactory 
                  type={att.type} value={value} steps={steps} variant={att.variant || 'B_cyan'} skin={skin} item={att} 
                  onValueChange={(val) => {/* No-op for decorative attachments usually */}} 
                  onClick={handleClick}
                  text={att.text} role={att.role}
                />
              </div>
            );
          })}
        </div>

        {/* CORE COMPONENT LAYER */}
        <div className="pointer-events-auto" style={{ transform: `translate(${(item.presentation?.offsetX || 0) * 1.5}px, ${(item.presentation?.offsetY || 0) * 1.5}px)` }}>
          <PrimitiveFactory 
            type={item.presentation?.component || (item.isJack ? 'port' : 'knob')} 
            value={value} steps={steps} variant={item.presentation?.variant || 'B_cyan'} skin={skin} isMain={true} isSelected={isSelected} item={item}
            onValueChange={(val) => onUpdateValue(item.id, val)}
            onClick={handleClick}
            text={item.text} role={item.role}
          />
          {isLiveMode && isJack && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2">
              <SignalScope value={value} color={item.role === 'stream' ? '#00ccff' : '#00ff9d'} />
            </div>
          )}
        </div>

        {/* SELECTION UI */}
        {isSelected && !isLiveMode && (
          <div className="absolute -inset-4 border border-primary/20 border-dashed rounded-lg animate-pulse pointer-events-none" />
        )}
      </div>
    </motion.div>
  );
}
