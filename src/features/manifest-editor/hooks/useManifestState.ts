'use client';

import { useState, useCallback } from 'react';
import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';
import { OmegaContract } from '@/services/wasmLoader';

/**
 * useManifestState (v7.2.3)
 * Pure state management for the OMEGA Manifest Editor.
 * This hook is strictly for state storage and does not contain I/O logic.
 */
export const useManifestState = () => {
  const [manifest, setManifest] = useState<OMEGA_Manifest>({
    schemaVersion: '7.2.3',
    id: 'omega_master_showcase',
    metadata: {
      name: 'Master Industrial Showcase',
      family: 'synthesizer',
      tags: ['era7', 'industrial', 'high-fidelity']
    },
    ui: {
      dimensions: { width: 140, height: 420 },
      skin: 'custom',
      skinMode: 'custom',
      colors: {
        accent: '#00f2ff', // Neon Cyan
        weak: '#44484c',   // Industrial Steel
        surface: '#121416', // Deep Noir
        text: '#e0e4e8'     // Cold Silver
      },
      lighting: {
        shadowAngle: 135,
        shadowColor: 'rgba(0,0,0,0.7)',
        distance: 6,
        blur: 8
      },
      styles: {
        'knob': [
          { id: 'knob_lg_cyan', label: 'Large Cyan Knob', aesthetics: { scale: 'L', color: '#00f2ff' } },
          { id: 'knob_md_cyan', label: 'Medium Cyan Knob', aesthetics: { scale: 'M', color: '#00f2ff' } },
          { id: 'knob_sm_cyan', label: 'Small Cyan Knob', aesthetics: { scale: 'S', color: '#00f2ff' } },
          { id: 'knob_lg_amber', label: 'Large Amber Knob', aesthetics: { scale: 'L', color: '#ffb300' } },
          { id: 'knob_md_amber', label: 'Medium Amber Knob', aesthetics: { scale: 'M', color: '#ffb300' } },
          { id: 'knob_sm_amber', label: 'Small Amber Knob', aesthetics: { scale: 'S', color: '#ffb300' } },
          { id: 'knob_lg_steel', label: 'Large Steel Knob', aesthetics: { scale: 'L', color: '#8899aa' } },
          { id: 'knob_md_steel', label: 'Medium Steel Knob', aesthetics: { scale: 'M', color: '#8899aa' } },
          { id: 'knob_sm_steel', label: 'Small Steel Knob', aesthetics: { scale: 'S', color: '#8899aa' } },
        ],
        'port': [
          { id: 'jack_standard', label: 'Standard Jack', aesthetics: { color: '#44484c' } },
          { id: 'jack_input', label: 'Input Jack', aesthetics: { color: '#00f2ff' } }
        ],
        'led': [
          { id: 'led_blue', label: 'Blue Signal LED', aesthetics: { color: '#00f2ff' } },
          { id: 'led_red', label: 'Red Error LED', aesthetics: { color: '#ff4400' } }
        ],
        'container': [
          { id: 'main_plate', label: 'Main Plate', aesthetics: { rounding: 0, borderWidth: 1 } },
          { id: 'section_header', label: 'Section Header', aesthetics: { rounding: 0, opacity: 0.1 } },
          { id: 'panel_inset', label: 'Lateral Panel', aesthetics: { rounding: 4, opacity: 0.05 } }
        ],
        'group': [
          { id: 'logical_group', label: 'Standard Group', aesthetics: { borderWidth: 1, opacity: 0.3 } }
        ]
      },
      controls: [],
      jacks: [],
      layout: {
        containers: [
          { id: 'main_plate', label: 'Main Plate', pos: { x: 0, y: 0 }, size: { w: 'full', h: 420 }, variant: 'default', tab: 'MAIN' }
        ],
        planes: ['MAIN'],
        gridSnap: 5
      }
    },
    resources: {
      wasm: 'module.wasm'
    }
  });

  const [contract, setContract] = useState<OmegaContract | null>(null);
  const [wasmBuffer, setWasmBuffer] = useState<ArrayBuffer | null>(null);
  const [extraResources, setExtraResources] = useState<{ name: string, data: ArrayBuffer, type: string }[]>([]);

  const updateManifest = useCallback((updates: Partial<OMEGA_Manifest>) => {
    setManifest((prev: OMEGA_Manifest) => {
      const next = { ...prev, ...updates };
      
      // Ensure metadata is cloned if modified to avoid mutation
      if (next.metadata) {
        next.metadata = { 
          ...next.metadata,
          family: next.metadata.family?.toLowerCase() || next.metadata.family
        };
      }
      
      return next;
    });
  }, []);

  const resetState = useCallback(() => {
    setManifest({
      schemaVersion: '7.2.3',
      id: 'new_module',
      metadata: { name: 'New Module', family: 'oscillator', tags: ['era7'] },
      ui: { 
        dimensions: { width: 140, height: 420 }, 
        skin: 'custom',
        skinMode: 'custom',
        colors: {
          accent: '#00f2ff',
          weak: '#44484c',
          surface: '#121416',
          text: '#e0e4e8'
        },
        lighting: {
          shadowAngle: 135,
          shadowColor: 'rgba(0,0,0,0.7)',
          distance: 6,
          blur: 8
        },
        styles: {
          'knob': [
            { id: 'knob_lg_cyan', label: 'Large Cyan Knob', aesthetics: { scale: 'L', color: '#00f2ff' } },
            { id: 'knob_md_cyan', label: 'Medium Cyan Knob', aesthetics: { scale: 'M', color: '#00f2ff' } },
            { id: 'knob_sm_cyan', label: 'Small Cyan Knob', aesthetics: { scale: 'S', color: '#00f2ff' } },
          ],
          'port': [{ id: 'jack_standard', label: 'Standard Jack', aesthetics: { color: '#44484c' } }],
          'led': [{ id: 'led_blue', label: 'Blue Signal LED', aesthetics: { color: '#00f2ff' } }]
        },
        controls: [], 
        jacks: [],
        layout: { 
          containers: [
            { id: 'main_plate', label: 'Main Plate', pos: { x: 0, y: 0 }, size: { w: 'full', h: 420 }, variant: 'default', tab: 'MAIN' }
          ], 
          planes: ['MAIN'],
          gridSnap: 5 
        }
      },
      resources: { wasm: 'module.wasm' }
    });
    setContract(null);
    setWasmBuffer(null);
    setExtraResources([]);
  }, []);

  return {
    manifest,
    setManifest,
    contract,
    setContract,
    wasmBuffer,
    setWasmBuffer,
    extraResources,
    setExtraResources,
    updateManifest,
    resetState
  };
};
