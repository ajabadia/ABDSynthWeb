'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Binary, ScrollText, Image as ImageIcon, Check, X, AlertTriangle, ChevronRight } from 'lucide-react';

interface IngestionFile {
  file: File;
  id: string;
  type: 'manifest' | 'wasm' | 'contract' | 'resource';
  selected: boolean;
}

interface IngestionModalProps {
  files: File[];
  onConfirm: (selectedFiles: File[]) => void;
  onCancel: () => void;
}

export default function IngestionModal({ files, onConfirm, onCancel }: IngestionModalProps) {
  const [ingestionList, setIngestionList] = useState<IngestionFile[]>([]);

  useEffect(() => {
    const list: IngestionFile[] = files.map(f => {
      let type: IngestionFile['type'] = 'resource';
      if (f.name.endsWith('.acemm')) type = 'manifest';
      else if (f.name.endsWith('.wasm')) type = 'wasm';
      else if (f.name.endsWith('.json')) type = 'contract';
      
      return {
        file: f,
        id: Math.random().toString(36).substr(2, 9),
        type,
        selected: true // Default all to selected
      };
    });

    // Auto-resolve duplicates: only select the first of each primary type
    const seen = new Set();
    const resolved = list.map(item => {
      if (item.type === 'resource') return item;
      if (seen.has(item.type)) return { ...item, selected: false };
      seen.add(item.type);
      return item;
    });

    setIngestionList(resolved);
  }, [files]);

  const toggleSelect = (id: string) => {
    setIngestionList(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      // If we are selecting a primary type, deselect others of the same type
      if (!item.selected && item.type !== 'resource') {
        return { ...item, selected: true };
      }
      
      return { ...item, selected: !item.selected };
    }).map((item, _, arr) => {
      // Ensure only one primary type is selected if this one was just selected
      if (item.id === id && item.selected && item.type !== 'resource') {
        // This logic is handled by the map above, but let's be explicit
      }
      return item;
    }));
  };

  // Special setter for primary types (only one active)
  const setPrimary = (id: string) => {
    const target = ingestionList.find(i => i.id === id);
    if (!target) return;

    setIngestionList(prev => prev.map(item => {
      if (item.type === target.type) {
        return { ...item, selected: item.id === id };
      }
      return item;
    }));
  };

  const manifestCount = ingestionList.filter(i => i.type === 'manifest').length;
  const wasmCount = ingestionList.filter(i => i.type === 'wasm').length;
  const contractCount = ingestionList.filter(i => i.type === 'contract').length;

  const handleConfirm = () => {
    onConfirm(ingestionList.filter(i => i.selected).map(i => i.file));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl wb-surface border wb-outline rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors duration-500"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ScrollText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] wb-text">Industrial Ingestion Wizard</h2>
              <p className="text-[9px] wb-text-muted uppercase font-bold mt-0.5">OMEGA Era 7.1 • Asset Synchronization</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/20 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {(manifestCount > 1 || wasmCount > 1 || contractCount > 1) && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xs flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[9px] text-amber-500/80 font-bold uppercase tracking-tight">
                Multiple primary files detected. Please select which one to treat as canonical for each type.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* PRIMARY FILES */}
            {['manifest', 'wasm', 'contract'].map(type => {
              const items = ingestionList.filter(i => i.type === type);
              if (items.length === 0) return null;

              return (
                <div key={type} className="space-y-2">
                  <h3 className="text-[8px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                    {type === 'manifest' && <FileCode className="w-3 h-3 text-blue-400" />}
                    {type === 'wasm' && <Binary className="w-3 h-3 text-primary" />}
                    {type === 'contract' && <ScrollText className="w-3 h-3 text-purple-400" />}
                    <span>{type}s identified ({items.length})</span>
                  </h3>
                  <div className="space-y-1">
                    {items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setPrimary(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xs border transition-all ${
                          item.selected 
                            ? 'bg-primary/5 border-primary/40 text-primary' 
                            : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${item.selected ? 'border-primary bg-primary' : 'border-white/10'}`}>
                            {item.selected && <Check className="w-2.5 h-2.5 text-black" />}
                          </div>
                          <span className="text-[10px] font-mono truncate max-w-[300px]">{item.file.name}</span>
                        </div>
                        <span className="text-[7px] font-bold opacity-40 uppercase">
                          {Math.round(item.file.size / 1024)} KB
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* RESOURCES */}
            {ingestionList.some(i => i.type === 'resource') && (
              <div className="space-y-2">
                <h3 className="text-[8px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  <span>Other Resources ({ingestionList.filter(i => i.type === 'resource').length})</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {ingestionList.filter(i => i.type === 'resource').map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleSelect(item.id)}
                      className={`flex items-center gap-3 p-2 rounded-xs border transition-all ${
                        item.selected 
                          ? 'bg-black/10 wb-outline wb-text' 
                          : 'bg-black/5 wb-outline wb-text-muted hover:wb-text'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-xs border flex items-center justify-center transition-all ${item.selected ? 'border-white bg-white' : 'border-white/10'}`}>
                        {item.selected && <Check className="w-2 h-2 text-black" />}
                      </div>
                      <span className="text-[9px] font-mono truncate">{item.file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
          <button 
            onClick={onCancel}
            className="px-6 py-2 text-[10px] font-black uppercase wb-text-muted hover:wb-text transition-colors"
          >
            Abort Ingestion
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!ingestionList.some(i => i.selected)}
            className="px-8 py-3 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-xs hover:bg-primary/80 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_var(--wb-bloom)]"
          >
            <span>Confirm Injection</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
