'use client';

import React, { useRef } from 'react';
import { OMEGA_Manifest, ManifestEntity, Attachment } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';

// Modular Components & Hooks
import { RackContainer } from '../rack/RackContainer';
import { RackEntity } from '../rack/RackEntity';
import { SignalInjector } from '../rack/SignalInjector';
import { ModulationCables } from '../rack/ModulationCables';
import { RackHUD } from '../rack/RackHUD';
import { useRackSimulation } from '@/hooks/manifest-editor/rack/useRackSimulation';
import { useRackLayout } from '@/hooks/manifest-editor/rack/useRackLayout';
import { CellRenderer } from '@/omega-ui-core/renderers/CellRenderer';
import { UniversalRenderer } from '@/omega-ui-core/renderers/experimental/UniversalRenderer';
import { manifestToTree } from '@/omega-ui-core/uca/ucaBridge';
 
interface VirtualRackProps {
  manifest: OMEGA_Manifest;
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<ManifestEntity>) => void;
  zoom?: number;
  isLiveMode: boolean;
  setIsLiveMode: (val: boolean) => void;
  audit: AuditResult;
  activeTab: string;
  setActiveTab: (val: string) => void;
  resolveAsset?: (ref: string | undefined) => string | undefined;
}
 
/**
 * VirtualRack (v7.2.3) - Aseptic Orchestrator
 * High-fidelity modular instrument viewport.
 */
import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';

export default function VirtualRack({ 
  manifest, 
  selectedItemId, 
  onSelectItem, 
  onUpdateItem, 
  zoom = 1.0, 
  isLiveMode, 
  setIsLiveMode, 
  audit,
  activeTab,
  setActiveTab,
  resolveAsset
}: VirtualRackProps) {
  const rackRef = useRef<HTMLDivElement>(null);
  const skin = manifest.ui?.skin || 'industrial';
  const { allVars } = useDesignTokens(manifest);
  
  // ASEPTIC LAYOUT & SIMULATION
  const { width, height, allElements, visibleElements, containers } = useRackLayout(manifest, activeTab);
  const { runtimeValues, activeContainers, activeInjectorPort, setActiveInjectorPort } = useRackSimulation(allElements, isLiveMode);

  // RACK MASTER ENTITY (Era 7.2.3 Architectural Host)
  const rackEntity: ManifestEntity = {
    id: 'RACK_MASTER',
    type: 'rack',
    pos: { x: 0, y: 0 },
    bind: 'none',
    role: 'infrastructure',
    presentation: {
      component: 'rack',
      variant: 'default',
      style: manifest.ui?.style,
      attachments: (manifest.ui?.attachments || []) as unknown as Attachment[],
      tab: 'MAIN',
      offsetX: 0,
      offsetY: 0
    }
  };

  const rackHTML = CellRenderer.renderCellHTML(rackEntity, {
    skin,
    zoom: 1.0,
    runtimeValue: 0,
    steps: 100,
    manifest,
    resolveAsset
  });

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center gap-8 p-12 relative overflow-hidden" 
      onClick={() => onSelectItem(null)}
      style={allVars as React.CSSProperties}
    >
      <RackHUD 
        isLiveMode={isLiveMode} 
        setIsLiveMode={setIsLiveMode} 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeTab={activeTab as any} 
        setActiveTab={setActiveTab} 
        allElements={allElements} 
        planes={manifest.ui.layout?.planes || ['MAIN']}
      />
 
      {/* RACK FRAME (UNIFIED ENGINE) */}
      <div 
        ref={rackRef} 
        className={`relative transition-all duration-700 ${isLiveMode ? 'shadow-[0_0_120px_rgba(0,0,0,1)]' : ''}`}
        style={{ 
          width: `${width}px`, 
          height: `${height}px`,
          boxShadow: isLiveMode ? '0 0 120px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => { e.stopPropagation(); onSelectItem(null); }}
      >
        {/* The Master Chassis HTML */}
        <div 
          className="absolute inset-0 pointer-events-none"
          dangerouslySetInnerHTML={{ __html: rackHTML }}
        />

        {/* UCA NATIVE ENGINE (Recursive Tree) */}
        {manifest.ui?.useUCA !== false && (
          <div className="absolute inset-0 uca-native-layer">
            <UniversalRenderer 
              node={manifest.ui.tree || manifestToTree(manifest)} 
              manifest={manifest} 
              resolveAsset={resolveAsset}
              debugContext={{
                enabled: manifest.ui.ucaDebug?.enabled || false,
                showLabels: manifest.ui.ucaDebug?.showLabels !== false,
                hideDecorative: manifest.ui.ucaDebug?.hideDecorative || false,
                selectedId: selectedItemId,
                onSelect: onSelectItem
              }}
            />
          </div>
        )}

        {/* LEGACY PIPELINE FALLBACK (Flat Arrays) */}
        {manifest.ui?.useUCA === false && (
          <>
            {/* ARCHITECTURAL PLANES */}
            {containers.filter(c => (c.tab || 'MAIN') === activeTab).map((c) => (
              <RackContainer 
                key={c.id} 
                container={c} 
                isSelected={allElements.some(e => e.id === selectedItemId && e.presentation?.container === c.id)} 
                activeContainers={activeContainers} 
                audit={audit} 
                skin={skin} 
                rackWidthPx={width}
                resolveAsset={resolveAsset}
                manifest={manifest}
              />
            ))}
    
            <ModulationCables manifest={manifest} allElements={allElements} activeTab={activeTab} />
    
            {/* ENTITIES LAYER */}
            {visibleElements.map((item) => (
              <RackEntity 
                key={item.id} item={item} rackRef={rackRef} zoom={zoom} isLiveMode={isLiveMode} 
                selectedItemId={selectedItemId} onSelectItem={onSelectItem} onUpdateItem={onUpdateItem} 
                runtimeValue={runtimeValues[item.id] || 0} steps={item.presentation?.component === 'select' ? 16 : 100} 
                onPortClick={setActiveInjectorPort} audit={audit} skin={skin} 
                resolveAsset={resolveAsset} manifest={manifest}
              />
            ))}
          </>
        )}

        {activeInjectorPort && <SignalInjector portId={activeInjectorPort} onClose={() => setActiveInjectorPort(null)} />}
      </div>
    </div>
  );
}
