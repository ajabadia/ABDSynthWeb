import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Move, AlertCircle } from 'lucide-react';
import PrimitiveFactory from '../primitives/PrimitiveFactory';
import SignalScope from '../primitives/SignalScope';
import { OMEGA_Manifest, ManifestEntity } from '../../../../types/manifest';
import { AuditResult } from '@/services/auditService';

interface RackEntityProps {
  item: ManifestEntity & { isJack?: boolean };
  contract: any;
  rackRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  isLiveMode: boolean;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: any) => void;
  runtimeValue: number;
  steps: number;
  onUpdateValue: (id: string, val: number) => void;
  onPortClick: (id: string) => void;
  audit: AuditResult;
  skin: string;
}

/**
 * RackEntity (v7.2.3)
 * Represents an individual draggable control or jack within the rack.
 * Memoized for high-performance industrial rendering (60 FPS).
 */
const RackEntityBase = ({ 
  item, 
  contract, 
  rackRef, 
  zoom, 
  isLiveMode, 
  selectedItemId, 
  onSelectItem, 
  onUpdateItem, 
  runtimeValue, 
  steps, 
  onUpdateValue, 
  onPortClick, 
  audit,
  skin
}: RackEntityProps) => {
  const dragControls = useDragControls();
  const isSelected = selectedItemId === item.id && !isLiveMode;
  const isJack = item.isJack || item.presentation?.component === 'port' || item.type === 'port';

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLiveMode && isJack) {
      onPortClick(item.id);
    } else {
      onSelectItem(item.id);
    }
  };

  // ORPHAN DETECTION (ERA 4 GOVERNANCE)
  const hasRole = !!item.role;
  const isBound = !!item.bind;
  
  const contractIds = contract ? [
    ...(contract.parameters?.map((p: any) => p.id) || []),
    ...(contract.ports?.map((p: any) => p.id) || [])
  ] : [];

  const itemIssues = React.useMemo(() => 
    audit.issues.filter(issue => issue.path.includes(item.id) || issue.message.includes(`'${item.id}'`)),
    [audit.issues, item.id]
  );
  
  const hasIntegrityError = itemIssues.some(i => i.keyword === 'era7_integrity');
  const isOrphan = itemIssues.length > 0 || !hasRole;

  return (
    <motion.div
      drag={!isLiveMode} 
      dragControls={dragControls} 
      dragMomentum={false} 
      dragConstraints={rackRef} 
      dragElastic={0}
      onDragEnd={(_, info) => { 
        if (rackRef.current) { 
          const rect = rackRef.current.getBoundingClientRect(); 
          onUpdateItem(item.id, { 
            pos: { 
              x: Math.round((info.point.x - rect.left) / (1.5 * zoom)), 
              y: Math.round((info.point.y - rect.top) / (1.5 * zoom)) 
            } 
          }); 
        } 
      }}
      animate={{ x: (item.pos?.x || 0) * 1.5, y: (item.pos?.y || 0) * 1.5 }}
      transition={{ type: 'tween', duration: 0 }}
      style={{ 
        position: 'absolute', 
        left: 0, 
        top: 0, 
        width: 64, 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginLeft: -32, 
        marginTop: -32, 
        zIndex: isSelected ? 50 : 10, 
        cursor: isLiveMode ? 'pointer' : 'grab' 
      }}
      onClick={handleClick}
    >
      <div className="relative w-full h-full flex items-center justify-center group">
        {/* ORPHAN WARNING AURA */}
        {isOrphan && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -inset-2 bg-red-500/20 rounded-full blur-xl pointer-events-none"
            />
            <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]">
               <div className="bg-red-600 text-white px-3 py-1.5 rounded-xs shadow-2xl border border-red-400/40 flex flex-col gap-1 min-w-[140px]">
                  <div className="flex items-center gap-2 border-b border-white/20 pb-1">
                     <AlertCircle className="w-3 h-3" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Orphan Detected</span>
                  </div>
                  <span className="text-[7px] font-bold uppercase leading-tight whitespace-pre-line">
                    {itemIssues.map(i => `• ${i.message}`).join('\n')}
                    {!hasRole && '• Missing Registry Role'}
                  </span>
               </div>
               <div className="w-2 h-2 bg-red-600 rotate-45 mx-auto -mt-1 border-r border-b border-red-400/40" />
            </div>
          </>
        )}

        {/* ATTACHMENTS LAYER */}
        <div className="absolute inset-0 pointer-events-auto">
          {(item.presentation?.attachments || []).map((att: any, idx: number) => {
            const posClasses: any = { top: 'bottom-full left-1/2 -translate-x-1/2 mb-1', bottom: 'top-full left-1/2 -translate-x-1/2 mt-1', left: 'right-full top-1/2 -translate-y-1/2 mr-2', right: 'left-full top-1/2 -translate-y-1/2 ml-2' };
            return (
              <div key={idx} className={`absolute ${posClasses[att.position] || ''}`} style={{ transform: `translate(${(att.offsetX || 0) * 1.5}px, ${(att.offsetY || 0) * 1.5}px)` }}>
                <PrimitiveFactory 
                  type={att.type} value={runtimeValue} steps={steps} variant={att.variant || 'B_cyan'} skin={skin} item={att} 
                  onValueChange={() => {}} 
                  text={att.text} role={att.role}
                />
              </div>
            );
          })}
        </div>

        {/* CORE COMPONENT LAYER */}
        <div className="pointer-events-auto" style={{ transform: `translate(${(item.presentation?.offsetX || 0) * 1.5}px, ${(item.presentation?.offsetY || 0) * 1.5}px)` }}>
          <PrimitiveFactory 
            type={item.presentation?.component || (isJack ? 'port' : 'knob')} 
            value={runtimeValue} steps={steps} variant={item.presentation?.variant || 'B_cyan'} skin={skin} isMain={true} isSelected={isSelected} item={item}
            onValueChange={(val) => onUpdateValue(item.id, val)}
            text={item.label} role={item.role}
          />
          {isLiveMode && isJack && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2">
              <SignalScope value={runtimeValue} color={item.role === 'stream' ? '#00ccff' : '#00ff9d'} />
            </div>
          )}
        </div>

        {/* SELECTION UI */}
        {isSelected && !isLiveMode && (
          <>
            <div className="absolute -inset-4 border border-primary/20 border-dashed rounded-lg animate-pulse pointer-events-none" />
            <div 
              onPointerDown={(e) => {
                e.stopPropagation();
                dragControls.start(e);
              }}
              className="absolute -top-6 -right-6 p-2 bg-primary/20 border border-primary/40 rounded-xs text-primary hover:bg-primary hover:text-black transition-all cursor-grab active:cursor-grabbing z-[60] shadow-lg backdrop-blur-sm"
            >
              <Move className="w-3.5 h-3.5" />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export const RackEntity = React.memo(RackEntityBase, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.pos.x === next.item.pos.x &&
    prev.item.pos.y === next.item.pos.y &&
    prev.item.label === next.item.label &&
    prev.runtimeValue === next.runtimeValue &&
    prev.selectedItemId === next.selectedItemId &&
    prev.isLiveMode === next.isLiveMode &&
    prev.skin === next.skin &&
    prev.zoom === next.zoom &&
    prev.audit.issues.length === next.audit.issues.length
  );
});
