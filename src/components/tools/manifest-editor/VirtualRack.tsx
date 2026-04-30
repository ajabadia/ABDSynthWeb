'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface VirtualRackProps {
  manifest: any;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}

export default function VirtualRack({ manifest, selectedItemId, onSelectItem }: VirtualRackProps) {
  const [activeTab, setActiveTab] = useState('MAIN');
  
  const controls = manifest?.ui?.controls || [];
  const jacks = manifest?.ui?.jacks || [];
  const allElements = [
    ...controls.map((c: any) => ({ ...c, isJack: false })),
    ...jacks.map((j: any) => ({ ...j, isJack: true }))
  ];
  
  // Tab counting for visual feedback
  const getTabCount = (tab: string) => {
    return allElements.filter(item => (item.presentation?.tab || 'MAIN') === tab).length;
  };

  // Filter elements by the current active tab
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

  const getStyleFromVariant = (variant: string) => {
    if (!variant) return 'standard';
    // Handle combined variants like A_cyan, B_red
    if (variant.includes('_')) {
      return variant.split('_')[1];
    }
    // If it's just a size code (A, B, C, D)
    if (['A', 'B', 'C', 'D'].includes(variant)) return 'standard';
    return variant;
  };

  const renderAttachment = (att: any, parentItem: any, scale: number, index: number) => {
    const offset = att.offset || 0;
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
          <div key={key} className={`absolute ${posClasses[att.position] || ''}`} style={marginStyle}>
            <div style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} className="w-1.5 h-1.5 rounded-full border border-white/20" />
          </div>
        );
      case 'display':
        return (
          <div 
            key={key} 
            className={`absolute ${posClasses[att.position] || ''} bg-black border border-primary/30 px-1.5 py-0.5 rounded-xs flex flex-col items-center min-w-[28px] shadow-[0_0_10px_rgba(0,240,255,0.1)]`} 
            style={marginStyle}
          >
            <div className="flex items-baseline gap-0.5">
              {att.prefix && <span className="text-[4px] text-primary/40 font-black uppercase">{att.prefix}</span>}
              <span className="text-[6px] font-mono text-primary font-bold leading-none tracking-tighter">88.8</span>
            </div>
            {att.unit ? (
              <span className="text-[3px] text-primary/60 uppercase font-black tracking-widest">{att.unit}</span>
            ) : (
              <div className="w-full h-[1px] bg-primary/20 mt-0.5" />
            )}
          </div>
        );
      case 'label':
      default:
        const isMinimal = skin === 'minimal';
        return (
          <div key={key} className={`absolute ${posClasses[att.position] || ''} text-[6px] font-bold uppercase whitespace-nowrap tracking-widest ${isMinimal ? 'text-black/60 bg-black/5' : 'text-white/40 bg-black/40'} px-1 py-0.5 rounded-xs`} style={marginStyle}>
            {att.text || parentItem.label || parentItem.id}
          </div>
        );
    }
  };

  const renderMainComponent = (item: any, scale: number) => {
    const componentType = item.presentation?.component || (item.isJack ? 'port' : 'knob');
    const isSelected = selectedItemId === item.id;
    const variant = item.presentation?.variant || 'B';
    const style = getStyleFromVariant(variant);
    
    if (componentType === 'hidden') return <div className="w-6 h-6 border-2 border-dashed border-white/5 rounded-full flex items-center justify-center opacity-20"><div className="w-1 h-1 rounded-full bg-white/40" /></div>;

    switch (componentType) {
      case 'led':
        const ledColor = style === 'red' ? '#ff4444' : style === 'green' ? '#00ff88' : style === 'yellow' ? '#ffcc00' : '#00f0ff';
        const ledSize = (variant.startsWith('A') ? 20 : 12) * scale;
        return (
          <div style={{ width: `${ledSize}px`, height: `${ledSize}px`, backgroundColor: ledColor, boxShadow: `0 0 ${15 * scale}px ${ledColor}66` }} className="rounded-full border border-white/30" />
        );
      case 'display':
        return (
          <div style={{ width: `${80 * scale}px`, height: `${28 * scale}px` }} className="bg-black border-2 border-outline/40 rounded-sm flex items-center overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <div className="flex-1 h-full flex flex-col items-center justify-center border-r border-outline/20 bg-primary/5">
              <span className="text-[10px] font-mono text-primary font-black animate-pulse tracking-tighter">000.0</span>
            </div>
            <div className="w-6 h-full flex flex-col">
              <div className="flex-1 bg-white/5 border-b border-outline/20 flex items-center justify-center text-[10px] text-primary/60 hover:text-primary transition-colors cursor-pointer">+</div>
              <div className="flex-1 bg-white/5 flex items-center justify-center text-[10px] text-primary/60 hover:text-primary transition-colors cursor-pointer">-</div>
            </div>
          </div>
        );
      case 'select':
        return (
          <div style={{ width: `${64 * scale}px`, height: `${20 * scale}px` }} className="bg-black border border-outline rounded-xs flex items-center justify-between px-2">
            <span className="text-[7px] font-mono text-primary truncate max-w-[80%] uppercase tracking-tighter">{item.label || 'SELECT'}</span>
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-primary/60" />
          </div>
        );
      case 'slider-v':
        return (
          <div style={{ width: `${20 * scale}px`, height: `${60 * scale}px` }} className="bg-black/40 border border-outline rounded-full flex flex-col items-center p-1">
            <div className="w-full h-1/2 bg-primary/20 rounded-full" />
            <div className="w-4 h-2 bg-primary rounded-xs shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
          </div>
        );
      case 'slider-h':
        return (
          <div style={{ width: `${60 * scale}px`, height: `${20 * scale}px` }} className="bg-black/40 border border-outline rounded-full flex items-center p-1">
            <div className="h-full w-1/2 bg-primary/20 rounded-full" />
            <div className="h-4 w-2 bg-primary rounded-xs shadow-[0_0_10px_rgba(0,240,255,0.4)]" />
          </div>
        );
      case 'port':
        const isGold = style === 'gold';
        return (
          <div style={{ width: `${24 * scale}px`, height: `${24 * scale}px` }} className={`rounded-full border-2 bg-[#000] flex items-center justify-center ${isSelected ? (isGold ? 'border-yellow-500 shadow-[0_0_10px_rgba(255,200,0,0.3)]' : 'border-accent shadow-[0_0_10px_rgba(255,140,0,0.2)]') : (isGold ? 'border-yellow-600/60' : 'border-[#444]')}`}>
            <div className={`w-[60%] h-[60%] rounded-full bg-[#111] border ${isGold ? 'border-yellow-500/20' : 'border-white/5'} shadow-inner`} />
          </div>
        );
      case 'knob':
      default:
        const diameter = 32 * scale;
        const knobPointer = style === 'blue' ? '#00f0ff' : style === 'vintage' ? '#ffcc00' : '#00f0ffaa';
        return (
          <div style={{ width: `${diameter}px`, height: `${diameter}px` }} className={`rounded-full border-2 border-[#333] bg-[#111] flex items-center justify-center relative ${isSelected ? 'border-primary shadow-[0_0_15px_rgba(0,240,255,0.2)]' : ''}`}>
            <div style={{ height: '35%', backgroundColor: knobPointer }} className="w-[2px] rounded-full mb-[60%]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 gap-8 p-12 relative overflow-hidden">
      {/* RACK TAB SELECTOR WITH COUNTERS */}
      <div className="flex gap-1 bg-black/60 p-1 rounded-full border border-white/10 z-20 shadow-2xl">
        {['MAIN', 'PATCHING', 'SETUP', 'MIDI'].map(t => {
          const count = getTabCount(t);
          return (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all flex items-center gap-2 ${activeTab === t ? 'bg-primary text-background' : 'text-white/40 hover:text-white'}`}
            >
              <span>{t}</span>
              {count > 0 && <span className={`px-1.5 rounded-full text-[7px] ${activeTab === t ? 'bg-background text-primary' : 'bg-white/10 text-white/40'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className={`relative border-x-[3px] border-y-[1px] transition-all duration-700 ${getSkinStyles()}`} 
           style={{ width: `${displayWidth * 1.5}px`, height: `${displayHeight * 1.5}px` }}>
        
        {/* BRANDING */}
        <div className="absolute top-8 left-0 right-0 text-center pointer-events-none">
          <div className="text-[8px] font-headline font-bold italic opacity-10 tracking-tighter uppercase">ABD OMEGA ERA 7</div>
          <div className="text-[7px] text-primary/20 tracking-[0.3em] uppercase font-bold mt-1">{manifest?.metadata?.name || manifest?.name || 'ASEPTIC MODULE'}</div>
        </div>

        {/* ELEMENTS */}
        <AnimatePresence mode="popLayout">
          {visibleElements.map((item: any) => {
            const variant = item.presentation?.variant || 'B';
            const scale = getSizeScale(variant);
            return (
              <motion.div
                key={item.id}
                layoutId={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onSelectItem(item.id)}
                style={{ left: `${item.pos?.x * 1.5}px`, top: `${item.pos?.y * 1.5}px` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${selectedItemId === item.id ? 'z-50' : 'z-10'}`}
              >
                <div className="relative flex items-center justify-center">
                   {(item.presentation?.attachments || []).map((att: any, idx: number) => renderAttachment(att, item, scale, idx))}
                   <div className={`transition-all duration-300 ${selectedItemId === item.id ? 'scale-110' : ''}`}>
                     {renderMainComponent(item, scale)}
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {skin === 'carbon' && <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '4px 4px' }} />}
      </div>
      
      <div className="text-[8px] text-white/20 uppercase font-black tracking-widest mt-4">
        {skin} Skin active • {activeTab} View ({visibleElements.length} elements)
      </div>
    </div>
  );
}
