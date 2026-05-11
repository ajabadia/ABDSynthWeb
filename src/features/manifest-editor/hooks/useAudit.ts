import { useState, useMemo, useEffect, useRef } from 'react';
import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { AuditService } from '@/services/auditService';
import { OmegaContract } from '@/services/wasmLoader';

/**
 * useAudit (v7.2.3)
 * Manages real-time manifest auditing and cryptographic fingerprinting.
 */
export const useAudit = (manifest: OMEGA_Manifest, contract: OmegaContract | null) => {
  const [fingerprint, setFingerprint] = useState<string>('');

  const auditResult = useMemo(() => {
    const res = AuditService.performFullAudit(manifest, contract);
    return { 
      ...res, 
      fingerprint, 
      isHashMatched: fingerprint === contract?.firmwareHash 
    };
  }, [manifest, fingerprint, contract]);

  const lastHashRef = useRef<string>('');

  useEffect(() => {
    const updateHash = async () => {
      const { IntegrityService } = await import('@/services/integrityService');
      const hash = await IntegrityService.generateManifestHash(manifest);
      if (hash !== lastHashRef.current) {
        lastHashRef.current = hash;
        setFingerprint(hash);
      }
    };
    updateHash();
  }, [manifest]);

  return {
    auditResult,
    fingerprint
  };
};
