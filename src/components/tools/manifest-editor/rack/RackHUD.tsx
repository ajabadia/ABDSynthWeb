'use client';

import React from 'react';
import { Settings2, PlayCircle } from 'lucide-react';

import { ManifestEntity, TabName } from '@/types/manifest';

interface RackHUDProps {
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  activeTab: TabName;
  setActiveTab: (val: TabName) => void;
  allElements: ManifestEntity[];
}

/**
 * RackHUD (v7.2.3)
 * Industrial overlay for rack mode switching and tab navigation.
 */
export const RackHUD = ({ 
  isLiveMode, 
  setIsLiveMode, 
  activeTab, 
  setActiveTab, 
  allElements 
}: RackHUDProps) => {
  const tabs = ['MAIN', 'FX', 'EDIT', 'MIDI', 'MOD'];

  return (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50" onClick={(e) => e.stopPropagation()}>
      {/* MODE TOGGLE */}
      <div className="flex wb-surface border wb-outline rounded-full p-1 shadow-2xl backdrop-blur-md transition-colors duration-500">
        <button 
          onClick={() => setIsLiveMode(false)} 
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black tracking-[0.15em] transition-all ${!isLiveMode ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,240,255,0.3)]' : 'wb-text-muted hover:wb-text'}`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>ENGINEERING</span>
        </button>
        <button 
          onClick={() => setIsLiveMode(true)} 
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black tracking-[0.15em] transition-all ${isLiveMode ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,140,0,0.3)]' : 'wb-text-muted hover:wb-text'}`}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span>LIVE</span>
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-1 wb-surface p-1 rounded-full border wb-outline shadow-2xl backdrop-blur-md transition-colors duration-500">
        {tabs.map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            className={`px-5 py-2 rounded-full text-[9px] font-black tracking-[0.15em] transition-all flex items-center gap-3 ${activeTab === t ? (isLiveMode ? 'bg-accent text-white shadow-[0_0_10px_rgba(255,140,0,0.2)]' : 'bg-primary text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]') : 'wb-text-muted hover:wb-text'}`}
          >
            <span>{t}</span>
            {!isLiveMode && (
              <span className={`px-2 py-0.5 rounded-full text-[7px] font-mono ${activeTab === t ? 'bg-white/20 text-white' : 'bg-outline/20 wb-text-muted'}`}>
                {allElements.filter(i => (i.presentation?.tab || 'MAIN') === t).length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
