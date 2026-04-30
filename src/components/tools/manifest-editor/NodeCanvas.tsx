'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface NodeCanvasItem {
  id: string;
  label?: string;
  bind?: string;
  type?: string;
  presentation?: {
    attachments?: any[];
  };
}

interface NodeCanvasProps {
  manifest: {
    id?: string;
    schemaVersion?: string;
    ui?: {
      controls?: NodeCanvasItem[];
      jacks?: NodeCanvasItem[];
    };
    registry?: NodeCanvasItem[];
  };
  contract: {
    omega_version?: string;
    parameters?: { id: string }[];
    ports?: { id: string }[];
  } | null;
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
}

export default function NodeCanvas({ manifest, contract, selectedItemId, onSelectItem }: NodeCanvasProps) {
  const isV7 = manifest?.schemaVersion?.startsWith('7') || manifest?.schemaVersion === '7.0';
  
  // Combine all items for visualization
  const items = isV7 
    ? [...(manifest?.ui?.controls || []), ...(manifest?.ui?.jacks || [])]
    : (manifest?.registry || []);
  
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      {/* BACKGROUND GRID */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="relative flex items-center justify-center">
        {/* CENTER NODE (WASM/MODULE) */}
        <motion.div 
          layoutId="center-node"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 w-32 h-32 rounded-full border-2 border-primary/40 flex flex-col items-center justify-center bg-black/80 cyan-bloom shadow-[0_0_30px_rgba(0,240,255,0.1)]"
        >
          <div className="text-[8px] font-bold text-primary/50 uppercase tracking-[0.2em] mb-1">Module ID</div>
          <div className="text-sm font-headline font-bold text-primary italic uppercase tracking-tighter truncate max-w-[100px]">
            {manifest?.id || '???'}
          </div>
          
          {contract && (
             <motion.div 
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-2 text-[7px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 uppercase font-bold"
             >
               Contract v{contract.omega_version || '7.0'}
             </motion.div>
          )}
        </motion.div>

        {/* PARAMETERS NODES (ORBITAL) */}
        <AnimatePresence>
          {items.map((item: NodeCanvasItem, index: number) => {
            const angle = (index / items.length) * (2 * Math.PI);
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            // Mapping Check (Case-Insensitive)
            const bindId = (isV7 ? item.bind : item.id)?.toLowerCase();
            const isJack = isV7 && manifest?.ui?.jacks?.some((j: NodeCanvasItem) => j.id === item.id);
            
            const inContract = isJack
              ? contract?.ports?.some((p: { id: string }) => p.id.toLowerCase() === bindId)
              : contract?.parameters?.some((p: { id: string }) => p.id.toLowerCase() === bindId);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, x, y }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute z-10 group"
                onClick={() => onSelectItem(item.id)}
              >
                {/* Connection Line */}
                <svg className="absolute top-1/2 left-1/2 overflow-visible pointer-events-none" style={{ width: 0, height: 0 }}>
                   <motion.line 
                     initial={{ pathLength: 0 }}
                     animate={{ pathLength: 1 }}
                     x1={0} y1={0} x2={-x} y2={-y} 
                     stroke="currentColor" 
                     className={`${inContract || !contract ? (isJack ? 'text-accent/20' : 'text-primary/20') : 'text-red-500/20'} stroke-[1px]`}
                     strokeDasharray="4 4"
                   />
                </svg>

                <div className={`
                  w-10 h-10 rounded-sm border transform -translate-x-1/2 -translate-y-1/2 
                  flex items-center justify-center transition-all duration-300 cursor-pointer
                  ${selectedItemId === item.id ? (isJack ? 'scale-110 border-accent ring-2 ring-accent/20 bg-accent/20' : 'scale-110 border-primary ring-2 ring-primary/20 bg-primary/20') : (isJack ? 'bg-black/60 border-accent/30 hover:border-accent hover:orange-bloom' : 'bg-black/60 border-primary/30 hover:border-primary hover:cyan-bloom')}
                `}>
                  <span className={`text-[8px] font-bold uppercase tracking-tighter text-center px-1 ${inContract || !contract ? (isJack ? 'text-accent/70' : 'text-primary/70') : 'text-red-400'}`}>
                    {(item.label || item.id).substring(0, 4)}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface border border-outline p-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                     <div className="text-[9px] font-bold text-foreground uppercase">{item.label || item.id}</div>
                     <div className="text-[7px] text-foreground/40 mt-1 uppercase">
                       {isV7 ? `Bind: ${item.bind}` : `Type: ${item.type}`}
                     </div>
                     {!inContract && contract && (
                       <div className="text-[7px] text-red-400 mt-1 font-bold">MISSING IN CONTRACT</div>
                     )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ORBITAL RINGS */}
        <div className="absolute inset-[-180px] rounded-full border border-outline/5 pointer-events-none" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-185px] rounded-full border border-primary/5 border-dashed pointer-events-none"
        />
      </div>

      <div className="absolute bottom-8 left-8 text-[9px] font-mono text-primary/30 uppercase tracking-widest leading-relaxed">
        Engine: OMEGA v7.0<br />
        Mode: Orbital Hub<br />
        Status: {items.length} Elements Online
      </div>
    </div>
  );
}
