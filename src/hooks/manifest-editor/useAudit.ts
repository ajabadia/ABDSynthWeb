import { useState, useMemo, useEffect } from 'react';
import { OMEGA_Manifest } from '../../types/manifest';
import { AuditService } from '../../services/auditService';

/**
 * useAudit (v7.2.3)
 * Manages real-time manifest auditing and cryptographic fingerprinting.
 */
export const useAudit = (manifest: OMEGA_Manifest, contract: any) => {
  const [fingerprint, setFingerprint] = useState<string>('');

  const auditResult = useMemo(() => {
    const res = AuditService.performFullAudit(manifest, contract);
    return { 
      ...res, 
      fingerprint, 
      isHashMatched: fingerprint === contract?.firmwareHash 
    };
  }, [manifest, fingerprint, contract]);

  useEffect(() => {
    const updateHash = async () => {
      const { IntegrityService } = await import('../../services/integrityService');
      const hash = await IntegrityService.generateManifestHash(manifest);
      setFingerprint(hash);
    };
    updateHash();
  }, [manifest]);

  return {
    auditResult,
    fingerprint
  };
};
