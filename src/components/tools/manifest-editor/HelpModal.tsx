'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronRight, BookOpen, Cpu, Info } from 'lucide-react';
import { HELP_DATA, HelpSection } from './helpData';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSectionId?: string;
}

export default function HelpModal({ isOpen, onClose, initialSectionId }: HelpModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialSectionId) {
      // Find which main section contains this ID (could be section or subsection)
      const section = HELP_DATA.find(s => 
        s.id === initialSectionId || s.subsections?.some(sub => sub.id === initialSectionId)
      );
      if (section) {
        setExpandedSection(section.id);
        // Small delay to allow accordion to open before scrolling
        setTimeout(() => {
          const element = document.getElementById(`help-anchor-${initialSectionId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else if (isOpen) {
      setExpandedSection('introduccion');
    }
  }, [isOpen, initialSectionId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
        {/* BACKDROP */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* MODAL CONTAINER */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-3xl h-[80vh] bg-[#111] border border-white/10 rounded-xs shadow-2xl flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex-none p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white">Manual de Ingeniería</h2>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5">OMEGA ERA 7.1 — Standard Documentation</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <X className="w-5 h-5 text-white/20 group-hover:text-white" />
            </button>
          </div>

          {/* CONTENT AREA */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
            {HELP_DATA.map((section) => (
              <div key={section.id} id={`help-anchor-${section.id}`} className="space-y-2">
                <button 
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xs border transition-all ${
                    expandedSection === section.id 
                      ? 'bg-primary/5 border-primary/40' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{section.icon}</span>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${expandedSection === section.id ? 'text-primary' : 'text-white/60'}`}>
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === section.id ? 'rotate-90 text-primary' : 'text-white/20'}`} />
                </button>

                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2 space-y-6 border-x border-b border-white/5 bg-black/20 rounded-b-xs">
                        <p className="text-xs text-white/50 leading-relaxed font-medium italic">
                          {section.content}
                        </p>

                        {section.subsections && (
                          <div className="space-y-6">
                            {section.subsections.map(sub => (
                              <div key={sub.id} id={`help-anchor-${sub.id}`} className="space-y-3 pl-4 border-l border-primary/20 hover:border-primary transition-colors">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-primary/80 flex items-center gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_rgba(0,240,255,1)]" />
                                  {sub.title}
                                </h4>
                                <p className="text-[11px] text-white/70 leading-relaxed">
                                  {sub.content}
                                </p>
                                {sub.technical_params && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {sub.technical_params.map(p => (
                                      <code key={p} className="px-2 py-0.5 bg-black border border-white/10 rounded text-[9px] font-mono text-accent">
                                        {p}
                                      </code>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex-none p-4 bg-black border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-primary/40" />
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">
                Engineering Standard Compliance: ERA 7.1 — Guardián V3
              </span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse" />
               <span className="text-[9px] font-bold text-white/40 uppercase">System Ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
