import { useState, useCallback, useMemo } from 'react';
import { WasmLoaderService, OmegaContract } from '../services/wasmLoader';
import { ValidationService, ValidationIssue } from '../services/validationService';
import yaml from 'js-yaml';

export const useManifestEditor = () => {
  const [manifest, setManifest] = useState<any>({
    schemaVersion: '7.0',
    id: 'new_module',
    metadata: {
      name: 'New Module',
      family: 'oscillator',
      tags: ['era7']
    },
    ui: {
      dimensions: { width: 120, height: 420 },
      controls: [],
      jacks: []
    },
    resources: {
      wasm: 'module.wasm'
    }
  });

  const [contract, setContract] = useState<OmegaContract | null>(null);
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] OMEGA ERA 7 ENGINEERING CONSOLE READY`,
    `[${new Date().toLocaleTimeString()}] Aseptic Protocol V7.1 Active`
  ]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  // Validation Logic
  const issues = useMemo(() => {
    const baseIssues = ValidationService.validate(manifest);
    
    // Era 7 Binding Validation
    if (contract && (manifest.schemaVersion === '7.0' || manifest.schemaVersion === undefined)) {
      const contractParamIds = (contract.parameters?.map(p => p.id?.toLowerCase()) || []);
      const contractPortIds = (contract.ports?.map(p => p.id?.toLowerCase()) || []);

      manifest.ui?.controls?.forEach((ctrl: any, i: number) => {
        const bindId = ctrl.bind?.toLowerCase();
        if (bindId && !contractParamIds.includes(bindId)) {
          baseIssues.push({
            path: `/ui/controls/${i}/bind`,
            message: `Binding error: '${ctrl.bind}' not found in contract.`,
            keyword: 'binding'
          });
        }
      });

      manifest.ui?.jacks?.forEach((jack: any, i: number) => {
        const bindId = jack.bind?.toLowerCase();
        if (bindId && !contractPortIds.includes(bindId)) {
          baseIssues.push({
            path: `/ui/jacks/${i}/bind`,
            message: `Binding error: '${jack.bind}' not found in contract.`,
            keyword: 'binding'
          });
        }
      });
    }

    return baseIssues;
  }, [manifest, contract]);

  const handleWasmUpload = async (file: File) => {
    addLog(`Loading WASM: ${file.name}...`);
    try {
      const extractedContract = await WasmLoaderService.extractContract(file);
      setContract(extractedContract);
      addLog(`Success: Contract extracted from binary.`);
      syncManifestWithContract(extractedContract, file.name);
    } catch (err: any) {
      addLog(`Error: ${err.message}`);
    }
  };

  const handleContractUpload = async (file: File) => {
    addLog(`Ingesting Technical Contract: ${file.name}...`);
    try {
      const content = await file.text();
      let rawData = JSON.parse(content);
      let data = rawData.contract || rawData;
      
      if (!data.id || !data.ports) {
        throw new Error("Missing mandatory 'id' or 'ports' fields in contract.");
      }

      const loadedContract: OmegaContract = {
        omega_version: data.omega_version || data.version || "7.0",
        id: data.id,
        name: data.name || data.id,
        family: (data.family || "utility").toLowerCase(),
        parameters: data.parameters || [],
        ports: data.ports || []
      };
      
      // Normalization and Audit
      loadedContract.parameters = loadedContract.parameters.map((p: any) => ({ ...p, id: (p.id || p.name)?.toLowerCase() }));
      loadedContract.ports = loadedContract.ports.map((p: any) => ({ ...p, id: (p.id || p.name)?.toLowerCase() }));
      
      setContract(loadedContract);
      
      // Technical Audit Logs
      addLog(`[AUDIT] Contract '${loadedContract.id}' validated.`);
      if (loadedContract.parameters.length === 0) {
        addLog(`[AUDIT] Note: This module has 0 interactive parameters (Knobs/Sliders).`);
      }
      addLog(`[AUDIT] Logic Ports: ${loadedContract.ports.length} (Inputs/Outputs detected).`);
      
      syncManifestWithContract(loadedContract, 'module.wasm');
    } catch (err: any) {
      addLog(`[CRITICAL] Contract Load Failed: ${err.message}`);
      console.error("Contract Audit Failure:", err);
    }
  };

  const syncManifestWithContract = (newContract: OmegaContract, filename: string) => {
    setManifest((prev: any) => ({
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
  };

  const handleManifestUpload = async (file: File) => {
    addLog(`Ingesting Manifest: ${file.name}...`);
    try {
      const content = await file.text();
      let parsed = yaml.load(content) as any;
      
      if (!parsed || typeof parsed !== 'object') throw new Error("Invalid manifest format.");

      addLog(`[UI-AUDIT] Structure detected. Metadata: ${!!parsed.metadata}, UI: ${!!parsed.ui}`);

      // RESCUE LOGIC: If controls/jacks are at root, move them to UI
      if (!parsed.ui) parsed.ui = { dimensions: { width: 120, height: 420 }, controls: [], jacks: [] };
      if (parsed.controls && (!parsed.ui.controls || parsed.ui.controls.length === 0)) {
        parsed.ui.controls = parsed.controls;
        addLog("[UI-AUDIT] Migration: Moved root controls to UI block.");
      }
      if (parsed.jacks && (!parsed.ui.jacks || parsed.ui.jacks.length === 0)) {
        parsed.ui.jacks = parsed.jacks;
        addLog("[UI-AUDIT] Migration: Moved root jacks to UI block.");
      }

      // Metadata fallback
      if (!parsed.metadata) parsed.metadata = { name: parsed.name || "Unnamed Module", family: "utility" };
      if (parsed.metadata.family) parsed.metadata.family = parsed.metadata.family.toLowerCase();
      
      // DEEP NORMALIZATION
      const normalize = (list: any[], defaultTab: string) => (list || []).map((c: any, idx: number) => {
        const rawPos = c.pos || {};
        const getNum = (v: any) => {
          const n = parseFloat(String(v));
          return isNaN(n) ? 0 : n;
        };

        const x = getNum(rawPos.x);
        const y = getNum(rawPos.y !== undefined ? rawPos.y : rawPos['y']);

        return {
          ...c,
          id: c.id || `entity_${defaultTab}_${idx}`,
          type: c.type?.toLowerCase() || (defaultTab === 'PATCHING' ? 'port' : 'knob'),
          roles: c.roles || (defaultTab === 'PATCHING' ? ['port'] : ['control']),
          pos: { x, y },
          presentation: {
            ...c.presentation,
            tab: c.presentation?.tab || defaultTab,
            variant: c.presentation?.variant || 'A',
            component: c.presentation?.component || c.type?.toLowerCase() || (defaultTab === 'PATCHING' ? 'port' : 'knob'),
            attachments: (c.presentation?.attachments || []).map((att: any) => ({
              ...att,
              type: att.type || 'label',
              position: att.position || 'bottom',
              format: att.format || {}
            })),
            precision: c.presentation?.precision ?? 6,
            ui_precision: c.presentation?.ui_precision ?? 2,
          }
        };
      });

      parsed.ui.controls = normalize(parsed.ui.controls, 'MAIN');
      parsed.ui.jacks = normalize(parsed.ui.jacks, 'PATCHING');
      
      addLog(`[UI-AUDIT] Final Count: ${parsed.ui.controls.length} Params / ${parsed.ui.jacks.length} Signals.`);
      
      // Forced state refresh
      setManifest({ ...parsed });
      addLog(`Success: UI state reconstructed for '${parsed.metadata.name}'.`);
    } catch (err: any) {
      addLog(`[CRITICAL] Ingestion Failure: ${err.message}`);
      console.error("Manifest Ingestion Failure:", err);
    }
  };

  const updateManifest = (updates: any) => {
    setManifest((prev: any) => {
      // Deep-ish merge for the UI object to avoid losing skin/dimensions
      if (updates.ui && prev.ui) {
        updates.ui = { ...prev.ui, ...updates.ui };
      }
      const next = { ...prev, ...updates };
      if (next.metadata?.family) {
        next.metadata.family = next.metadata.family.toLowerCase();
      }
      return next;
    });
  };

  const findItem = useCallback((id: string) => {
    return [...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].find((i: any) => i.id === id);
  }, [manifest]);

  const updateItem = useCallback((id: string, updates: any) => {
    const isJack = manifest.ui?.jacks?.some((j: any) => j.id === id);
    if (isJack) {
      const nextJacks = manifest.ui.jacks.map((j: any) => j.id === id ? { ...j, ...updates } : j);
      updateManifest({ ui: { jacks: nextJacks } });
    } else {
      const nextControls = manifest.ui.controls.map((c: any) => c.id === id ? { ...c, ...updates } : c);
      updateManifest({ ui: { controls: nextControls } });
    }
  }, [manifest, updateManifest]);

  const duplicateItem = useCallback((id: string) => {
    const item = findItem(id);
    if (!item) return;

    const type = manifest.ui?.controls?.some((c: any) => c.id === id) ? 'control' : 'jack';
    const key = type === 'control' ? 'controls' : 'jacks';
    const newItem = JSON.parse(JSON.stringify(item));
    
    let baseId = `${item.id}_copy`;
    let counter = 1;
    let newId = baseId;
    while ([...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].some((i: any) => i.id === newId)) {
      newId = `${baseId}_${counter++}`;
    }
    
    newItem.id = newId;
    const newList = [...(manifest.ui[key] || []), newItem];
    updateManifest({ ui: { ...manifest.ui, [key]: newList } });
    addLog(`Duplicated ${type}: ${newId}`);
    return newId;
  }, [manifest, findItem, updateManifest, addLog]);

  const removeItem = useCallback((id: string) => {
    const isJack = manifest.ui?.jacks?.some((j: any) => j.id === id);
    if (isJack) {
      const nextJacks = manifest.ui.jacks.filter((j: any) => j.id !== id);
      updateManifest({ ui: { jacks: nextJacks } });
    } else {
      const nextControls = manifest.ui.controls.filter((c: any) => c.id !== id);
      updateManifest({ ui: { controls: nextControls } });
    }
    addLog(`Removed entity: ${id}`);
  }, [manifest, updateManifest, addLog]);

  const addEntity = (type: 'control' | 'jack') => {
    const id = `new_${type}_${Date.now().toString().slice(-4)}`;
    const newEntity = {
      id,
      type: type === 'control' ? 'knob' : 'port',
      bind: '',
      label: type === 'control' ? 'New Control' : 'New Jack',
      pos: type === 'control' ? { x: 50, y: 50 } : { x: 50, y: 350 },
      presentation: {
        tab: type === 'jack' ? 'PATCHING' : 'MAIN',
        component: type === 'control' ? 'knob' : 'port',
        variant: 'A',
        attachments: []
      }
    };

    if (type === 'control') {
      const nextControls = [...(manifest.ui?.controls || []), newEntity];
      updateManifest({ ui: { controls: nextControls } });
    } else {
      const nextJacks = [...(manifest.ui?.jacks || []), newEntity];
      updateManifest({ ui: { jacks: nextJacks } });
    }
    addLog(`Added new ${type}: ${id}`);
    return id;
  };

  const exportManifest = () => {
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
    addLog(`Exported: ${manifest.id}.acemm`);
  };

  const reset = () => {
    if (confirm("Reset workspace?")) {
      setManifest({
        schemaVersion: '7.0',
        id: 'new_module',
        metadata: { name: 'New Module', family: 'oscillator', tags: ['era7'] },
        ui: { dimensions: { width: 120, height: 420 }, controls: [], jacks: [] },
        resources: { wasm: 'module.wasm' }
      });
      setContract(null);
      addLog("Workspace reset.");
    }
  };

  return {
    manifest,
    contract,
    issues,
    logs,
    handleWasmUpload,
    handleContractUpload,
    handleManifestUpload,
    updateManifest,
    findItem,
    updateItem,
    removeItem,
    duplicateItem,
    addEntity,
    exportManifest,
    reset
  };
};
