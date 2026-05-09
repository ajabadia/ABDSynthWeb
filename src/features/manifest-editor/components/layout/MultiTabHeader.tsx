"use client";

import React from 'react';
import { X, LucideIcon } from 'lucide-react';
import { WorkbenchTab, WorkbenchPaneId } from '../../hooks/useWorkbenchState';

interface MultiTabHeaderProps {
  paneId: WorkbenchPaneId;
  tabs: WorkbenchTab[];
  activeTabId: string | null;
  isFocused: boolean;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onPaneFocus: () => void;
}

export default function MultiTabHeader({
  paneId,
  tabs,
  activeTabId,
  isFocused,
  onTabSelect,
  onTabClose,
  onPaneFocus
}: MultiTabHeaderProps) {
  if (tabs.length === 0) return null;

  return (
    <div 
      className={`flex items-center bg-black/40 border-b wb-outline h-9 px-1 gap-1 select-none transition-colors duration-300 ${isFocused ? 'bg-black/60 border-primary/20' : 'border-transparent'}`}
      onClick={onPaneFocus}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const Icon = tab.icon as LucideIcon;

        return (
          <div
            key={tab.id}
            onClick={(e) => {
              e.stopPropagation();
              onTabSelect(tab.id);
            }}
            className={`
              relative flex items-center gap-2 h-7 px-3 rounded-xs cursor-pointer transition-all duration-300 group
              ${isActive 
                ? 'bg-primary/10 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)]' 
                : 'text-foreground/40 hover:text-foreground/70 hover:bg-white/5 border border-transparent'}
            `}
          >
            {/* Active Indicator Glow */}
            {isActive && (
              <div className="absolute inset-x-0 -bottom-[5px] h-[2px] bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
            )}

            {Icon && typeof Icon !== 'string' && (
              <Icon className={`w-3 h-3 ${isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground/60'}`} />
            )}

            <span className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
              {tab.title}
            </span>

            {tab.closable !== false && !tab.persistent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-white/10 text-foreground/20 hover:text-red-400 transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        );
      })}

      <div className="flex-1 h-full" />
      
      {/* Pane ID Indicator (Subtle) */}
      <div className="px-2 opacity-10 flex items-center">
        <span className="text-[7px] font-black uppercase tracking-tighter italic">
          PANE::{paneId.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
