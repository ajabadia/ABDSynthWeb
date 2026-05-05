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
  resolveAsset?: (ref: string | undefined) => string | undefined;
}

interface ViewWrapperProps {
  children: React.ReactNode;
  id: string;
  applyTransform?: boolean;
  zoom: number;
  pan: { x: number; y: number };
}
 
const ViewWrapper = ({ children, id, applyTransform = true, zoom, pan }: ViewWrapperProps) => (
  <motion.div 
    key={id} 
    initial={{ opacity: 0 }} 
    animate={{ 
      opacity: 1, 
      scale: applyTransform ? zoom : 1, 
      x: applyTransform ? pan.x : 0, 
      y: applyTransform ? pan.y : 0 
    }} 
    exit={{ opacity: 0 }} 
    className={`h-full ${applyTransform ? 'origin-center' : ''}`}
  >
    {children}
  </motion.div>
);
 
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
  setActiveTab,
  resolveAsset
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
        {viewMode === 'orbital' && (
          <ViewWrapper id="orbital" zoom={zoom} pan={pan}>
            <NodeCanvas 
              manifest={manifest} 
              contract={contract} 
              selectedItemId={selectedItemId} 
              onSelectItem={onSelectItem} 
              audit={auditResult} 
            />
          </ViewWrapper>
        )}
 
        {viewMode === 'rack' && (
          <ViewWrapper id="rack" zoom={zoom} pan={pan}>
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
              resolveAsset={resolveAsset}
            />
          </ViewWrapper>
        )}
 
        {viewMode === 'source' && (
          <ViewWrapper id="source" applyTransform={false} zoom={zoom} pan={pan}>
            <SourceViewer 
              manifest={manifest} 
              selectedItemId={selectedItemId} 
              onUpdate={updateManifest} 
            />
          </ViewWrapper>
        )}
      </AnimatePresence>
    </section>
  );
}
