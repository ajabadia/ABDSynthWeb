'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Database, Filter } from 'lucide-react';
import { ManifestEntity } from '@/types/manifest';
import CellPreview from '../inspector/CellPreview';

interface UniversalCellLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (dna: ManifestEntity) => void;
  resolveAsset?: (id: string | undefined) => string | undefined;
}

import { STORAGE_KEYS } from '../../constants/storage';

export default function UniversalCellLibraryModal({ 
  isOpen, onClose, onSelect, resolveAsset 
}: UniversalCellLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cells, setCells] = useState<ManifestEntity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadLibrary = async () => {
        setLoading(true);
        const flattenedCells: ManifestEntity[] = [];
        
        // 1. Load Static Library from Registry
        try {
          const res = await fetch('/assets/library-registry.json');
          const data = await res.json();
          const cellRegistry = data.cells || {};
          
          Object.entries(cellRegistry).forEach(([cat, items]: [string, unknown]) => {
            if (Array.isArray(items)) {
              items.forEach((item: ManifestEntity) => flattenedCells.push({ ...item, category: cat } as ManifestEntity));
            }
          });
          
          // 2. Load Local Library from LocalStorage
          const localStr = localStorage.getItem(STORAGE_KEYS.CELL_LIBRARY);
          if (localStr) {
            const localCells = JSON.parse(localStr) as ManifestEntity[];
            localCells.forEach((item: ManifestEntity) => flattenedCells.push({ ...item, category: 'Local', isLocal: true } as ManifestEntity));
          }
        } catch (err) {
          console.error("Error loading cell library:", err);
        }
        setCells(flattenedCells);
        setLoading(false);
      };

      loadLibrary();
    }
  }, [isOpen]);

  const filteredCells = cells.filter(cell => {
    const matchesSearch = cell.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cell.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || cell.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(cells.map(c => c.category).filter((c): c is string => !!c)))];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 overflow-hidden">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-6xl h-full max-h-[800px] wb-surface-strong border wb-outline rounded-lg flex flex-col shadow-2xl overflow-hidden"
        >
          {/* HEADER */}
          <div className="p-6 border-b wb-outline flex items-center justify-between bg-black/40">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                   <Database className="w-6 h-6 text-accent" />
                </div>
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tighter text-white">Universal Cell Library</h2>
                   <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Browse and ingest pre-configured industrial object DNA.</p>
                </div>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full border wb-outline flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-500 transition-all">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* TOOLBAR */}
          <div className="p-4 bg-black/20 border-b wb-outline flex items-center gap-4">
             <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text"
                  placeholder="Search object DNA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border wb-outline rounded-xs py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase text-white outline-none focus:border-accent/40 transition-all"
                />
             </div>
             <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-white/20" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-black/40 border wb-outline rounded-xs px-3 py-2 text-[8px] font-black uppercase text-accent outline-none"
                >
                   {categories.map(cat => (
                     <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat.toUpperCase()}</option>
                   ))}
                </select>
             </div>
          </div>

          {/* GRID AREA */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/10">
             {loading ? (
                <div className="h-full flex items-center justify-center flex-col gap-4">
                   <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                   <span className="text-[10px] font-black uppercase text-accent animate-pulse tracking-widest">Synchronizing Library...</span>
                </div>
             ) : filteredCells.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {filteredCells.map((cell) => (
                     <button
                       key={cell.id}
                       onClick={async () => {
                         try {
                           if (cell.isLocal) {
                             // For local cells, the DNA is already in the object (minus UI/Metadata)
                             onSelect(cell);
                           } else {
                            if (cell.path) {
                               const res = await fetch(cell.path);
                               const dna = await res.json();
                               onSelect(dna);
                            }
                           }
                         } catch (err) {
                           console.error("Failed to load cell DNA", err);
                         }
                       }}
                       className="group relative flex flex-col bg-black/40 border wb-outline rounded-xs overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_rgba(0,242,255,0.05)] transition-all text-left"
                     >
                        {/* MINI PREVIEW */}
                        <div className="h-40 bg-[#050505] flex items-center justify-center relative border-b wb-outline">
                           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '10px 10px' }} />
                           <div className="scale-[0.8] transition-transform group-hover:scale-[0.9]">
                              <CellPreview 
                                item={{ ...cell, id: 'preview', presentation: cell.presentation }} 
                                resolveAsset={resolveAsset} 
                              />
                           </div>
                           <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 border wb-outline rounded-[2px]">
                              <span className="text-[6px] font-black text-accent uppercase">{cell.category}</span>
                           </div>
                        </div>

                        <div className="p-3 space-y-1 bg-black/20">
                           <h4 className="text-[10px] font-black uppercase text-white truncate group-hover:text-accent transition-colors">{cell.name}</h4>
                           <p className="text-[7px] text-white/40 font-bold uppercase tracking-tight line-clamp-1">{cell.description || 'Industrial Component DNA'}</p>
                        </div>

                        <div className="absolute inset-0 border-2 border-accent/0 group-hover:border-accent/10 pointer-events-none transition-all" />
                     </button>
                   ))}
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                   <Database className="w-16 h-16" />
                   <div className="text-center">
                      <p className="text-[12px] font-black uppercase">No Objects Found</p>
                      <p className="text-[8px] font-bold uppercase">Refine your search or category filter</p>
                   </div>
                </div>
             )}
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t wb-outline bg-black/40 flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Library Integrity</span>
                   <span className="text-[8px] font-black text-accent uppercase">SYS_READY • {cells.length} OBJS</span>
                </div>
             </div>
             <button 
               onClick={onClose}
               className="px-8 py-3 rounded-xs border wb-outline text-[10px] font-black uppercase hover:bg-white/5 transition-all"
             >
               Close Library
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
