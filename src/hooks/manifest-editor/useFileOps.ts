'use client';

import { useCallback } from 'react';
import yaml from 'js-yaml';
import { OMEGA_Manifest, ManifestEntity } from '../../types/manifest';
import { WasmLoaderService, OmegaContract } from '../../services/wasmLoader';
import { wasmRuntime } from '../../services/wasmRuntime';

export const useFileOps = (
  manifest: OMEGA_Manifest,
  setManifest: React.Dispatch<React.SetStateAction<OMEGA_Manifest>>,
  setContract: React.Dispatch<React.SetStateAction<OmegaContract | null>>,
  setWasmBuffer: React.Dispatch<React.SetStateAction<ArrayBuffer | null>>,
  wasmBuffer: ArrayBuffer | null,
  setExtraResources: React.Dispatch<React.SetStateAction<{ name: string, data: ArrayBuffer, type: string }[]>>,
  extraResources: { name: string, data: ArrayBuffer, type: string }[],
  addLog: (msg: string) => void,
  issues: any[]
) => {

  const syncManifestWithContract = useCallback((newContract: OmegaContract, filename: string) => {
    setManifest((prev: OMEGA_Manifest) => ({
      ...prev,
      id: newContract.id || prev.id,
      metadata: {
        ...(prev.metadata || {}),
        name: (prev.metadata?.name === 'New Module' || !prev.metadata?.name) ? (newContract.name || newContract.id) : prev.metadata.name,
        family: newContract.family || prev.metadata?.family || 'oscillator'
      },
      resources: {
        ...(prev.resources || {}),
        wasm: filename,
        contract: filename.replace('.wasm', '.contract.json')
      }
    }));
  }, [setManifest]);

  const handleWasmUpload = useCallback(async (file: File) => {
    addLog(`Loading WASM Binary: ${file.name}...`);
    try {
      const buffer = await file.arrayBuffer();
      setWasmBuffer(buffer);
      const extractedContract = await WasmLoaderService.extractContract(file);
      setContract(extractedContract);
      addLog(`[OK] Contract extracted from binary.`);

      const success = await wasmRuntime.loadWasm(buffer);
      if (success) {
        addLog(`[OK] Simulation engine synchronized with binary logic.`);
      }

      syncManifestWithContract(extractedContract, file.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] WASM Load Failed: ${message}`);
    }
  }, [addLog, setContract, setWasmBuffer, syncManifestWithContract]);

  const handleContractUpload = useCallback(async (file: File) => {
    addLog(`Ingesting Technical Contract: ${file.name}...`);
    try {
      const content = await file.text();
      const rawData = JSON.parse(content);
      const data = rawData.contract || rawData;
      
      if (!data.id || !data.ports) {
        throw new Error("Missing mandatory 'id' or 'ports' fields in contract.");
      }

      const loadedContract: OmegaContract = {
        omega_version: data.omega_version || data.version || "7.0",
        id: String(data.id),
        name: data.name || data.id,
        family: (data.family || "utility").toLowerCase(),
        parameters: data.parameters || [],
        ports: data.ports || []
      };
      
      loadedContract.parameters = (loadedContract.parameters || []).map((p: any) => ({ ...p, id: String(p.id || p.name).toLowerCase() }));
      loadedContract.ports = (loadedContract.ports || []).map((p: any) => ({ ...p, id: String(p.id || p.name).toLowerCase() }));
      
      setContract(loadedContract);
      addLog(`[AUDIT] Contract '${loadedContract.id}' validated.`);
      syncManifestWithContract(loadedContract, 'module.wasm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] Contract Load Failed: ${message}`);
    }
  }, [addLog, setContract, syncManifestWithContract]);

  const handleManifestUpload = useCallback(async (file: File) => {
    addLog(`Ingesting Manifest: ${file.name}...`);
    try {
      const content = await file.text();
      const parsed = yaml.load(content) as any;
      
      if (!parsed || typeof parsed !== 'object') throw new Error("Invalid manifest format.");

      if (!parsed.ui) parsed.ui = { dimensions: { width: 120, height: 420 }, controls: [], jacks: [] };
      if (!parsed.metadata) parsed.metadata = { name: parsed.name || "Unnamed Module", family: "utility" };
      
      const getNum = (v: any) => {
        const n = parseFloat(String(v));
        return isNaN(n) ? 0 : n;
      };

      const normalize = (list: any[], defaultTab: string): ManifestEntity[] => (list || []).map((c: any, idx: number) => {
        const rawPos = c.pos || {};
        const x = getNum(rawPos.x);
        const y = getNum(rawPos.y);
        const defaultRole = defaultTab === 'PATCHING' ? 'stream' : 'control';

        return {
          id: String(c.id || `entity_${defaultTab}_${idx}`),
          type: String(c.type || (defaultTab === 'PATCHING' ? 'port' : 'knob')).toLowerCase(),
          role: String(c.role || defaultRole),
          bind: String(c.bind || ''),
          label: c.label,
          pos: { x, y },
          presentation: {
            tab: String(c.presentation?.tab || (defaultTab === 'PATCHING' ? 'MAIN' : defaultTab)),
            variant: String(c.presentation?.variant || 'B_cyan'),
            component: String(c.presentation?.component || c.type || (defaultTab === 'PATCHING' ? 'port' : 'knob')).toLowerCase(),
            offsetX: getNum(c.presentation?.offsetX),
            offsetY: getNum(c.presentation?.offsetY),
            group: c.presentation?.group,
            attachments: (c.presentation?.attachments || []).map((att: any) => ({
              type: String(att.type || 'label'),
              position: String(att.position || 'bottom') as any,
              offsetX: getNum(att.offsetX),
              offsetY: getNum(att.offsetY),
              variant: String(att.variant || 'B_cyan'),
              text: att.text
            })),
            precision: getNum(c.presentation?.precision) || 6,
            ui_precision: getNum(c.presentation?.ui_precision) || 2,
          }
        };
      });

      const finalManifest: OMEGA_Manifest = {
        schemaVersion: String(parsed.schemaVersion || '7.1'),
        id: String(parsed.id || 'unknown_module'),
        metadata: {
          name: String(parsed.metadata?.name || parsed.name),
          family: String(parsed.metadata?.family || 'utility').toLowerCase(),
          author: parsed.metadata?.author,
          tags: parsed.metadata?.tags || [],
          rack: parsed.metadata?.rack
        },
        ui: {
          dimensions: { 
            width: getNum(parsed.ui.dimensions?.width) || 120, 
            height: getNum(parsed.ui.dimensions?.height) || 420 
          },
          controls: normalize(parsed.ui.controls, 'MAIN'),
          jacks: normalize(parsed.ui.jacks, 'MAIN')
        },
        resources: {
          wasm: String(parsed.resources?.wasm || 'module.wasm'),
          contract: parsed.resources?.contract
        },
        modulations: parsed.modulations || []
      };

      setManifest(finalManifest);
      addLog(`Success: UI state reconstructed for '${finalManifest.metadata.name}'.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] Ingestion Failure: ${message}`);
    }
  }, [addLog, setManifest]);
  
  const exportManifest = useCallback(() => {
    if (issues.length > 0) {
      if (!confirm(`Manifest has ${issues.length} issues. Export anyway?`)) return;
    }

    const yamlContent = yaml.dump(manifest, { indent: 2, lineWidth: -1 });
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manifest.id}.acemm`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`[OK] Exported manifest: ${manifest.id}.acemm`);
  }, [manifest, issues, addLog]);

  const handleResourceUpload = useCallback(async (file: File) => {
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
  }, [addLog, setExtraResources]);

  const exportOmegaPack = useCallback(async () => {
    try {
      addLog(`[SYSTEM] Preparing OmegaPack (.zip)...`);
      
      // Load JSZip from CDN dynamically
      if (!(window as any).JSZip) {
        addLog(`[SYSTEM] Loading JSZip dependency...`);
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const JSZip = (window as any).JSZip;
      const zip = new JSZip();
      
      // 1. Manifest
      const yamlContent = yaml.dump(manifest, { indent: 2, lineWidth: -1 });
      zip.file(`${manifest.id}.acemm`, yamlContent);
      
      // 2. Contract
      if (issues.length === 0 || confirm("Audit report will be included. Proceed?")) {
        const contractContent = JSON.stringify(manifest, null, 2); // Simplified contract for now
        zip.file(`${manifest.id}.contract.json`, contractContent);
      }

      // 3. Audit Report (Certified marker)
      const auditReport = `# OMEGA Audit Report\n\nModule ID: ${manifest.id}\nStatus: ${issues.length === 0 ? 'CERTIFIED' : 'DEGRADED'}\nIssues: ${issues.length}\nTimestamp: ${new Date().toISOString()}\n`;
      zip.file(`AUDIT_REPORT.md`, auditReport);

      // 4. WASM Binary (If available in state)
      if (wasmBuffer) {
        zip.file(`${manifest.id}.wasm`, wasmBuffer);
        addLog(`[SYSTEM] WASM Binary included in pack.`);
      } else {
        addLog(`[WARNING] No WASM Binary found. Exporting manifest-only pack.`);
      }

      // 5. Extra Resources (Skins, Images, etc.)
      if (extraResources.length > 0) {
        const resFolder = zip.folder("resources");
        for (const res of extraResources) {
          resFolder.file(res.name, res.data);
        }
        addLog(`[SYSTEM] ${extraResources.length} extra resources included in pack.`);
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
    
    addLog(`[SYSTEM] Batch Ingestion: Processing ${fileList.length} files...`);

    // 1. Classify files
    const manifests = fileList.filter(f => f.name.endsWith('.acemm'));
    const wasms = fileList.filter(f => f.name.endsWith('.wasm'));
    const contracts = fileList.filter(f => f.name.endsWith('.json') && !f.name.endsWith('.acemm'));
    const others = fileList.filter(f => !f.name.endsWith('.acemm') && !f.name.endsWith('.wasm') && !f.name.endsWith('.json'));

    // 2. Sequential ingestion (Priority: Contract > WASM > Manifest)
    if (contracts.length > 0) {
      await handleContractUpload(contracts[0]);
      if (contracts.length > 1) addLog(`[WARNING] Multiple contracts detected. Using: ${contracts[0].name}`);
    }

    if (wasms.length > 0) {
      await handleWasmUpload(wasms[0]);
      if (wasms.length > 1) addLog(`[WARNING] Multiple binaries detected. Using: ${wasms[0].name}`);
    }

    if (manifests.length > 0) {
      await handleManifestUpload(manifests[0]);
      if (manifests.length > 1) addLog(`[WARNING] Multiple manifests detected. Using: ${manifests[0].name}`);
    }

    // 3. Resources
    for (const res of others) {
      await handleResourceUpload(res);
    }

    addLog(`[SYSTEM] Batch Ingestion Complete.`);
  }, [handleContractUpload, handleWasmUpload, handleManifestUpload, handleResourceUpload, addLog]);

  return {
    handleWasmUpload,
    handleContractUpload,
    handleManifestUpload,
    handleResourceUpload,
    handleBulkUpload,
    exportManifest,
    exportOmegaPack
  };
};
