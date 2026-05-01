'use client';

import React from 'react';
import yaml from 'js-yaml';
import { Copy, FileCode } from 'lucide-react';

interface SourceViewerProps {
  manifest: Record<string, any>;
  selectedItemId: string | null;
}

export default function SourceViewer({ manifest, selectedItemId }: SourceViewerProps) {
  const yamlSource = yaml.dump(manifest, { 
    indent: 2, 
    lineWidth: -1, 
    noRefs: true,
    sortKeys: false 
  });

  const lines = yamlSource.split('\n');
  
  // Highlighting Logic: Find the range of lines for the selected item
  let highlightRange: [number, number] | null = null;
  if (selectedItemId) {
    const idPattern = new RegExp(`id:\\s*['"]?${selectedItemId}['"]?\\s*$`);
    const idLineIdx = lines.findIndex(line => idPattern.test(line));
    
    if (idLineIdx !== -1) {
      // Find where this item block starts (the nearest - or the id line itself if not in a list)
      let startIdx = idLineIdx;
      while (startIdx > 0 && !lines[startIdx].trim().startsWith('-')) {
        startIdx--;
      }
      
      // Find where it ends (until next line with same or less indentation)
      const baseIndent = lines[startIdx].search(/\S/);
      let endIdx = idLineIdx + 1;
      while (endIdx < lines.length) {
        if (lines[endIdx].trim() !== '') {
          const lineIndent = lines[endIdx].search(/\S/);
          if (lineIndent !== -1 && lineIndent <= baseIndent && lines[endIdx].trim().startsWith('-')) {
            break;
          }
          if (lineIndent !== -1 && lineIndent < baseIndent) {
            break;
          }
        }
        endIdx++;
      }
      highlightRange = [startIdx, endIdx - 1];
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(yamlSource);
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] p-8 overflow-hidden font-mono">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-xs">
                <FileCode className="w-5 h-5 text-foreground/40" />
             </div>
             <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80">Manifest Source</h2>
                <p className="text-[8px] text-foreground/20 uppercase tracking-widest">{manifest.id || 'unnamed_module'}.acemm</p>
             </div>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-outline/20 hover:bg-white/10 hover:border-white/40 text-[8px] font-black uppercase tracking-widest text-foreground/60 transition-all rounded-xs group"
          >
            <Copy className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span>Copy to Clipboard</span>
          </button>
        </div>

        {/* CODE BLOCK */}
        <div className="flex-1 bg-black/40 border border-outline/10 rounded-sm overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-outline/5 bg-black/40">
             <div className="w-2 h-2 rounded-full bg-red-500/20" />
             <div className="w-2 h-2 rounded-full bg-amber-500/20" />
             <div className="w-2 h-2 rounded-full bg-green-500/20" />
             <span className="ml-4 text-[7px] font-black text-foreground/20 uppercase tracking-[0.2em]">YAML Serialized Output</span>
          </div>
          <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#020202]">
            <pre className="text-[11px] leading-relaxed font-mono">
              {lines.map((line, idx) => {
                const isHighlighted = highlightRange && idx >= highlightRange[0] && idx <= highlightRange[1];
                return (
                  <div 
                    key={idx} 
                    className={`px-4 min-h-[1.5em] transition-colors duration-300 ${isHighlighted ? 'bg-primary/10 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                  >
                    <span className={`mr-4 opacity-10 select-none inline-block w-6 text-right`}>{idx + 1}</span>
                    <span className={isHighlighted ? 'text-primary font-bold' : 'text-primary/60'}>
                      {line}
                    </span>
                  </div>
                );
              })}
            </pre>
          </div>
        </div>

        {/* FOOTER HINT */}
        <div className="text-center">
           <p className="text-[7px] text-foreground/20 font-black uppercase tracking-[0.4em]">Aseptic Engineering Standard V7.1</p>
        </div>
      </div>
    </div>
  );
}
