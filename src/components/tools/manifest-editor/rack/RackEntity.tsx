import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Move, AlertCircle } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';
import { CellRenderer } from '@/omega-ui-core/renderers/CellRenderer';

interface RackEntityProps {
  item: ManifestEntity & { isJack?: boolean };
  rackRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  isLiveMode: boolean;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  runtimeValue: number;
  steps: number;
  onPortClick: (id: string) => void;
  audit: AuditResult;
  skin: string;
  resolveAsset?: (ref: string | undefined) => string | undefined;
  manifest: OMEGA_Manifest;
}

/**
 * RackEntity (v7.2.3)
 * Represents an individual draggable control or jack within the rack.
 * Memoized for high-performance industrial rendering (60 FPS).
 */
const RackEntityBase = ({ 
  item, 
  rackRef, 
  zoom, 
  isLiveMode, 
  selectedItemId, 
  onSelectItem, 
  onUpdateItem, 
  runtimeValue, 
  steps, 
  onPortClick, 
  audit,
  skin,
  resolveAsset,
  manifest
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

  const itemIssues = React.useMemo(() => 
    audit.issues.filter(issue => issue.path.includes(item.id) || issue.message.includes(`'${item.id}'`)),
    [audit.issues, item.id]
  );
  
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
        width: 0, 
        height: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        translateX: "-50%",
        translateY: "-50%",
        zIndex: isSelected ? 50 : 20, 
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

        {/* UNIFIED STATELESS RENDERER (ERA 7.2.3 — SOT) */}
        <div 
          dangerouslySetInnerHTML={{ 
            __html: CellRenderer.renderCellHTML(item, {
              skin,
              zoom,
              runtimeValue,
              steps,
              isSelected,
              isLiveMode,
              resolveAsset,
              manifest
            }) 
          }}
        />

        {/* SELECTION UI OVERLAY */}
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
    JSON.stringify(prev.item.pos) === JSON.stringify(next.item.pos) &&
    prev.item.label === next.item.label &&
    prev.runtimeValue === next.runtimeValue &&
    prev.selectedItemId === next.selectedItemId &&
    prev.isLiveMode === next.isLiveMode &&
    prev.skin === next.skin &&
    prev.zoom === next.zoom &&
    prev.audit.issues.length === next.audit.issues.length &&
    JSON.stringify(prev.manifest.resources?.assets) === JSON.stringify(next.manifest.resources?.assets) &&
    prev.item.presentation?.asset === next.item.presentation?.asset
  );
});
