'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface VirtualRackProps {
  manifest: any;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onUpdateItem: (id: string, updates: any) => void;
  zoom?: number;
}

export default function VirtualRack({ manifest, selectedItemId, onSelectItem, onUpdateItem, zoom = 1.0 }: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('MAIN');
  const dragStartPoint = useRef({ x: 0, y: 0 });
  
  // MOCK ENGINE STATE
  const [runtimeValues, setRuntimeValues] = useState<Record<string, number>>({});
  
  const controls = manifest?.ui?.controls || [];
  const jacks = manifest?.ui?.jacks || [];
  const allElements = [
    ...controls.map((c: any) => ({ ...c, isJack: false })),
    ...jacks.map((j: any) => ({ ...j, isJack: true }))
  ];
  
  useEffect(() => {
    const initial: Record<string, number> = { ...runtimeValues };
    allElements.forEach(item => {
      if (initial[item.id] === undefined) {
        initial[item.id] = 0.0;
      }
    });
    setRuntimeValues(initial);
  }, [manifest]);

  // HELPER: Get the number of discrete steps for a component
  const getComponentSteps = (item: any) => {
    const labels = item.presentation?.variant_labels || [];
    if (labels.length > 0) return labels.length - 1;
    if (item.presentation?.component === 'select') return 16;
    return 100;
  };

  const updateRuntimeValue = (id: string, delta: number, isDiscrete: boolean = false, steps: number = 100) => {
    setRuntimeValues(prev => {
      const current = prev[id] || 0;
      let next;
      
      if (isDiscrete) {
        // Jump exactly delta steps (usually 1, but can be user-defined)
        const stepSize = 1 / steps;
        next = current + (delta * stepSize);
      } else {
        next = current + delta;
      }
      
      return {
        ...prev,
        [id]: Math.max(0, Math.min(1, parseFloat(next.toFixed(4))))
      };
    });
  };

  const getTabCount = (tab: string) => {
    return allElements.filter(item => (item.presentation?.tab || 'MAIN') === tab).length;
  };

  const visibleElements = allElements.filter(item => (item.presentation?.tab || 'MAIN') === activeTab);
  
  const rackSettings = manifest?.metadata?.rack || {};
  const skin = manifest?.ui?.skin || 'industrial';
  const isCompact = rackSettings.height_mode === 'compact';
  const hp = rackSettings.hp || 12;
  const displayWidth = hp * 15;
  const displayHeight = isCompact ? 210 : 420;

  const getSkinStyles = () => {
    switch (skin) {
      case 'carbon': return 'bg-[#0a0a0a] border-[#222] shadow-[inset_0_0_100px_rgba(0,0,0,1)]';
      case 'glass': return 'bg-white/5 backdrop-blur-xl border-white/20 shadow-2xl';
      case 'minimal': return 'bg-[#f0f0f0] border-[#ddd] shadow-none text-black';
      case 'industrial':
      default: return 'bg-[#1a1a1a] border-[#333] shadow-[0_40px_80px_rgba(0,0,0,0.8)]';
    }
  };

  const getSizeScale = (variant: string) => {
    const size = variant ? variant.charAt(0) : 'B';
    switch (size) {
      case 'A': return 1.5;
      case 'C': return 0.75;
      case 'D': return 0.5;
      default: return 1.0;
    }
  };

  const renderAttachment = (att: any, parentItem: any, scale: number, index: number) => {
    const offset = att.offset || 0;
    const value = runtimeValues[parentItem.id] || 0;
    const steps = getComponentSteps(parentItem);
    
    const posClasses: Record<string, string> = {
      top: `bottom-full left-1/2 -translate-x-1/2`,
      bottom: `top-full left-1/2 -translate-x-1/2`,
      left: `right-full top-1/2 -translate-y-1/2`,
      right: `left-full top-1/2 -translate-y-1/2`
    };

    const marginStyle: React.CSSProperties = {};
    if (att.position === 'top') marginStyle.marginBottom = `${4 + offset}px`;
    if (att.position === 'bottom') marginStyle.marginTop = `${4 + offset}px`;
    if (att.position === 'left') marginStyle.marginRight = `${8 + offset}px`;
    if (att.position === 'right') marginStyle.marginLeft = `${8 + offset}px`;

    const key = `${parentItem.id}-att-${index}`;

    switch (att.type) {
      case 'led':
        const color = att.role === 'activity' ? '#00f0ff' : att.role === 'gate' ? '#ff8c00' : '#ff4444';
        return (
          <div key={key} className={`absolute ${posClasses[att.position] || ''} pointer-events-none`} style={marginStyle}>
            <div 
              style={{ 
                backgroundColor: color, 
                boxShadow: `0 0 ${5 + (value * 10)}px ${color}`,
                opacity: 0.3 + (value * 0.7) 
              }} 
              className="w-1.5 h-1.5 rounded-full border border-white/20 transition-all duration-75" 
            />
          </div>
        );
      case 'display':
        return (
          <div key={key} className={`absolute ${posClasses[att.position] || ''} bg-black border border-primary/30 px-1.5 py-0.5 rounded-xs flex flex-col items-center min-w-[28px] pointer-events-none shadow-[0_0_10px_rgba(0,240,255,0.1)]`} style={marginStyle}>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[6px] font-mono text-primary font-bold leading-none tracking-tighter">
                {Math.round(value * steps)}
              </span>
            </div>
          </div>
        );
      case 'stepper':
        const stepAmount = att.amount || 1;
        // USE THE LITERAL OR FALLBACK
        const label = att.text || (stepAmount > 0 ? '+' : '-');
        
        return (
          <div 
            key={key} 
            onClick={(e) => {
              e.stopPropagation();
              // USE THE SIGNED AMOUNT DIRECTLY
              updateRuntimeValue(parentItem.id, stepAmount, true, steps);
            }}
            className={`absolute ${posClasses[att.position] || ''} bg-black/60 border border-accent/40 w-5 h-5 rounded-xs flex items-center justify-center cursor-pointer shadow-lg active:scale-90 hover:bg-accent/20 pointer-events-auto transition-all`} 
            style={marginStyle}
          >
            <span className="text-[10px] font-black text-accent leading-none select-none">{label}</span>
          </div>
        );
      default:
        return (
          <div key={key} className={`absolute ${posClasses[att.position] || ''} text-[6px] font-bold uppercase whitespace-nowrap tracking-widest text-white/40 bg-black/40 px-1 py-0.5 rounded-xs pointer-events-none`} style={marginStyle}>
            {att.text || parentItem.label || parentItem.id}
          </div>
        );
    }
  };

  const renderMainComponent = (item: any, scale: number) => {
    const componentType = item.presentation?.component || (item.isJack ? 'port' : 'knob');
    const isSelected = selectedItemId === item.id;
    const value = runtimeValues[item.id] || 0;
    const steps = getComponentSteps(item);
    
    switch (componentType) {
      case 'display':
        return (
          <div style={{ width: `${80 * scale}px`, height: `${28 * scale}px` }} className="bg-black border-2 border-outline/40 rounded-sm flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <span className="text-[12px] font-mono text-primary font-black tracking-tighter tabular-nums">
              {Math.round(value * steps)}
            </span>
          </div>
        );
      case 'select':
        return (
          <div style={{ width: `${64 * scale}px`, height: `${20 * scale}px` }} className="bg-black border border-outline rounded-xs flex items-center justify-between px-2 group hover:border-primary transition-colors">
            <span className="text-[7px] font-mono text-primary truncate max-w-[80%] uppercase tracking-tighter">
              {Math.round(value * steps)}
            </span>
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-primary/60 group-hover:border-t-primary" />
          </div>
        );
      case 'slider-v':
        return (
          <div style={{ width: `${20 * scale}px`, height: `${60 * scale}px` }} className="bg-black/40 border border-outline rounded-full flex flex-col items-center p-1 relative">
            <div className="absolute bottom-1 left-1 right-1 rounded-full bg-primary/20" style={{ height: `${value * 100}%` }} />
            <motion.div 
              style={{ bottom: `${value * 80}%` }}
              className="absolute w-4 h-2 bg-primary rounded-xs shadow-[0_0_10px_rgba(0,240,255,0.4)] z-10" 
            />
          </div>
        );
      case 'port':
        return (
          <div style={{ width: `${24 * scale}px`, height: `${24 * scale}px` }} className={`rounded-full border-2 bg-[#000] flex items-center justify-center ${isSelected ? 'border-accent shadow-[0_0_10px_rgba(255,140,0,0.2)]' : 'border-[#444]'}`}>
            <div className={`w-[60%] h-[60%] rounded-full bg-[#111] border border-white/5 shadow-inner flex items-center justify-center`}>
               <div style={{ opacity: value }} className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            </div>
          </div>
        );
      case 'knob':
      default:
        const diameter = 32 * scale;
        const rotation = -135 + (value * 270);
        return (
          <div 
            style={{ width: `${diameter}px`, height: `${diameter}px` }} 
            className={`rounded-full border-2 border-[#333] bg-[#111] flex items-center justify-center relative ${isSelected ? 'border-primary shadow-[0_0_15px_rgba(0,240,255,0.2)]' : ''}`}
            onWheel={(e) => {
              e.stopPropagation();
              updateRuntimeValue(item.id, e.deltaY > 0 ? -0.01 : 0.01);
            }}
          >
            <motion.div 
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ height: '35%' }} 
              className="w-[2px] rounded-full mb-[60%] bg-primary shadow-[0_0_5px_rgba(0,240,255,0.5)]" 
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 gap-8 p-12 relative overflow-hidden">
      <div className="flex gap-1 bg-black/60 p-1 rounded-full border border-white/10 z-20 shadow-2xl">
        {['MAIN', 'PATCHING', 'SETUP', 'MIDI'].map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all flex items-center gap-2 ${activeTab === t ? 'bg-primary text-background' : 'text-white/40 hover:text-white'}`}
          >
            <span>{t}</span>
            <span className={`px-1.5 rounded-full text-[7px] ${activeTab === t ? 'bg-background text-primary' : 'bg-white/10 text-white/40'}`}>{getTabCount(t)}</span>
          </button>
        ))}
      </div>

      <div 
        ref={rackRef}
        className={`relative border-x-[3px] border-y-[1px] transition-all duration-700 ${getSkinStyles()}`} 
        style={{ width: `${displayWidth * 1.5}px`, height: `${displayHeight * 1.5}px` }}
      >
        <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
          <div className="text-[8px] font-headline font-bold italic opacity-10 tracking-tighter uppercase">ABD OMEGA ERA 7</div>
          <div className="text-[7px] text-primary/20 tracking-[0.3em] uppercase font-bold mt-1">{manifest?.metadata?.name || 'ASEPTIC MODULE'}</div>
        </div>

        {visibleElements.map((item: any) => {
          const variant = item.presentation?.variant || 'B';
          const scale = getSizeScale(variant);
          
          return (
            <motion.div
              key={item.id}
              drag
              dragMomentum={false}
              dragConstraints={rackRef}
              dragElastic={0}
              onDragStart={(_, info) => {
                dragStartPoint.current = { x: info.point.x, y: info.point.y };
              }}
              onDragEnd={(_, info) => {
                if (rackRef.current) {
                  const rect = rackRef.current.getBoundingClientRect();
                  const rawX = (info.point.x - rect.left);
                  const rawY = (info.point.y - rect.top);
                  const newX = Math.round(rawX / (1.5 * zoom));
                  const newY = Math.round(rawY / (1.5 * zoom));
                  onUpdateItem(item.id, { pos: { x: newX, y: newY } });
                }
              }}
              animate={{ 
                x: (item.pos?.x || 0) * 1.5,
                y: (item.pos?.y || 0) * 1.5
              }}
              transition={{ type: 'tween', duration: 0 }}
              style={{ 
                position: 'absolute',
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -32, 
                marginTop: -32,
                zIndex: selectedItemId === item.id ? 50 : 10
              }}
              className="pointer-events-none"
            >
              <div 
                onClick={() => onSelectItem(item.id)}
                className="relative cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
              >
                 {(item.presentation?.attachments || []).map((att: any, idx: number) => renderAttachment(att, item, scale, idx))}
                 <div className={`transition-all duration-300 ${selectedItemId === item.id ? 'scale-110' : ''}`}>
                   {renderMainComponent(item, scale)}
                 </div>
                 {selectedItemId === item.id && (
                   <div className="absolute -inset-4 border border-primary/20 border-dashed rounded-lg animate-pulse pointer-events-none" />
                 )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="text-[8px] text-white/20 uppercase font-black tracking-widest mt-4 flex items-center gap-4">
        <span>{skin} Skin active</span>
        <span className="w-1 h-1 rounded-full bg-primary/40" />
        <span className="text-primary/60">Live Simulation Mode Active</span>
      </div>
    </div>
  );
}
