import React from 'react';
import { motion } from 'framer-motion';
import { OMEGA_Manifest } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';
import { RackContainer } from '../rack/RackContainer';
import { RackEntity } from '../rack/RackEntity';
import { RackScrews } from '../rack/RackScrews';

interface MockupViewportProps {
  manifest: OMEGA_Manifest;
  audit: AuditResult;
  resolveAsset?: (id: string | undefined) => string | undefined;
  width: number;
  height: number;
  skin: string;
  activeTab: string;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

export const MockupViewport = ({ 
  manifest, audit, resolveAsset, width, height, skin, activeTab, viewportRef 
}: MockupViewportProps) => {
  const getSkinConfig = () => {
    switch (skin) {
      case 'industrial': return 'bg-[#121212] border-y-[#222] border-x-[#333] shadow-[0_40px_100px_rgba(0,0,0,0.8)]';
      case 'carbon': return 'bg-[#0a0a0a] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)]';
      default: return 'bg-[#1a1a1a] border-white/10';
    }
  };

  const allElements = React.useMemo(() => [
    ...(manifest.ui?.controls || []).map(c => ({ ...c, isJack: false })),
    ...(manifest.ui?.jacks || []).map(j => ({ ...j, isJack: true }))
  ], [manifest.ui]);

  const containers = manifest.ui.layout?.containers || [];
  const visibleContainers = containers.filter(c => !c.tab || c.tab === activeTab);
  
  const visibleElements = allElements.filter(entity => {
    const containerId = entity.presentation?.container;
    const container = containers.find(c => c.id === containerId);
    if (container) return !container.tab || container.tab === activeTab;
    return (entity.presentation?.tab || 'MAIN') === activeTab;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex items-center justify-center p-20"
    >
      {/* STUDIO LIGHTING BLOOM */}
      <div className="absolute -inset-40 bg-primary/10 blur-[180px] rounded-full pointer-events-none mix-blend-screen animate-pulse" />
      <div className="absolute top-0 -left-20 w-80 h-full bg-white/5 blur-[100px] -rotate-12 pointer-events-none" />

      {/* THE ACTUAL RACK SNAPSHOT (TARGET NODE) */}
      <div 
        ref={viewportRef}
        className={`relative border-x-[6px] border-y-[2px] rounded-sm overflow-hidden ${getSkinConfig()} ring-1 ring-white/10`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 40%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.1) 100%)`,
          boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9), 0 30px 60px -30px rgba(0,0,0,0.5)'
        }}
      >
        <RackScrews />

        {/* ARCHITECTURAL LAYERS */}
          {visibleContainers.map((c) => (
            <RackContainer 
              key={c.id} container={c} isSelected={false} 
              activeContainers={{}} audit={audit} 
              skin={skin} rackWidthPx={width} 
              resolveAsset={resolveAsset}
            />
          ))}

        {/* ENTITIES LAYER */}
        {visibleElements.map((item) => (
          <RackEntity 
            key={item.id} item={item} rackRef={{ current: null }} 
            zoom={1.0} isLiveMode={true} selectedItemId={null} 
            onSelectItem={() => {}} onUpdateItem={() => {}} 
            runtimeValue={0.5} steps={100} 
            onPortClick={() => {}} audit={audit} skin={skin} 
            resolveAsset={resolveAsset} manifest={manifest}
          />
        ))}

        {/* STUDIO OVERLAY SHINE (Glass Effect) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.01] pointer-events-none z-[100]" />
        <div className="absolute inset-0 opacity-10 pointer-events-none z-[101]" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px)', backgroundSize: '2px 100%' }} />
      </div>

      {/* SHADOW BASE */}
      <div className="absolute -bottom-10 left-0 right-0 h-20 bg-black/60 blur-3xl -z-10" />
    </motion.div>
  );
};
