'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shield, RotateCcw, Terminal, HelpCircle } from 'lucide-react';

import { AuditResult } from '@/services/auditService';
import { ComplianceBadge } from './ComplianceBadge';

// Modular Components
import ViewModeSelector from './header/ViewModeSelector';
import DeploymentMenu from './header/DeploymentMenu';
import ThemeToggle from './header/ThemeToggle';

interface HeaderProps {
  onReset: () => void;
  onExportManifest: () => void;
  onExportPack: () => void;
  onExportCAD: () => void;
  onExportContract: (format: 'ts' | 'cpp') => void;
  onGenerateMockup: () => void;
  onDeploy: () => void;
  onToggleLogs: () => void;
  showLogs: boolean;
  viewMode: 'orbital' | 'rack' | 'source';
  setViewMode: (mode: 'orbital' | 'rack' | 'source') => void;
  onHelp: () => void;
  uiTheme: 'dark' | 'light';
  setUiTheme: (theme: 'dark' | 'light') => void;
  audit: AuditResult;
  onOpenAudit: () => void;
}

export default function Header(props: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-11 border-b wb-outline wb-surface backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0 transition-colors duration-500">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-primary/20 border border-primary/40 rounded-xs flex items-center justify-center">
            <Shield className="w-3 h-3 text-primary" />
          </div>
        </div>
        
        <div className="h-8 w-px bg-outline/20" />
        <ComplianceBadge audit={props.audit} onClick={props.onOpenAudit} />
        <div className="h-8 w-px bg-outline/20" />
        <ViewModeSelector viewMode={props.viewMode} setViewMode={props.setViewMode} />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle uiTheme={props.uiTheme} setUiTheme={props.setUiTheme} />
        <div className="h-6 w-px wb-outline opacity-20 mx-1" />
        
        <button onClick={props.onHelp} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-sm hover:bg-primary/20 transition-all text-[8px] font-black uppercase tracking-widest text-primary group">
          <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Manual</span>
        </button>

        <button onClick={props.onReset} className="flex items-center gap-2 px-3 py-1.5 wb-surface border wb-outline rounded-sm hover:bg-red-500/10 hover:border-red-500/40 text-[8px] font-black uppercase tracking-widest wb-text-muted hover:text-red-500 transition-all group">
          <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset</span>
        </button>

        <DeploymentMenu 
          showMenu={showMenu} setShowMenu={setShowMenu} menuRef={menuRef}
          onExportManifest={props.onExportManifest} onExportPack={props.onExportPack}
          onExportCAD={props.onExportCAD} onExportContract={props.onExportContract}
          onGenerateMockup={props.onGenerateMockup} onDeploy={props.onDeploy}
        />

        <button 
          onClick={props.onToggleLogs}
          className={`flex items-center gap-2 px-4 py-2 border rounded-xs text-[8px] font-black uppercase tracking-widest transition-all ${props.showLogs ? 'bg-accent border-accent text-black' : 'bg-black/40 border-outline text-foreground/60 hover:border-accent/40'}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Logs</span>
        </button>
      </div>
    </header>
  );
}
