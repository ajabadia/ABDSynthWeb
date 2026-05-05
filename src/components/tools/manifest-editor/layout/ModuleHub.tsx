'use client';

import React from 'react';
import LogicAssetsSection from '../hub/LogicAssetsSection';
import IndustrialStatusSection from '../hub/IndustrialStatusSection';
import { useModuleMetrics } from '@/hooks/manifest-editor/useModuleMetrics';

import { OMEGA_Manifest } from '@/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';

interface ModuleHubProps {
  manifest: OMEGA_Manifest;
  contract: OmegaContract | null;
  triggerUpload: (id: string) => void;
  onDeploy: () => void;
}

export default function ModuleHub({ manifest, contract, triggerUpload, onDeploy }: ModuleHubProps) {
  const { metrics, sysReady } = useModuleMetrics(manifest);

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar pr-2">
      <LogicAssetsSection 
        manifest={manifest} 
        contract={contract} 
        triggerUpload={triggerUpload} 
      />

      <IndustrialStatusSection 
        metrics={metrics} 
        sysReady={sysReady} 
        onDeploy={onDeploy} 
      />
    </div>
  );
}
