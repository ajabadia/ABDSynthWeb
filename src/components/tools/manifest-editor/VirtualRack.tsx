'use client';

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Move, Settings2, PlayCircle, AlertCircle } from 'lucide-react';
import { OMEGA_Manifest, ManifestEntity } from '../../../types/manifest';

interface VirtualRackProps {
  manifest: OMEGA_Manifest;
  contract: any;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  zoom?: number;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
}

export default function VirtualRack({ manifest, contract, selectedItemId, onSelectItem, onUpdateItem, zoom = 1.0, isLiveMode, setIsLiveMode }: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('MAIN');
  const [runtimeValues, setRuntimeValues] = useState<Record<string, number>>({});
  
  const skin = manifest.ui?.skin || 'industrial';
  const allElements = [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ];
  
  useEffect(() => {
    const initial: Record<string, number> = { ...runtimeValues };
    allElements.forEach(item => {
      if (initial[item.id] === undefined) initial[item.id] = 0.0;
    });
    setRuntimeValues(initial);
  }, [manifest]);

  const updateValue = (id: string, val: number) => {
    setRuntimeValues(prev => ({ ...prev, [id]: Math.max(0, Math.min(1, parseFloat(val.toFixed(4)))) }));
  };

  const getSteps = (item: ManifestEntity) => {
    return (item.presentation?.component === 'select' ? 16 : 100);
  };

  const getTabCount = (tab: string) => allElements.filter(item => (item.presentation?.tab || 'MAIN') === tab).length;
  const visibleElements = allElements.filter(item => (item.presentation?.tab || 'MAIN') === activeTab);
  
  const getSkinStyles = () => {
    switch (skin) {
      case 'industrial': return 'bg-[#1a1a1a] border-[#333] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-t-[#444]';
      case 'carbon': return 'bg-[#0a0a0a] border-[#222] shadow-[inset_0_0_100px_rgba(0,0,0,1)]';
      case 'glass': return 'bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl';
      case 'minimal': return 'bg-[#f0f0f0] border-[#ddd] shadow-none text-black';
      default: return 'bg-[#1a1a1a] border-[#333] shadow-[0_40px_80px_rgba(0,0,0,0.8)]';
    }
  };

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-black/40 gap-8 p-12 relative overflow-hidden transition-all duration-500 ${isLiveMode ? 'select-none' : ''}`}>
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
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
      <div ref={rackRef} className={`relative border-x-[3px] border-y-[1px] transition-all duration-700 ${getSkinStyles()} ${isLiveMode ? 'shadow-[0_0_100px_rgba(0,0,0,1)]' : ''}`} style={{ width: `${(manifest?.metadata?.rack?.hp || 12) * 15 * 1.5}px`, height: `${(manifest?.metadata?.rack?.height_mode === 'compact' ? 210 : 420) * 1.5}px` }}>
        {visibleElements.map((item: any) => (
          <DraggableElement key={item.id} item={item} contract={contract} rackRef={rackRef} zoom={zoom} isLiveMode={isLiveMode} selectedItemId={selectedItemId} onSelectItem={onSelectItem} onUpdateItem={onUpdateItem} runtimeValues={runtimeValues} steps={getSteps(item)} onUpdateValue={updateValue} />
        ))}
      </div>
    </div>
  );
}

function DraggableElement({ item, contract, rackRef, zoom, isLiveMode, selectedItemId, onSelectItem, onUpdateItem, runtimeValues, steps, onUpdateValue }: any) {
  const dragControls = useDragControls();
  const isSelected = selectedItemId === item.id && !isLiveMode;
  const value = runtimeValues[item.id] || 0;
  const skin = 'industrial'; // Default skin for primitives

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
      drag={!isLiveMode} dragControls={dragControls} dragListener={false} dragMomentum={false} dragConstraints={rackRef} dragElastic={0}
      onDragEnd={(_, info) => { if (rackRef.current) { const rect = rackRef.current.getBoundingClientRect(); onUpdateItem(item.id, { pos: { x: Math.round((info.point.x - rect.left) / (1.5 * zoom)), y: Math.round((info.point.y - rect.top) / (1.5 * zoom)) } }); } }}
      animate={{ x: (item.pos?.x || 0) * 1.5, y: (item.pos?.y || 0) * 1.5 }}
      transition={{ type: 'tween', duration: 0 }}
      style={{ position: 'absolute', left: 0, top: 0, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -32, marginTop: -32, zIndex: isSelected ? 50 : 10 }}
    >
      <div className="relative flex items-center justify-center pointer-events-none group">
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
                  onClick={() => onSelectItem(item.id)}
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
            onClick={() => onSelectItem(item.id)}
            text={item.text} role={item.role}
          />
        </div>

        {/* SELECTION UI */}
        {isSelected && !isLiveMode && (
          <>
            <div className="absolute -inset-4 border border-primary/20 border-dashed rounded-lg animate-pulse pointer-events-none" />
            <div onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }} className="absolute -top-6 -right-6 w-5 h-5 bg-primary rounded-full flex items-center justify-center cursor-move shadow-lg z-[60] active:scale-90 pointer-events-auto"><Move className="w-3 h-3 text-background" /></div>
          </>
        )}
      </div>
    </motion.div>
  );
}
