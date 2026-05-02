/**
 * OMEGA ERA 7.1 - CANONICAL MANIFEST INTERFACES
 * Following ERA 4 Hardening Standards
 */

export type RegistryRole = 'control' | 'telemetry' | 'stream' | 'mod_target';
export type ComponentType = 'knob' | 'slider-v' | 'slider-h' | 'select' | 'switch' | 'button' | 'port' | 'led' | 'display' | 'label';
export type AttachmentType = 'label' | 'led' | 'display' | 'stepper' | 'path';
export type TabName = 'MAIN' | 'FX' | 'EDIT' | 'MIDI' | 'MOD' | 'ADVANCED';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Attachment {
  type: AttachmentType;
  position: 'top' | 'bottom' | 'left' | 'right';
  offsetX: number;
  offsetY: number;
  variant: string;
  text?: string;
  role?: string;
  bind?: string;
}

export interface Presentation {
  tab: TabName | string;
  component: ComponentType | string;
  variant: string;
  offsetX: number;
  offsetY: number;
  group?: string;
  attachments: Attachment[];
  precision?: number;
  ui_precision?: number;
  ui?: {
    disabled?: boolean;
    readOnly?: boolean;
    hidden?: boolean;
    [key: string]: boolean | undefined;
  };
}

export interface ManifestEntity {
  id: string;
  type: string;
  role: RegistryRole | string;
  bind: string;
  label?: string;
  pos: Position;
  presentation: Presentation;
  value_normalization?: string;
}

export interface ManifestMetadata {
  name: string;
  family: string;
  author?: string;
  version?: string;
  tags?: string[];
  rack?: {
    hp?: number;
    height_mode?: 'standard' | 'compact';
    skin?: string;
  };
}

export interface OMEGA_Modulation {
  id: string;
  source: string; // Entity ID (e.g., lfo_1)
  target: string; // Entity ID (e.g., osc_freq)
  amount: number; // 0.0 to 1.0
  type?: 'unipolar' | 'bipolar';
}

export interface OMEGA_Manifest {
  schemaVersion: string;
  id: string;
  metadata: ManifestMetadata;
  ui: {
    dimensions: Dimensions;
    controls: ManifestEntity[];
    jacks: ManifestEntity[];
  };
  resources: {
    wasm: string;
    contract?: string;
  };
  modulations?: OMEGA_Modulation[];
}
