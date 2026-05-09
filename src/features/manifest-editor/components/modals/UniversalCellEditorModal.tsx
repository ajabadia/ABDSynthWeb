'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, Plus, Database, Cpu, Layers, Layout, Type, Settings2, Trash2, ChevronRight, ChevronUp, ChevronDown, Box } from 'lucide-react';
import { OMEGA_ELEMENT_CATALOG } from '@/omega-ui-core/governance/ElementCatalog';
import IndustrialGovernanceConsole from '../inspector/shared/IndustrialGovernanceConsole';
import AttachmentTypeAnchor from '../inspector/attachments/AttachmentTypeAnchor';
import AttachmentLogicFields from '../inspector/attachments/AttachmentLogicFields';
import AttachmentTypePrecisionOffsets from '../inspector/attachments/AttachmentPrecisionOffsets';
import { CellRenderer } from '@/omega-ui-core/renderers/CellRenderer';
import { ManifestEntity, OMEGA_Manifest, ComponentType } from '@/types/manifest';
import ThemePaletteGovernance from '../inspector/aesthetic/governance/ThemePaletteGovernance';

interface UniversalCellEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cell: ManifestEntity) => void;
  resolveAsset?: (id: string | undefined) => string | undefined;
}

export default function UniversalCellEditorModal({ 
  isOpen, onClose, onSave, resolveAsset 
}: UniversalCellEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'fragments' | 'properties'>('fragments');
  const [selectedFragmentId, setSelectedFragmentId] = useState<string>('host');
  const [isTypeLocked, setIsTypeLocked] = useState(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  
  const [cellData, setCellData] = useState<ManifestEntity>({
    id: 'new_cell',
    type: 'knob',
    role: 'control',
    bind: 'param_id',
    label: 'New Universal Cell',
    pos: { x: 0, y: 0 },
    presentation: {
      tab: 'MAIN',
      component: 'knob',
      variant: 'B_cyan',
      offsetX: 0,
      offsetY: 0,
      style: {
        asset: '',
        color: '#00f2ff',
        indicatorColor: '#00f2ff',
        fitting: 'contain'
      },
      attachments: []
    }
  });

  const [description, setDescription] = useState('');

  // MOCK MANIFEST FOR RENDERER (Era 7.2.3 Industrial Palette)
  const [mockManifest, setMockManifest] = useState<OMEGA_Manifest>({
    schemaVersion: '1.0.0',
    id: 'laboratory',
    metadata: { 
      name: 'Laboratory', 
      family: 'Internal', 
      version: '1.0.0', 
      author: 'OMEGA' 
    },
    ui: {
      dimensions: { width: 100, height: 100 },
      controls: [],
      jacks: [],
      layout: { 
        containers: [],
        planes: ['MAIN'],
        tabStyles: {} 
      },
      styles: {},
      skinMode: 'custom',
      palette: {
        primary: '#00f2ff',
        secondary: '#ff8c00',
        utility: '#a0a0a0',
        feedback: '#32cd32',
        hardware: '#777777',
        chassis: '#1a1a1a',
        glow: '#00f2ff',
        glass: 'rgba(255,255,255,0.05)',
        warning: '#ff3300',
        highlight: '#ffffff'
      },
      colors: {
        accent: '#00f2ff',
        surface: '#121416',
        text: '#ffffff',
        weak: '#555555'
      }
    },
    resources: { wasm: 'internal', assets: [] }
  });

  // Sync component type with presentation
  useEffect(() => {
    requestAnimationFrame(() => {
      setCellData(prev => ({
        ...prev,
        presentation: {
          ...prev.presentation,
          component: prev.type as ComponentType
        }
      }));
    });
  }, [cellData.type]);

  const addFragment = (type: string) => {
    setIsTypeLocked(true);
    const newFragment = {
      id: `fragment_${Date.now()}`,
      position: 'center',
      type: type,
      presentation: {
        style: {
          color: '#ffffff',
          size: 10,
          font: 'Inter'
        }
      },
      offsetX: 0,
      offsetY: 0
    };
    
    setCellData(prev => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: [...(prev.presentation?.attachments || []), newFragment as any]
      }
    }));
    setSelectedFragmentId(newFragment.id);
    setActiveTab('properties');
  };

  const removeFragment = (id: string) => {
    setCellData(prev => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: (prev.presentation?.attachments || []).filter((a: any) => a.id !== id)
      }
    }));
    if (selectedFragmentId === id) setSelectedFragmentId('host');
  };

  const moveFragment = (id: string, direction: 'up' | 'down') => {
    const attachments = [...(cellData.presentation.attachments || [])];
    const index = attachments.findIndex(a => a.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= attachments.length) return;

    const [moved] = attachments.splice(index, 1);
    attachments.splice(newIndex, 0, moved);

    setCellData(prev => ({
      ...prev,
      presentation: {
        ...prev.presentation,
        attachments
      }
    }));
  };

  const updateFragment = (id: string, updates: Record<string, unknown>) => {
    if (id === 'host') {
      setCellData(prev => ({
        ...prev,
        presentation: {
          ...prev.presentation,
          style: { ...(prev.presentation?.style || {}), ...updates }
        }
      }));
    } else {
      // List of properties that should live inside the 'style' node for fragments
      const styleKeys = [
        'color', 'indicatorColor', 'glowColor', 'glassColor', 'font', 'fontSize', 
        'fontColor', 'opacity', 'intensity', 'rounding', 'shadow', 'blur', 'texture'
      ];

      setCellData(prev => {
        const attachments = (prev.presentation?.attachments || []).map((a) => {
          if (a.id !== id) return a;
          
          const rootUpdates: Record<string, unknown> = {};
          const styleUpdates: Record<string, unknown> = {};
          
          Object.keys(updates).forEach(key => {
            if (styleKeys.includes(key)) {
              styleUpdates[key] = updates[key];
            } else {
              rootUpdates[key] = updates[key];
            }
          });

          const newAttachment = { ...a, ...rootUpdates };
          if (Object.keys(styleUpdates).length > 0) {
            newAttachment.style = { ...(a.style || {}), ...styleUpdates };
          }
          
          return newAttachment;
        });

        return {
          ...prev,
          presentation: { ...prev.presentation, attachments }
        };
      });
    }
  };

  const previewHTML = React.useMemo(() => {
    try {
      return CellRenderer.renderCellHTML(cellData, {
        zoom: 2,
        runtimeValue: (cellData.presentation?.style as unknown as Record<string, unknown>)?.testValue as number ?? 0.75,
        steps: 128,
        skin: (mockManifest.ui as unknown as Record<string, unknown>).skin as string || 'standard',
        manifest: mockManifest,
        resolveAsset: resolveAsset || ((id) => id)
      });
    } catch (e) {
      return `<div class="p-4 text-[8px] text-red-500 font-mono">RENDER_ERROR: ${e}</div>`;
    }
  }, [cellData, mockManifest, resolveAsset]);

  const handleExport = () => {
    const exportData = {
      ...cellData,
      description,
      meta: { exportedAt: new Date().toISOString(), version: 'Era 7.2.3' }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omega_cell_${cellData.type}_${(cellData.label || 'unnamed').toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 md:p-12 overflow-hidden">
        {/* BACKDROP */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />

        {/* MODAL CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-7xl h-full max-h-[850px] bg-[#0c0c0d] border border-[#222] rounded-lg flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden text-[#a0a0a0]"
        >
          {/* HEADER (ASEPTIC STRIP) */}
          <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#111112]">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-[#1a1a1b] border border-[#333] flex items-center justify-center">
                   <Cpu className="w-5 h-5 text-accent" />
                </div>
                <div>
                   <h2 className="text-sm font-black uppercase tracking-widest text-white">Universal Cell Laboratory</h2>
                   <div className="flex items-center gap-2">
                      <span className="text-[7px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-full font-black uppercase">Aseptic Blueprint</span>
                      <span className="text-[7px] opacity-40 font-bold uppercase tracking-widest">Era 7.2.3 Industrial Logic</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-500 transition-all">
                <X className="w-4 h-4" />
             </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
             {/* LEFT: NARROW PREVIEW STRIP */}
             <div className="w-96 border-r border-[#222] bg-[#080809] flex flex-col relative overflow-hidden transition-all duration-700">
                <div className="p-4 border-b border-[#222] bg-[#111112]">
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-40">DNA Real-time View</span>
                </div>
                
                <div className="flex-1 flex items-center justify-center relative bg-[radial-gradient(circle_at_center,_#111_0%,_transparent_70%)]">
                   <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                   
                   <div className="scale-[2.5] relative transition-transform duration-700">
                      <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
                   </div>
                </div>

                <div className="p-4 border-t border-[#222] bg-[#111112] flex flex-col gap-1">
                   <span className="text-[7px] font-black uppercase tracking-widest opacity-30">Magnification: 250%</span>
                   <div className="h-1 bg-accent/20 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-full" />
                   </div>
                </div>
             </div>

             {/* CENTER: WORKSPACE (TREE OR PROPERTIES) */}
             <div className="flex-1 flex flex-col bg-[#0c0c0d] overflow-hidden">
                {/* SUB-HEADER: IDENTITY & TABS */}
                <div className="p-6 border-b border-[#222] bg-[#111112]/50 flex items-center justify-between gap-8">
                   <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                         <input 
                           type="text" value={cellData.label || ''} 
                           onChange={(e) => setCellData({...cellData, label: e.target.value})}
                           className="bg-transparent text-xl font-black uppercase tracking-tighter text-white outline-none w-full border-b border-transparent focus:border-accent/40 placeholder:opacity-20"
                           placeholder="CELL IDENTITY NAME"
                         />
                         <div className="flex items-center gap-2">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-20">Aseptic DNA Definition</span>
                            <div className="h-px flex-1 bg-white/5" />
                         </div>
                      </div>

                      <div className="flex items-start gap-4">
                         <div className="w-64">
                            <span className="text-[7px] font-black uppercase tracking-widest opacity-40 block mb-1">Master Class</span>
                            <div className="flex gap-2">
                               <select 
                                 disabled={isTypeLocked}
                                 value={cellData.type}
                                  onChange={(e) => setCellData({
                                    ...cellData, 
                                    type: e.target.value, 
                                    presentation: { ...cellData.presentation, component: e.target.value } 
                                  })}
                                 className={`flex-1 bg-[#1a1a1b] border border-[#333] rounded p-1.5 text-[8px] font-black uppercase outline-none transition-all ${isTypeLocked ? 'opacity-50 text-white/40 grayscale' : 'text-accent border-accent/20'}`}
                               >
                                  {['signal', 'io', 'telemetry', 'mechanical', 'infrastructure', 'rack', 'decor'].map(cat => (
                                    <optgroup key={cat} label={cat.toUpperCase()} className="bg-[#0a0a0b] text-white/40">
                                       {OMEGA_ELEMENT_CATALOG.filter(e => e.category === cat).map(el => (
                                         <option key={el.id} value={el.id}>{el.icon} {el.label}</option>
                                       ))}
                                    </optgroup>
                                  ))}
                               </select>
                               {!isTypeLocked && (
                                 <button 
                                   onClick={() => setIsTypeLocked(true)}
                                   className="px-3 py-1 bg-accent text-black text-[7px] font-black uppercase rounded hover:brightness-110 transition-all shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                                 >
                                    Accept DNA
                                 </button>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className={`transition-all ${!isTypeLocked ? 'opacity-30 pointer-events-none' : ''}`}>
                         <span className="text-[7px] font-black uppercase tracking-widest opacity-40 block mb-1">Registry Description</span>
                         <input 
                           type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                           className="w-full bg-[#1a1a1b] border border-[#333] rounded p-1.5 text-[8px] font-bold uppercase text-white/60 outline-none"
                           placeholder="Functional documentation..."
                         />
                      </div>
                   </div>

                   <div className={`flex items-center gap-1 bg-[#1a1a1b] p-1 rounded border border-[#333] transition-all self-start mt-8 ${!isTypeLocked ? 'opacity-30 pointer-events-none scale-95' : ''}`}>
                      <button 
                        disabled={!isTypeLocked}
                        onClick={() => { setActiveTab('fragments'); setIsCommandCenterOpen(false); }}
                        className={`px-4 py-1.5 rounded text-[8px] font-black uppercase transition-all ${activeTab === 'fragments' && !isCommandCenterOpen ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white/60'}`}
                      >
                         <Layers className="w-3 h-3 inline-block mr-2" /> Fragments
                      </button>
                      <button 
                        disabled={!isTypeLocked}
                        onClick={() => { setActiveTab('properties'); setIsCommandCenterOpen(false); }}
                        className={`px-4 py-1.5 rounded text-[8px] font-black uppercase transition-all ${activeTab === 'properties' && !isCommandCenterOpen ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white/60'}`}
                      >
                         <Settings2 className="w-3 h-3 inline-block mr-2" /> Properties
                      </button>
                   </div>
                </div>

                {/* CONTENT */}
                 <div className="flex-1 overflow-y-auto p-6 relative">
                    {!isTypeLocked && (
                       <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500">
                          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-4">
                             <Database className="w-8 h-8 text-accent animate-pulse" />
                          </div>
                          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Aseptic DNA Locked</h4>
                          <p className="max-w-[200px] text-[8px] font-bold uppercase opacity-40 leading-relaxed">Please accept the Master Class definition to initialize the architectural workbench.</p>
                       </div>
                    )}
                    
                    {isCommandCenterOpen ? (
                      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                         <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#222]">
                            <div className="flex items-center gap-2">
                               <Settings2 className="w-4 h-4 text-accent" />
                               <h3 className="text-xs font-black uppercase tracking-widest text-white">Global Command Center</h3>
                            </div>
                            <button 
                              onClick={() => setIsCommandCenterOpen(false)}
                              className="text-[8px] font-black uppercase text-accent hover:underline"
                            >
                               Back to Cell Architecture
                            </button>
                         </div>
                         <ThemePaletteGovernance 
                            manifest={mockManifest}
                            onUpdate={(updates: Partial<OMEGA_Manifest>) => {
                               setMockManifest(prev => ({
                                  ...prev,
                                  ui: { ...prev.ui, ...updates.ui }
                               }));
                            }}
                         />
                      </div>
                   ) : activeTab === 'fragments' ? (
                      <div className="max-w-3xl mx-auto space-y-6">
                         <div className="flex items-center justify-between border-b border-[#222] pb-4">
                            <div>
                               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Cell Composition Tree</h3>
                               <p className="text-[8px] font-bold uppercase opacity-30">Define the architectural layers of this object.</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className="text-[8px] font-black uppercase opacity-40">Layers: {1 + (cellData.presentation.attachments?.length || 0)}</span>
                               
                               <select 
                                 onChange={(e) => { if(e.target.value) addFragment(e.target.value); e.target.value = ''; }}
                                 className="bg-accent/10 border border-accent/30 rounded px-3 py-1.5 text-[8px] font-black uppercase text-accent hover:bg-accent/20 transition-all outline-none"
                               >
                                  <option value="" className="bg-[#111]">+ Add Fragment</option>
                                  {OMEGA_ELEMENT_CATALOG.filter(e => e.attachmentRole === 'fragment' || e.attachmentRole === 'both').map(frag => (
                                    <option key={frag.id} value={frag.id} className="bg-[#111]">{frag.label.toUpperCase()}</option>
                                  ))}
                               </select>
                            </div>
                         </div>

                         <div className="space-y-3">
                            {/* HOST CARD */}
                            <div 
                               onClick={() => { setSelectedFragmentId('host'); setActiveTab('properties'); }}
                               className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all group cursor-pointer ${selectedFragmentId === 'host' ? 'bg-accent/5 border-accent shadow-[0_0_20px_rgba(0,242,255,0.05)]' : 'bg-[#111112] border-[#222] hover:border-[#444]'}`}
                            >
                               <div className={`w-12 h-12 rounded flex items-center justify-center transition-colors ${selectedFragmentId === 'host' ? 'bg-accent text-black' : 'bg-[#1a1a1b] text-white/20'}`}>
                                  <Box className="w-6 h-6" />
                               </div>
                               <div className="flex-1 text-left">
                                  <h4 className={`text-[10px] font-black uppercase ${selectedFragmentId === 'host' ? 'text-accent' : 'text-white'}`}>Main Architectural Host</h4>
                                  <p className="text-[7px] font-bold uppercase opacity-30 mt-0.5">Surface, Borders, Background Material</p>
                               </div>
                               <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="w-4 h-4" />
                               </div>
                            </div>

                            {/* FRAGMENT CARDS */}
                            {(cellData.presentation.attachments || []).map((frag) => (
                               <div 
                                 key={frag.id}
                                 onClick={() => { setSelectedFragmentId(frag.id); setActiveTab('properties'); }}
                                 className={`w-full p-4 rounded-lg border flex items-center gap-4 transition-all group cursor-pointer ${selectedFragmentId === frag.id ? 'bg-accent/5 border-accent shadow-[0_0_20px_rgba(0,242,255,0.05)]' : 'bg-[#111112] border-[#222] hover:border-[#444]'}`}
                               >
                                  <div className="flex flex-col gap-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); moveFragment(frag.id, 'up'); }}
                                       className="p-1 hover:bg-accent/20 rounded text-white/20 hover:text-accent transition-all"
                                     >
                                        <ChevronUp className="w-3 h-3" />
                                     </button>
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); moveFragment(frag.id, 'down'); }}
                                       className="p-1 hover:bg-accent/20 rounded text-white/20 hover:text-accent transition-all"
                                     >
                                        <ChevronDown className="w-3 h-3" />
                                     </button>
                                  </div>
                                  <div className={`w-12 h-12 rounded flex items-center justify-center transition-colors ${selectedFragmentId === frag.id ? 'bg-accent text-black' : 'bg-[#1a1a1b] text-white/20'}`}>
                                     {frag.type === 'label' ? <Type className="w-5 h-5" /> : frag.type === 'led' ? <Plus className="w-5 h-5 text-accent" /> : <Layout className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1 text-left">
                                     <div className="flex items-center gap-2">
                                        <h4 className={`text-[10px] font-black uppercase ${selectedFragmentId === frag.id ? 'text-accent' : 'text-white'}`}>{frag.type} Fragment</h4>
                                        <span className="text-[6px] font-mono opacity-20">#{frag.id.slice(-4)}</span>
                                     </div>
                                     <p className="text-[7px] font-bold uppercase opacity-30 mt-0.5">Custom aesthetics & spatial coordinates</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <button 
                                       onClick={(e) => { e.stopPropagation(); removeFragment(frag.id); }}
                                       className="p-2 hover:bg-red-500/10 rounded-full text-white/10 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                     >
                                        <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                     <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   ) : (
                      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                         <div className="flex items-center justify-between border-b border-[#222] pb-4">
                            <div className="flex items-center gap-4">
                               <button 
                                 onClick={() => setActiveTab('fragments')}
                                 className="text-[8px] font-black uppercase text-accent hover:opacity-70 flex items-center gap-1 transition-all"
                                >
                                  <Plus className="w-3 h-3 rotate-45" /> Back to Tree
                               </button>
                               <div className="h-4 w-px bg-[#222]" />
                               <div>
                                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Editing: {selectedFragmentId === 'host' ? 'Architectural Host' : 'Fragment DNA'}</h3>
                                  <p className="text-[8px] font-bold uppercase opacity-30">Adjust technical capabilities and aesthetic traits.</p>
                               </div>
                            </div>
                         </div>

                         <div className="bg-[#111112] border border-[#222] rounded-lg p-6 space-y-8">
                            {selectedFragmentId !== 'host' && (
                               <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                  <AttachmentTypeAnchor 
                                     type={(cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.type || 'label'}
                                     hostType={cellData.type}
                                     position={(cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.position || 'center'}
                                     isCore={(cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.isCore || false}
                                     onUpdate={(updates) => updateFragment(selectedFragmentId, updates)}
                                  />
                                  <AttachmentLogicFields 
                                     att={(cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)!}
                                     availableBinds={['value', 'state', 'active', 'signal', 'telemetry', 'midi_cc']}
                                     onUpdate={(updates) => updateFragment(selectedFragmentId, updates)}
                                  />
                                </div>
                            )}

                            <IndustrialGovernanceConsole 
                               type={selectedFragmentId === 'host' ? cellData.type as string : ((cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.type || 'label')}
                               values={selectedFragmentId === 'host' ? (cellData.presentation?.style || {}) : ((cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.style || {})}
                               onUpdate={(updates) => updateFragment(selectedFragmentId, updates)}
                               manifest={mockManifest}
                               resolveAsset={resolveAsset || ((id) => id)}
                               onOpenConfig={() => setIsCommandCenterOpen(true)}
                               title={selectedFragmentId === 'host' ? 'Host Aesthetic Governance' : 'Fragment Aesthetic Governance'}
                            />

                            {selectedFragmentId !== 'host' && (
                               <div className="pt-4 border-t border-[#222] animate-in fade-in slide-in-from-bottom-4 duration-500">
                                  <AttachmentTypePrecisionOffsets 
                                     offsetX={(cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.offsetX || 0}
                                     offsetY={(cellData.presentation.attachments || []).find(f => f.id === selectedFragmentId)?.offsetY || 0}
                                     onUpdate={(updates) => updateFragment(selectedFragmentId, updates)}
                                  />
                               </div>
                            )}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </div>

          {/* ACTION BAR (ASEPTIC STRIP) */}
          <div className="p-4 border-t border-[#222] bg-[#111112] flex items-center justify-between">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Library Integrity</span>
                   <span className="text-[8px] font-black text-accent uppercase">SYS_READY • CANONICAL ERA 7</span>
                </div>
             </div>

             <div className="flex gap-2">
                <button onClick={handleExport} className="px-6 py-2 bg-[#1a1a1b] border border-[#333] rounded text-[9px] font-black uppercase hover:bg-[#222] flex items-center justify-center gap-2 transition-all">
                   <Download className="w-3.5 h-3.5" /> Export DNA
                </button>
                <button 
                  onClick={() => onSave(cellData)}
                  className="px-8 py-2 bg-accent text-black rounded text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_20px_rgba(0,242,255,0.2)] transition-all ml-4"
                >
                   <Save className="w-3.5 h-3.5" /> Finalize Cell
                </button>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
