'use client';

import React from 'react';
import { Settings2, PlayCircle } from 'lucide-react';

interface RackHUDProps {
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (val: string) => void;
  allElements: any[];
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
      <div className="flex bg-black/80 border border-white/10 rounded-full p-1 shadow-2xl backdrop-blur-md">
        <button 
          onClick={() => setIsLiveMode(false)} 
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${!isLiveMode ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}
        >
          <Settings2 className="w-3 h-3" />
          <span>ENGINEERING</span>
        </button>
        <button 
          onClick={() => setIsLiveMode(true)} 
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all ${isLiveMode ? 'bg-accent text-background shadow-lg' : 'text-white/40 hover:text-white'}`}
        >
          <PlayCircle className="w-3 h-3" />
          <span>LIVE</span>
        </button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-1 bg-black/60 p-1 rounded-full border border-white/10 shadow-2xl">
        {tabs.map(t => (
          <button 
            key={t} 
            onClick={() => setActiveTab(t)} 
            className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all flex items-center gap-2 ${activeTab === t ? (isLiveMode ? 'bg-accent text-background' : 'bg-primary text-background') : 'text-white/40 hover:text-white'}`}
          >
            <span>{t}</span>
            {!isLiveMode && (
              <span className={`px-1.5 rounded-full text-[7px] ${activeTab === t ? 'bg-background text-primary' : 'bg-white/10 text-white/40'}`}>
                {allElements.filter(i => (i.presentation?.tab || 'MAIN') === t).length}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
