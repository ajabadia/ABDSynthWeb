'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, ChevronRight, BookOpen, Cpu, Info, Copy } from 'lucide-react';
import { HELP_DATA, HelpSection } from './helpData';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSectionId?: string;
}

// HELPER: Simple Syntax Highlighter for C++/YAML
const highlightCode = (code: string) => {
  if (!code) return code;
  // Keywords (C++)
  const keywords = /\b(extern|void|float|int|if|for|return|const|char|uint8_t|include|pragma|once)\b/g;
  // Strings
  const strings = /("[^"]*")/g;
  // Macros/Headers
  const macros = /(#\w+|omega_\w+)/g;

  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
    .replace(keywords, '<span class="text-primary">$1</span>')
    .replace(strings, '<span class="text-green-400/80">$1</span>')
    .replace(macros, '<span class="text-accent">$1</span>');
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="absolute top-3 right-3 z-[10] p-2 bg-black/60 hover:bg-primary/20 rounded-xs border border-white/10 hover:border-primary/40 transition-all group"
      title="Copiar código"
    >
      {copied ? (
        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest px-1">Copiado!</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-black text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
          <Copy className="w-3 h-3 text-white/40 group-hover:text-primary transition-colors" />
        </div>
      )}
    </button>
  );
};

export default function HelpModal({ isOpen, onClose, initialSectionId }: HelpModalProps) {
  const [activeCategory, setActiveCategory] = useState<'user' | 'developer'>('user');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialSectionId) {
      const section = HELP_DATA.find(s => 
        s.id === initialSectionId || s.subsections?.some(sub => sub.id === initialSectionId)
      );
      if (section) {
        setActiveCategory(section.category);
        setExpandedSection(section.id);
        setTimeout(() => {
          const element = document.getElementById(`help-anchor-${initialSectionId}`);
          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else if (isOpen) {
      setExpandedSection(activeCategory === 'user' ? 'introduccion' : 'sdk_core');
    }
  }, [isOpen, initialSectionId, activeCategory]);

  if (!isOpen) return null;

  const filteredData = HELP_DATA.filter(s => s.category === activeCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        <motion.div 
          initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
          className="relative w-full max-w-4xl h-[85vh] bg-[#080808] border border-white/10 rounded-sm shadow-2xl flex flex-col overflow-hidden"
        >
          {/* HEADER */}
          <div className="flex-none p-6 border-b border-white/10 bg-black/60 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Ingeniería OMEGA v7.2.3</h2>
                <p className="text-[8px] font-mono text-primary/60 uppercase tracking-widest mt-1">Unified Documentation System</p>
              </div>

              <div className="flex bg-white/5 p-1 rounded-xs border border-white/5 ml-4">
                 <button 
                   onClick={() => { setActiveCategory('user'); setExpandedSection('introduccion'); }}
                   className={`px-6 py-1.5 rounded-xs text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === 'user' ? 'bg-primary text-black' : 'text-white/40 hover:text-white'}`}
                 >
                   Manual Usuario
                 </button>
                 <button 
                   onClick={() => { setActiveCategory('developer'); setExpandedSection('sdk_core'); }}
                   className={`px-6 py-1.5 rounded-xs text-[9px] font-black uppercase tracking-widest transition-all ${activeCategory === 'developer' ? 'bg-accent text-black' : 'text-white/40 hover:text-white'}`}
                 >
                   Guía SDK (Dev)
                 </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <X className="w-5 h-5 text-white/20 group-hover:text-white" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {filteredData.map((section) => (
              <div key={section.id} id={`help-anchor-${section.id}`} className="space-y-2">
                <button 
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className={`w-full flex items-center justify-between p-5 rounded-xs border transition-all ${
                    expandedSection === section.id ? 'bg-white/[0.03] border-white/20' : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <span className="text-2xl">{section.icon}</span>
                    <span className={`text-[12px] font-black uppercase tracking-[0.2em] ${expandedSection === section.id ? 'text-white' : 'text-white/60'}`}>
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${expandedSection === section.id ? 'rotate-90 text-primary' : 'text-white/10'}`} />
                </button>

                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-8 pt-2 space-y-8 border-x border-b border-white/5 bg-black/40 rounded-b-xs">
                        <p className="text-[11px] text-white/40 leading-relaxed font-medium italic">{section.content}</p>

                        {section.subsections?.map(sub => (
                          <div key={sub.id} id={`help-anchor-${sub.id}`} className="space-y-4 pl-6 border-l-2 border-white/5 hover:border-primary/40 transition-colors">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
                              {sub.title}
                            </h4>
                            <p className="text-[11px] text-white/70 leading-relaxed max-w-2xl">{sub.content}</p>
                            
                            {sub.code && (
                              <div className="relative group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xs blur opacity-20 group-hover:opacity-40 transition-opacity" />
                                <CopyButton text={sub.code} />
                                <pre className="relative bg-[#0a0a0a] border border-white/10 p-5 pt-8 rounded-xs overflow-x-auto custom-scrollbar">
                                  <code 
                                    className="text-[10px] font-mono leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: highlightCode(sub.code) }}
                                  />
                                </pre>
                              </div>
                            )}

                            {sub.technical_params && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {sub.technical_params.map(p => (
                                  <code key={p} className="px-3 py-1 bg-black border border-white/10 rounded-full text-[9px] font-mono text-accent/80">{p}</code>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="flex-none p-5 bg-black border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary/40">
              <Cpu className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Protocol: SECURE // ERA 4 Compliance</span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-white/40">
               <Info className="w-3 h-3 text-primary" />
               <span className="text-[9px] font-black uppercase tracking-widest">v7.2.3 Production</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
