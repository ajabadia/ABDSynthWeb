'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { OMEGA_Manifest, ManifestEntity } from '@/omega-ui-core/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';
import { ValidationService } from '@/services/validationService';

export const useAuditEngine = (manifest: OMEGA_Manifest, contract: OmegaContract | null) => {
  const [logs, setLogs] = useState<string[]>([]);

  // Industrial Logging Engine (Aseptic Sync)
  const addLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-49), `[${timestamp}] ${msg}`]);
  }, []);

  const isInitialized = useRef(false);
 
  // Initial Boot Sequence (Client-only to avoid hydration mismatch)
  useEffect(() => {
    if (!isInitialized.current) {
      addLog('OMEGA ERA 7 ENGINEERING CONSOLE READY');
      addLog('Aseptic Protocol V7.1 Active');
      isInitialized.current = true;
    }
  }, [addLog]);

  const issues = useMemo(() => {
    const baseIssues = ValidationService.validate(manifest);
    
    if (contract) {
      if (manifest.id !== contract.id) {
        baseIssues.push({
          path: '/id',
          message: 'Manifest ID does not match contract ID',
          keyword: 'integrity',
          severity: 'error'
        });
      }

      const contractParamIds = (contract.parameters?.map(p => p.id?.toLowerCase()) || []);
      const contractPortIds = (contract.ports?.map(p => p.id?.toLowerCase()) || []);

      manifest.ui?.controls?.forEach((ctrl: ManifestEntity, i: number) => {
        const bindId = ctrl.bind?.toLowerCase();
        if (bindId && !contractParamIds.includes(bindId)) {
          baseIssues.push({
            path: `/ui/controls/${i}/bind`,
            message: `Binding error: '${ctrl.bind}' not found in contract.`,
            keyword: 'binding',
            severity: 'error'
          });
        }
      });

      manifest.ui?.jacks?.forEach((jack: ManifestEntity, i: number) => {
        const bindId = jack.bind?.toLowerCase();
        if (bindId && !contractPortIds.includes(bindId)) {
          baseIssues.push({
            path: `/ui/jacks/${i}/bind`,
            message: `Jack '${jack.id}' is bound to non-existent stream/port '${jack.bind}'`,
            keyword: 'binding',
            severity: 'error'
          });
        }
      });
    }

    return baseIssues;
  }, [manifest, contract]);

  return {
    logs,
    addLog,
    issues
  };
};
