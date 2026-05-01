import { useState, useCallback, useMemo } from 'react';
import { WasmLoaderService, OmegaContract } from '../services/wasmLoader';
import { ValidationService } from '../services/validationService';
import { OMEGA_Manifest, ManifestEntity } from '../types/manifest';
import yaml from 'js-yaml';

export const useManifestEditor = () => {
  const [manifest, setManifest] = useState<OMEGA_Manifest>({
    schemaVersion: '7.1',
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

      manifest.ui?.controls?.forEach((ctrl: ManifestEntity, i: number) => {
        const bindId = ctrl.bind?.toLowerCase();
        if (bindId && !contractParamIds.includes(bindId)) {
          baseIssues.push({
            path: `/ui/controls/${i}/bind`,
            message: `Binding error: '${ctrl.bind}' not found in contract.`,
            keyword: 'binding'
          });
        }
      });

      manifest.ui?.jacks?.forEach((jack: ManifestEntity, i: number) => {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`Error: ${message}`);
    }
  };

  const handleContractUpload = async (file: File) => {
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
      
      // Normalization and Audit
      loadedContract.parameters = loadedContract.parameters.map((p: any) => ({ ...p, id: String(p.id || p.name).toLowerCase() }));
      loadedContract.ports = loadedContract.ports.map((p: any) => ({ ...p, id: String(p.id || p.name).toLowerCase() }));
      
      setContract(loadedContract);
      
      addLog(`[AUDIT] Contract '${loadedContract.id}' validated.`);
      addLog(`[AUDIT] Logic Ports: ${loadedContract.ports.length} (Inputs/Outputs detected).`);
      
      syncManifestWithContract(loadedContract, 'module.wasm');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] Contract Load Failed: ${message}`);
    }
  };

  const syncManifestWithContract = (newContract: OmegaContract, filename: string) => {
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
  };

  const handleManifestUpload = async (file: File) => {
    addLog(`Ingesting Manifest: ${file.name}...`);
    try {
      const content = await file.text();
      const parsed = yaml.load(content) as any; // Safe cast for raw YAML
      
      if (!parsed || typeof parsed !== 'object') throw new Error("Invalid manifest format.");

      // ERA 7 Hardening: Structure validation
      if (!parsed.ui) parsed.ui = { dimensions: { width: 120, height: 420 }, controls: [], jacks: [] };
      if (!parsed.metadata) parsed.metadata = { name: parsed.name || "Unnamed Module", family: "utility" };
      
      // DEEP NORMALIZATION ERA 7.1
      const normalize = (list: any[], defaultTab: string): ManifestEntity[] => (list || []).map((c: any, idx: number) => {
        const rawPos = c.pos || {};
        const getNum = (v: any) => {
          const n = parseFloat(String(v));
          return isNaN(n) ? 0 : n;
        };

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
        schemaVersion: String(parsed.schemaVersion || '7.0'),
        id: String(parsed.id || 'unknown_module'),
        metadata: {
          name: String(parsed.metadata.name),
          family: String(parsed.metadata.family).toLowerCase(),
          author: parsed.metadata.author,
          tags: parsed.metadata.tags || [],
          rack: parsed.metadata.rack
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
        }
      };

      setManifest(finalManifest);
      addLog(`Success: UI state reconstructed for '${finalManifest.metadata.name}'.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      addLog(`[CRITICAL] Ingestion Failure: ${message}`);
    }
  };

  const updateManifest = (updates: Partial<OMEGA_Manifest>) => {
    setManifest((prev: OMEGA_Manifest) => {
      const next = { ...prev, ...updates };
      if (next.metadata?.family) {
        next.metadata.family = next.metadata.family.toLowerCase();
      }
      return next;
    });
  };

  const findItem = useCallback((id: string): ManifestEntity | undefined => {
    return [...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].find((i: ManifestEntity) => i.id === id);
  }, [manifest]);

  const updateItem = useCallback((id: string, updates: Partial<ManifestEntity>) => {
    const isJack = manifest.ui?.jacks?.some((j: ManifestEntity) => j.id === id);
    
    if (isJack) {
      const nextJacks = manifest.ui.jacks.map((j: ManifestEntity) => j.id === id ? { ...j, ...updates } : j);
      updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
    } else {
      const nextControls = manifest.ui.controls.map((c: ManifestEntity) => c.id === id ? { ...c, ...updates } : c);
      updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
    }
  }, [manifest, updateManifest]);

  const duplicateItem = useCallback((id: string) => {
    const item = findItem(id);
    if (!item) return;

    const type = manifest.ui?.controls?.some((c: ManifestEntity) => c.id === id) ? 'control' : 'jack';
    const key = type === 'control' ? 'controls' : 'jacks';
    const newItem: ManifestEntity = JSON.parse(JSON.stringify(item));
    
    let baseId = `${item.id}_copy`;
    let counter = 1;
    let newId = baseId;
    while ([...(manifest.ui?.controls || []), ...(manifest.ui?.jacks || [])].some((i: ManifestEntity) => i.id === newId)) {
      newId = `${baseId}_${counter++}`;
    }
    
    newItem.id = newId;
    const newList = [...(manifest.ui[key] || []), newItem];
    updateManifest({ ui: { ...manifest.ui, [key]: newList } });
    addLog(`Duplicated ${type}: ${newId}`);
    return newId;
  }, [manifest, findItem, updateManifest, addLog]);

  const removeItem = useCallback((id: string) => {
    const isJack = manifest.ui?.jacks?.some((j: ManifestEntity) => j.id === id);
    if (isJack) {
      const nextJacks = manifest.ui.jacks.filter((j: ManifestEntity) => j.id !== id);
      updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
    } else {
      const nextControls = manifest.ui.controls.filter((c: ManifestEntity) => c.id !== id);
      updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
    }
    addLog(`Removed entity: ${id}`);
  }, [manifest, updateManifest, addLog]);

  const addEntity = (type: 'control' | 'jack') => {
    const id = `new_${type}_${Date.now().toString().slice(-4)}`;
    const newEntity: ManifestEntity = {
      id,
      type: type === 'control' ? 'knob' : 'port',
      role: type === 'control' ? 'control' : 'stream',
      bind: '',
      label: type === 'control' ? 'New Control' : 'New Jack',
      pos: type === 'control' ? { x: 50, y: 50 } : { x: 50, y: 350 },
      presentation: {
        tab: 'MAIN',
        component: type === 'control' ? 'knob' : 'port',
        variant: 'B_cyan',
        offsetX: 0,
        offsetY: 0,
        attachments: []
      }
    };

    if (type === 'control') {
      const nextControls = [...(manifest.ui?.controls || []), newEntity];
      updateManifest({ ui: { ...manifest.ui, controls: nextControls } });
    } else {
      const nextJacks = [...(manifest.ui?.jacks || []), newEntity];
      updateManifest({ ui: { ...manifest.ui, jacks: nextJacks } });
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

function getNum(v: any): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}
