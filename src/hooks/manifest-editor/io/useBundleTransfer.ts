'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import yaml from 'js-yaml';
import { OMEGA_Manifest } from '../../../types/manifest';
import { ValidationIssue } from '../../../types/validation';

export const useBundleTransfer = (
  manifest: OMEGA_Manifest,
  wasmBuffer: ArrayBuffer | null,
  extraResources: { name: string, data: ArrayBuffer, type: string }[],
  setExtraResources: Dispatch<SetStateAction<{ name: string, data: ArrayBuffer, type: string }[]>>,
  addLog: (msg: string) => void,
  issues: ValidationIssue[],
  handleWasmUpload: (file: File) => Promise<void>,
  handleContractUpload: (file: File) => Promise<void>,
  handleManifestUpload: (file: File) => Promise<void>
) => {

  const handleResourceUpload = useCallback(async (files: FileList | File) => {
    const fileList = files instanceof FileList ? Array.from(files) : [files];
    
    for (const file of fileList) {
      addLog(`Ingesting Resource: ${file.name}...`);
      try {
        const buffer = await file.arrayBuffer();
        setExtraResources(prev => [
          ...prev.filter(r => r.name !== file.name),
          { name: file.name, data: buffer, type: file.type }
        ]);
        addLog(`[OK] Resource '${file.name}' stored in workspace.`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        addLog(`[CRITICAL] Resource Ingestion Failed: ${message}`);
      }
    }
  }, [addLog, setExtraResources]);

  const exportOmegaPack = useCallback(async () => {
    try {
      addLog(`[SYSTEM] Preparing OmegaPack (.zip)...`);
      
      if (!(window as unknown as { JSZip: unknown }).JSZip) {
        addLog(`[SYSTEM] Loading JSZip dependency...`);
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      interface JSZipInstance {
        file: (name: string, data: string | ArrayBuffer | Uint8Array | Blob) => JSZipInstance;
        folder: (name: string) => JSZipInstance;
        generateAsync: (options: { type: 'blob' }) => Promise<Blob>;
      }
      const JSZip = (window as unknown as { JSZip: new () => JSZipInstance }).JSZip;
      const zip = new JSZip();
      
      const yamlContent = yaml.dump(manifest, { indent: 2, lineWidth: -1 });
      zip.file(`${manifest.id}.acemm`, yamlContent);
      
      if (issues.length === 0 || confirm("Audit report will be included. Proceed?")) {
        const contractContent = JSON.stringify(manifest, null, 2);
        zip.file(`${manifest.id}.contract.json`, contractContent);
      }

      const auditReport = `# OMEGA Audit Report\n\nModule ID: ${manifest.id}\nStatus: ${issues.length === 0 ? 'CERTIFIED' : 'DEGRADED'}\nIssues: ${issues.length}\nTimestamp: ${new Date().toISOString()}\n`;
      zip.file(`AUDIT_REPORT.md`, auditReport);

      if (wasmBuffer) {
        zip.file(`${manifest.id}.wasm`, wasmBuffer);
        addLog(`[SYSTEM] WASM Binary included in pack.`);
      }

      if (extraResources.length > 0) {
        const resFolder = zip.folder("resources");
        for (const res of extraResources) {
          resFolder.file(res.name, res.data);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${manifest.id}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      
      addLog(`[SUCCESS] OmegaPack exported: ${manifest.id}.zip`);
    } catch (err) {
      addLog(`[ERROR] Failed to generate OmegaPack: ${err}`);
    }
  }, [manifest, issues, wasmBuffer, extraResources, addLog]);

  const handleBulkUpload = useCallback(async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    
    addLog(`[SYSTEM] Batch Ingestion: Processing ${fileList.length} entities...`);

    const manifests = fileList.filter(f => f.name.endsWith('.acemm'));
    const wasms = fileList.filter(f => f.name.endsWith('.wasm'));
    const contracts = fileList.filter(f => f.name.endsWith('.json') && !f.name.endsWith('.acemm'));
    const others = fileList.filter(f => !f.name.endsWith('.acemm') && !f.name.endsWith('.wasm') && !f.name.endsWith('.json'));

    try {
      if (contracts.length > 0) {
        addLog(`[TRACE] Ingesting contract: ${contracts[0].name}`);
        await handleContractUpload(contracts[0]);
      }
      if (wasms.length > 0) {
        addLog(`[TRACE] Ingesting binary: ${wasms[0].name}`);
        await handleWasmUpload(wasms[0]);
      }
      if (manifests.length > 0) {
        addLog(`[TRACE] Ingesting manifest: ${manifests[0].name}`);
        await handleManifestUpload(manifests[0]);
      }

      for (const res of others) {
        addLog(`[TRACE] Ingesting resource: ${res.name}`);
        await handleResourceUpload(res);
      }

      addLog(`[SUCCESS] Industrial Batch Ingestion finalized.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] Batch Ingestion Aborted: ${message}`);
    }
  }, [handleContractUpload, handleWasmUpload, handleManifestUpload, handleResourceUpload, addLog]);

  const handleRemoveResource = useCallback((name: string) => {
    setExtraResources(prev => prev.filter(r => r.name !== name));
    addLog(`[SYSTEM] Resource removed: ${name}`);
  }, [setExtraResources, addLog]);

  return {
    exportOmegaPack,
    handleBulkUpload,
    handleResourceUpload,
    handleRemoveResource
  };
};
