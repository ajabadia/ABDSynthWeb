import React from 'react';

interface RackScrewsProps {
  skin: string;
}

/**
 * RackScrews (v7.2.3)
 * Renders decorative industrial mounting screws.
 */
export const RackScrews = ({ skin }: RackScrewsProps) => {
  const screwPositions = [
    { top: 12, left: 12 }, { top: 12, right: 12 },
    { bottom: 12, left: 12 }, { bottom: 12, right: 12 }
  ];

  return (
    <>
      {screwPositions.map((pos, i) => (
        <div 
          key={i} 
          className="absolute w-4 h-4 rounded-full flex items-center justify-center shadow-inner z-30"
          style={{ 
            ...pos, 
            background: skin === 'silver' ? 'radial-gradient(circle at 30% 30%, #eee, #888)' : 'radial-gradient(circle at 30% 30%, #444, #111)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
          }}
        >
          <div className={`w-0.5 h-2 rotate-45 rounded-full ${skin === 'silver' ? 'bg-black/20' : 'bg-white/10'}`} />
          <div className={`absolute w-0.5 h-2 -rotate-45 rounded-full ${skin === 'silver' ? 'bg-black/20' : 'bg-white/10'}`} />
        </div>
      ))}
    </>
  );
};
