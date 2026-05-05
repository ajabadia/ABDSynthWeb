import { motion, AnimatePresence } from 'framer-motion';
import NodeCanvas from './NodeCanvas';
import VirtualRack from './VirtualRack';
import SourceViewer from './SourceViewer';
import ViewportControls from './ViewportControls';
import { OMEGA_Manifest, ManifestEntity, LayoutContainer } from '@/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';
import { AuditResult } from '@/services/auditService';

interface WorkbenchViewportProps {
  viewMode: 'orbital' | 'rack' | 'source';
  manifest: OMEGA_Manifest;
  contract: OmegaContract | null;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  updateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  updateManifest: (updates: Partial<OMEGA_Manifest>) => void;
  updateContainer: (id: string, updates: Partial<LayoutContainer>) => void;
  auditResult: AuditResult;
  zoom: number;
  pan: { x: number; y: number };
  handleZoom: (delta: number) => void;
  handlePan: (dx: number, dy: number) => void;
  handleResetViewport: () => void;
  handleFitViewport: (mode: string) => void;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function WorkbenchViewport({
  viewMode,
  manifest,
  contract,
  selectedItemId,
  onSelectItem,
  updateItem,
  updateManifest,
  auditResult,
  zoom,
  pan,
  handleZoom,
  handlePan,
  handleResetViewport,
  handleFitViewport,
  isLiveMode,
  setIsLiveMode,
  activeTab,
  setActiveTab
}: WorkbenchViewportProps) {
  return (
    <section className="flex-1 relative wb-bg overflow-hidden transition-colors duration-500">
      {viewMode !== 'source' && (
        <ViewportControls 
          zoom={zoom} 
          onZoom={handleZoom} 
          onPan={handlePan} 
          onReset={handleResetViewport} 
          onFit={() => handleFitViewport(viewMode)} 
        />
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'orbital' ? (
          <motion.div 
            key="orbital" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, scale: zoom, x: pan.x, y: pan.y }} 
            exit={{ opacity: 0 }} 
            className="h-full origin-center"
          >
            <NodeCanvas 
              manifest={manifest} 
              contract={contract} 
              selectedItemId={selectedItemId} 
              onSelectItem={onSelectItem} 
              audit={auditResult} 
            />
          </motion.div>
        ) : viewMode === 'rack' ? (
          <motion.div 
            key="rack" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, scale: zoom, x: pan.x, y: pan.y }} 
            exit={{ opacity: 0 }} 
            className="h-full origin-center"
          >
            <VirtualRack 
              manifest={manifest} 
              onSelectItem={onSelectItem} 
              selectedItemId={selectedItemId} 
              onUpdateItem={updateItem} 
              zoom={zoom} 
              isLiveMode={isLiveMode} 
              setIsLiveMode={setIsLiveMode} 
              audit={auditResult} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
          </motion.div>
        ) : (
          <motion.div 
            key="source" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="h-full"
          >
            <SourceViewer 
              manifest={manifest} 
              selectedItemId={selectedItemId} 
              onUpdate={updateManifest} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
