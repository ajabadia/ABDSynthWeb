'use client';

import React from 'react';
import ComplianceBadge from './ComplianceBadge';

interface WorkbenchFooterProps {
  auditResult: any;
  manifest: any;
}

/**
 * WorkbenchFooter (v7.2.3)
 * Industrial status bar for the OMEGA Manifest Editor.
 */
const WorkbenchFooter = ({ auditResult, manifest }: WorkbenchFooterProps) => {
  return (
    <footer className="h-6 border-t border-outline/20 bg-black flex items-center justify-between px-6 z-50 shrink-0">
      <div className="flex-1 flex items-center gap-4 text-[7px] font-mono uppercase tracking-[0.2em] text-foreground/20">
        <span className="text-primary/40 font-black">Build v7.2.3</span>
        <span className="opacity-50">//</span>
        <span>Aseptic Standard</span>
      </div>

      <div className="flex-1 flex justify-center scale-[0.7] origin-center opacity-80 hover:opacity-100 transition-opacity">
        <ComplianceBadge audit={auditResult} manifest={manifest} />
      </div>
      
      <div className="flex-1 flex items-center justify-end gap-4 text-[7px] font-mono uppercase tracking-[0.2em] text-foreground/20">
        <span>Industrial Era 7 Engineering Suite</span>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/20 border border-green-500/40 animate-pulse" />
      </div>
    </footer>
  );
};

export default WorkbenchFooter;
