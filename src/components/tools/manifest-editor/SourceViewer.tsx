'use client';

import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { Copy, FileCode, Pencil, Check, X, AlertTriangle } from 'lucide-react';

interface SourceViewerProps {
  manifest: Record<string, any>;
  selectedItemId: string | null;
  onUpdate?: (newManifest: any) => void;
}

export default function SourceViewer({ manifest, selectedItemId, onUpdate }: SourceViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSource, setEditedSource] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Serialize YAML for viewing
  const yamlSource = yaml.dump(manifest, { 
    indent: 2, 
    lineWidth: -1, 
    noRefs: true,
    sortKeys: false,
    schema: yaml.JSON_SCHEMA 
  });

  useEffect(() => {
    if (!isEditing) {
      setEditedSource(yamlSource);
    }
  }, [yamlSource, isEditing]);

  const lines = (isEditing ? editedSource : yamlSource).split('\n');
  
  // Highlighting Logic for focus
  let highlightRange: [number, number] | null = null;
  if (selectedItemId && !isEditing) {
    const idPattern = new RegExp(`id:\\s*['"]?${selectedItemId}['"]?\\s*$`);
    const idLineIdx = lines.findIndex(line => idPattern.test(line));
    
    if (idLineIdx !== -1) {
      let startIdx = idLineIdx;
      while (startIdx > 0 && !lines[startIdx].trim().startsWith('-') && !lines[startIdx-1].trim().endsWith(':')) {
        startIdx--;
      }
      
      const baseIndent = lines[startIdx].search(/\S/);
      let endIdx = idLineIdx + 1;
      while (endIdx < lines.length) {
        if (lines[endIdx].trim() !== '') {
          const lineIndent = lines[endIdx].search(/\S/);
          if (lineIndent !== -1 && lineIndent <= baseIndent && (lines[endIdx].trim().startsWith('-') || lines[endIdx].includes(':'))) {
            if (lineIndent < baseIndent || (lineIndent === baseIndent && lines[endIdx].trim().startsWith('-'))) break;
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

  const handleSave = () => {
    try {
      const parsed = yaml.load(editedSource);
      if (parsed && typeof parsed === 'object') {
        onUpdate?.(parsed);
        setIsEditing(false);
        setError(null);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const renderHighlightedLine = (line: string) => {
    // Basic Regex-based Syntax Highlighting
    const keyMatch = line.match(/^(\s*)([^:]+)(:)(.*)$/);
    if (keyMatch) {
      const [, indent, key, colon, value] = keyMatch;
      const isListItem = key.trim().startsWith('-');
      
      return (
        <>
          <span className="text-white/20">{indent}</span>
          {isListItem && <span className="text-white/40">- </span>}
          <span className="text-cyan-400 font-bold">{isListItem ? key.trim().substring(2) : key.trim()}</span>
          <span className="text-white/40">{colon}</span>
          <span className="text-amber-200">{value}</span>
        </>
      );
    }
    
    if (line.trim().startsWith('-')) {
       return <span className="text-amber-200">{line}</span>;
    }

    return <span>{line}</span>;
  };

  return (
    <div className="h-full flex flex-col wb-bg p-8 overflow-hidden font-mono transition-colors duration-500">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center rounded-xs shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                <FileCode className="w-5 h-5 wb-text-muted" />
             </div>
             <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] wb-text">Manifest Source</h2>
                <p className="text-[8px] wb-text-muted uppercase tracking-widest">{manifest.id || 'unnamed_module'}.acemm</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:border-accent/40 text-[8px] font-black uppercase tracking-widest text-accent transition-all rounded-xs group"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Manual Edit</span>
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-outline/20 hover:bg-white/10 hover:border-white/40 text-[8px] font-black uppercase tracking-widest text-foreground/60 transition-all rounded-xs group"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 text-[8px] font-black uppercase tracking-widest text-green-400 transition-all rounded-xs shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Inject Changes</span>
                </button>
                <button 
                  onClick={() => { setIsEditing(false); setError(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-[8px] font-black uppercase tracking-widest text-red-400 transition-all rounded-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* CODE BLOCK */}
        <div className={`flex-1 wb-surface border ${error ? 'border-red-500/50' : 'wb-outline'} rounded-sm overflow-hidden flex flex-col shadow-2xl transition-all duration-500 relative`}>
          <div className="flex items-center justify-between px-4 py-2 border-b wb-outline bg-black/5">
             <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full ${isEditing ? 'bg-accent animate-pulse' : 'bg-red-500/20'}`} />
               <div className="w-2 h-2 rounded-full bg-amber-500/20" />
               <div className="w-2 h-2 rounded-full bg-green-500/20" />
               <span className="ml-4 text-[7px] font-black wb-text-muted uppercase tracking-[0.2em]">
                 {isEditing ? 'Live Manual Override Mode' : 'YAML Serialized Output'}
               </span>
             </div>
             {error && (
               <div className="flex items-center gap-2 text-red-400 text-[7px] font-bold uppercase animate-bounce">
                 <AlertTriangle className="w-3 h-3" />
                 <span>YAML Syntax Error Detected</span>
               </div>
             )}
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {isEditing ? (
              <textarea
                value={editedSource}
                onChange={(e) => setEditedSource(e.target.value)}
                className="w-full h-full bg-black/20 p-6 text-[11px] font-mono text-cyan-50/80 outline-none resize-none custom-scrollbar leading-relaxed"
                spellCheck={false}
              />
            ) : (
              <div className="w-full h-full overflow-auto p-4 custom-scrollbar wb-bg">
                <pre className="text-[11px] leading-relaxed font-mono">
                  {lines.map((line, idx) => {
                    const isHighlighted = highlightRange && idx >= highlightRange[0] && idx <= highlightRange[1];
                    return (
                      <div 
                        key={idx} 
                        className={`px-4 min-h-[1.5em] transition-colors duration-300 flex ${isHighlighted ? 'bg-primary/10 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                      >
                        <span className={`mr-4 opacity-20 select-none inline-block w-6 text-right wb-text-muted shrink-0`}>{idx + 1}</span>
                        <div className={isHighlighted ? 'font-bold' : 'opacity-80'}>
                          {renderHighlightedLine(line)}
                        </div>
                      </div>
                    );
                  })}
                </pre>
              </div>
            )}
          </div>

          {error && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-red-950/90 border-t border-red-500/20 backdrop-blur-md">
               <p className="text-[9px] font-mono text-red-300/80 leading-tight">{error}</p>
            </div>
          )}
        </div>

        {/* FOOTER HINT */}
        <div className="text-center">
           <p className="text-[7px] wb-text-muted font-black uppercase tracking-[0.4em]">
             {isEditing ? 'Caution: Direct manipulation bypasses visual safety constraints' : 'Aseptic Engineering Standard V7.2.3'}
           </p>
        </div>
      </div>
    </div>
  );
}
