'use client';

import { useCallback, Dispatch, SetStateAction } from 'react';
import yaml from 'js-yaml';
import { OMEGA_Manifest, ManifestEntity } from '../../../types/manifest';

export const useManifestTransfer = (
  manifest: OMEGA_Manifest,
  setManifest: Dispatch<SetStateAction<OMEGA_Manifest>>,
  addLog: (msg: string) => void,
  issues: any[]
) => {

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
            container: c.presentation?.container || c.presentation?.group,
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
          jacks: normalize(parsed.ui.jacks, 'MAIN'),
          skin: parsed.ui.skin || 'industrial',
          layout: parsed.ui.layout || { containers: [], gridSnap: 5 }
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

  const exportCADBlueprint = useCallback(() => {
    const { CADExportService } = require('../../../services/cadExportService');
    const svg = CADExportService.generateSVGBlueprint(manifest);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAD_BLUEPRINT_${manifest.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    addLog(`[OK] Exported Industrial CAD Blueprint: ${manifest.id}.svg`);
  }, [manifest, addLog]);

  return {
    handleManifestUpload,
    exportManifest,
    exportCADBlueprint
  };
};
