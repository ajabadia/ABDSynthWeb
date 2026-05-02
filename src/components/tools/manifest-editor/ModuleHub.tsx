'use client';

import React, { useMemo } from 'react';
import { Zap, Database, Palette, CheckCircle, AlertTriangle, FolderOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface UIElement {
  bind?: string;
  presentation?: {
    attachments?: any[];
  };
}

interface ModuleHubProps {
  manifest: {
    ui?: {
      controls?: UIElement[];
      jacks?: UIElement[];
    };
    metadata?: {
      name?: string;
      family?: string;
      description?: string;
      status?: string;
      rack?: { hp?: number };
    };
    resources?: { wasm?: string };
    schemaVersion?: string;
  };
  contract: {
    id: string;
    parameters?: any[];
    ports?: any[];
  } | null;
  triggerUpload: (type: string) => void;
  onDeploy: () => void;
}

export default function ModuleHub({ manifest, contract, triggerUpload, onDeploy }: ModuleHubProps) {
  
  // INDUSTRIAL HEALTH ANALYTICS
  const metrics = useMemo(() => {
    const controls = manifest.ui?.controls || [];
    const jacks = manifest.ui?.jacks || [];
    const allItems = [...controls, ...jacks];

    // 1. Binding Coverage
    const boundCount = allItems.filter(i => i.bind && i.bind !== '').length;
    const bindCoverage = allItems.length > 0 ? (boundCount / allItems.length) * 100 : 0;

    // 2. Metadata Audit
    const meta = manifest.metadata || {};
    const metaFields = [meta.name, meta.family, meta.description, meta.status];
    const metaScore = (metaFields.filter(f => !!f).length / metaFields.length) * 100;

    // 3. UI Density (Optimal 60-80%)
    const hp = meta.rack?.hp || 12;
    const density = Math.min(100, (allItems.length / (hp * 0.8)) * 100);

    // 4. Attachment Depth
    const itemsWithAtt = allItems.filter(i => (i.presentation?.attachments?.length || 0) > 0).length;
    const attScore = allItems.length > 0 ? (itemsWithAtt / allItems.length) * 100 : 0;

    // 5. Overall System Readiness
    const overall = (bindCoverage + metaScore + (100 - Math.abs(70 - density)) + attScore) / 4;

    return [
      { label: 'BND', value: bindCoverage, color: 'bg-primary' },
      { label: 'MET', value: metaScore, color: 'bg-accent' },
      { label: 'DEN', value: density, color: 'bg-blue-400' },
      { label: 'ATT', value: attScore, color: 'bg-purple-400' },
      { label: 'SYS', value: overall, color: 'bg-green-400' }
    ];
  }, [manifest]);

  const sysReady = metrics[4].value > 80;

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar pr-2">
      {/* LOGIC ASSETS */}
      <div className="space-y-3">
        <div className="text-[9px] font-black wb-text-muted uppercase tracking-widest flex justify-between items-center">
          <span>Logic Assets</span>
          {contract ? (
            <div className="flex items-center gap-1 text-green-400">
               <CheckCircle className="w-2.5 h-2.5" />
               <span className="text-[7px]">SYS_READY</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-amber-500">
               <AlertTriangle className="w-2.5 h-2.5" />
               <span className="text-[7px]">MISSING_CONTRACT</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => triggerUpload('folder-upload')} 
            className="w-full flex items-center justify-between p-3.5 bg-primary/10 border border-primary/20 rounded-sm hover:bg-primary/20 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="block text-[9px] font-black uppercase tracking-widest text-primary">Ingest Module Folder</span>
                <span className="block text-[6px] font-bold text-primary/80 uppercase">Auto-discovery & Sync</span>
              </div>
            </div>
            <ChevronRight className="w-3 h-3 text-primary/60" />
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => triggerUpload('bulk-upload')} className="flex flex-col items-center justify-center gap-1.5 p-3 wb-surface border wb-outline rounded-sm hover:border-primary/40 hover:bg-primary/5 transition-all group relative overflow-hidden">
              <Zap className="w-3 h-3 text-primary group-hover:scale-125 transition-transform" />
              <span className="text-[7px] font-bold uppercase tracking-tighter wb-text-muted">WASM</span>
              {manifest.resources?.wasm && <div className="absolute top-0 right-0 w-1 h-full bg-primary/20" />}
            </button>
            <button onClick={() => triggerUpload('bulk-upload')} className="flex flex-col items-center justify-center gap-1.5 p-3 wb-surface border wb-outline rounded-sm hover:border-accent/40 hover:bg-accent/5 transition-all group relative overflow-hidden">
              <Database className="w-3 h-3 text-accent group-hover:scale-125 transition-transform" />
              <span className="text-[7px] font-bold uppercase tracking-tighter wb-text-muted">CONTRACT</span>
              {contract && <div className="absolute top-0 right-0 w-1 h-full bg-accent/20" />}
            </button>
            <button onClick={() => triggerUpload('bulk-upload')} className="flex flex-col items-center justify-center gap-1.5 p-3 wb-surface border wb-outline rounded-sm hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all group relative overflow-hidden">
              <Palette className="w-3 h-3 text-cyan-400 group-hover:scale-125 transition-transform" />
              <span className="text-[7px] font-bold uppercase tracking-tighter wb-text-muted">ACEMM</span>
              {manifest.schemaVersion && <div className="absolute top-0 right-0 w-1 h-full bg-cyan-400/20" />}
            </button>
          </div>
        </div>
        
        {contract && (
          <div className="p-2.5 bg-black/5 border wb-outline rounded-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[7px] wb-text-muted font-bold uppercase">Target ID</span>
              <span className="text-[8px] text-primary font-mono font-black">{contract.id}</span>
            </div>
            <div className="h-[1px] bg-outline/5 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-[7px] wb-text-muted font-bold uppercase">CONTRACT Ports</span>
              <span className="text-[8px] wb-text font-black">{contract.parameters?.length || 0}P / {contract.ports?.length || 0}S</span>
            </div>
          </div>
        )}
      </div>

      {/* INDUSTRIAL STATUS ANALYZER */}
      <div className="mt-auto p-4 wb-surface border wb-outline rounded-sm space-y-4 shadow-sm">
         <div className="flex items-center justify-between">
            <p className="text-[8px] font-black wb-text-muted uppercase tracking-widest">Industrial Status</p>
            <div className={`px-1.5 py-0.5 rounded-[2px] text-[6px] font-black uppercase ${sysReady ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
               {sysReady ? 'Stable' : 'Incomplete'}
            </div>
         </div>

         <div className="flex justify-between items-end h-12 gap-2 px-1">
            {metrics.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full bg-black/5 rounded-t-[1px] relative overflow-hidden h-10">
                   <div 
                      className={`absolute bottom-0 left-0 w-full transition-all duration-700 ease-out ${m.color}`} 
                      style={{ height: `${m.value}%` }} 
                   />
                </div>
                <span className="text-[6px] font-bold wb-text-muted">{m.label}</span>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline/5">
            <div className="flex flex-col">
               <span className="text-[6px] wb-text-muted uppercase font-black">Ready Score</span>
               <span className={`text-[10px] font-black font-mono ${sysReady ? 'text-green-400' : 'text-amber-400'}`}>
                  {Math.round(metrics[4].value)}%
               </span>
            </div>
            <div className="flex flex-col text-right">
               <span className="text-[6px] wb-text-muted uppercase font-black">Audit Mode</span>
               <span className="text-[10px] font-black font-mono text-primary">ERA 7.1</span>
            </div>
         </div>
      </div>
      {/* ACTION HUB */}
      <div className="space-y-2">
         <button 
           onClick={onDeploy}
           className={`w-full flex items-center justify-center gap-3 p-4 rounded-sm transition-all shadow-xl group relative overflow-hidden ${sysReady ? 'bg-accent text-white hover:scale-[1.02]' : 'bg-black/5 wb-text-muted border wb-outline hover:bg-black/10'}`}
         >
            <Zap className={`w-4 h-4 ${sysReady ? 'fill-white' : ''} group-hover:scale-125 transition-transform`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Deploy to Engine</span>
            {sysReady && (
              <motion.div 
                animate={{ x: ['-100%', '100%'] }} 
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" 
              />
            )}
         </button>
         
         <p className="text-[6px] text-center wb-text-muted font-bold uppercase tracking-widest italic">
           * Direct hot-swap injection into OMEGA runtime
         </p>
      </div>
    </div>
  );
}
