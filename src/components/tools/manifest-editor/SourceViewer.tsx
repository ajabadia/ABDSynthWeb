'use client';

import React from 'react';
import yaml from 'js-yaml';
import { Copy, FileCode } from 'lucide-react';

interface SourceViewerProps {
  manifest: Record<string, any>;
}

export default function SourceViewer({ manifest }: SourceViewerProps) {
  const yamlSource = yaml.dump(manifest, { 
    indent: 2, 
    lineWidth: -1, 
    noRefs: true,
    sortKeys: false 
  });

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
          <div className="flex-1 overflow-auto p-8 custom-scrollbar">
            <pre className="text-[11px] leading-relaxed text-primary/80">
              {yamlSource}
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
