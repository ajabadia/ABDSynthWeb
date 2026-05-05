/**
 * OMEGA ERA 7.1 - CANONICAL MANIFEST INTERFACES
 * Following ERA 4 Hardening Standards
 */

export type RegistryRole = 'control' | 'telemetry' | 'stream' | 'mod_target';
export type ComponentType = 'knob' | 'slider-v' | 'slider-h' | 'select' | 'switch' | 'button' | 'port' | 'led' | 'display' | 'label';
export type AttachmentType = 'knob' | 'port' | 'slider-v' | 'slider-h' | 'switch' | 'push' | 'label' | 'display' | 'led' | 'stepper' | 'path';
export interface ExtraResource {
  name: string;
  data: ArrayBuffer;
  type: string;
}

export type TabName = 'MAIN' | 'VOICE' | 'FX' | 'MOD' | 'EDIT' | 'MIDI' | 'ADVANCED' | string;

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
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  offsetX: number;
  offsetY: number;
  variant: string;
  text?: string;
  role?: string;
  bind?: string;
  isCore?: boolean; // Era 7.2.3 Internal Metadata
}

export type ContainerSizeUnit = 'full' | '3/4' | '2/3' | '1/2' | '1/3' | '1/4';
export type ContainerVariant = 'default' | 'header' | 'section' | 'panel' | 'inset' | 'minimal';

export interface ContainerSize {
  w: ContainerSizeUnit | number;
  h: number;
}

export interface LayoutContainer {
  id: string;
  label: string;
  pos: Position;
  size: ContainerSize;
  variant: ContainerVariant;
  zIndex?: number;
  labelPosition?: 'top' | 'bottom' | 'inside-top' | 'inside-bottom';
  tab?: TabName | string; // Era 7.2.1 Architectural Plane
  collapsed?: boolean;    // Era 7.2.3 Industrial Folding
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface Presentation {
  tab: TabName | string;
  component: ComponentType | string;
  variant: string;
  offsetX: number;
  offsetY: number;
  container?: string;     // Era 7.2 Container mapping
  colSpan?: number;       // Era 7.2.1 Grid span
  rowSpan?: number;       // Era 7.2.1 Grid span
  /** @deprecated Use container instead */
  group?: string;         
  attachments: Attachment[];
  precision?: number;
  step?: number;
  color?: string;
  options?: SelectOption[]; // For Select components
  /** @deprecated Use precision instead */
  ui_precision?: number;
  ui?: {
    disabled?: boolean;
    readOnly?: boolean;
    hidden?: boolean;
    [key: string]: boolean | undefined;
  };
  unit?: string;
}

export interface ManifestEntity {
  id: string;
  type: string;
  role: RegistryRole | string;
  roles?: string[]; // Industrial multi-role support
  bind: string;
  label?: string;
  pos: Position;
  presentation: Presentation;
  value_normalization?: string;
  unit?: string;
}

export interface ManifestMetadata {
  name: string;
  family: string;
  author?: string;
  version?: string;
  status?: string;      // Industrial status (Stable, Alpha, etc.)
  description?: string; // Module description
  tags?: string[];
  rack?: {
    hp?: number;
    height_mode?: 'standard' | 'compact' | 'full';
    slot?: string;      // Legacy/Visual slot mapping
    skin?: string;
  };
}

export interface OMEGA_Modulation {
  id: string;
  source: string; // Entity ID (e.g., lfo_1)
  target: string; // Entity ID (e.g., osc_freq)
  amount: number; // 0.0 to 1.0
  type?: 'unipolar' | 'bipolar' | 'additive' | 'multiplicative';
}

export interface OMEGA_Metric {
  label: string;
  value: number;
  color: string;
}


export interface OMEGA_Manifest {
  schemaVersion: string;
  id: string;
  metadata: ManifestMetadata;
  ui: {
    dimensions: Dimensions;
    controls: ManifestEntity[];
    jacks: ManifestEntity[];
    skin?: string; // Global UI skin
    layout?: {
      containers: LayoutContainer[];
      gridSnap?: number;
      activeTab?: TabName | string;
    };
  };
  registry?: ManifestEntity[]; // Legacy Era 4/5 support
  modulations?: OMEGA_Modulation[];
  resources: {
    wasm: string;
    contract?: string;
  };
}
