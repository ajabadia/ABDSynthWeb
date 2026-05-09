/**
 * OMEGA ERA 7.2.3 - CANONICAL MANIFEST INTERFACES
 * Following ERA 4 Hardening Standards
 */

export type RegistryRole = 'control' | 'telemetry' | 'stream' | 'mod_target';
export type ComponentType = 'knob' | 'slider-v' | 'slider-h' | 'select' | 'switch' | 'button' | 'port' | 'led' | 'display' | 'label' | 'illustration' | 'scope' | 'terminal';
export type AttachmentType = 'knob' | 'port' | 'slider-v' | 'slider-h' | 'switch' | 'push' | 'label' | 'display' | 'led' | 'stepper' | 'path';

export interface ExtraResource {
  name: string;
  data: ArrayBuffer;
  type: string;
}

export interface OMEGA_Asset {
  id: string;
  url: string;      // asset://filename.png, data:image/... o path relativo
  type: 'image' | 'filmstrip' | 'svg';
  frames?: number;  // Obligatorio para filmstrips
  orientation?: 'v' | 'h'; // Orientación del filmstrip
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
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  style?: OmegaStyleNode; // [NEW] Era 7.2.3 Granular Styling
  id: string; // Mandatory for fragment mapping
}

/**
 * ERA 7.2.3 - UNIFIED AESTHETIC NODE
 * Groups all visual-only properties to separate them from logic and layout.
 */
export interface OmegaStyleNode {
  color?: string;
  indicatorColor?: string;
  glowColor?: string;
  glassColor?: string;
  font?: string;
  fontSize?: number;
  fontColor?: string;
  opacity?: number;
  intensity?: number;
  rounding?: number;
  shadow?: string;
  shadowInner?: string;
  blur?: number;
  texture?: string;
  borderWidth?: number;
  padding?: number;
  thickness?: number;     // Line/Cable thickness
  alignment?: 'left' | 'center' | 'right';
  zIndex?: number;
  asset?: string;
  fitting?: 'stretch' | 'cover' | 'contain' | 'tile' | 'center'; // Era 7.2.3 Image Fitting
  material?: string;
  spacing?: number;
  labelX?: number; // Architectural Label Offsets
  labelY?: number;
  labelW?: number;
  labelH?: number;
  labelBg?: string;
  labelRounding?: number;
  labelPadding?: number;
  // Industrial Filmstrip Metrics
  frames?: number;
  frameWidth?: number;
  frameHeight?: number;
  orientation?: 'v' | 'h';
  width?: number;  // Explicit override for primitives
  height?: number;
  offsetX?: number; // Architectural Spatial Offsets
  offsetY?: number;
  // Animation & Sequence Metadata
  graphicMode?: 'static' | 'sequence';
  zeroAnchor?: number;
  mode?: 'rotate' | 'sequence' | 'state' | string;
  mouseResponse?: 'rotary' | 'linear';
  category?: string; // Asset-specific category (e.g. 'knob', 'slider')
  polarity?: 'normal' | 'inverted'; // Mechanical polarity for assets
  precision?: number; // Numerical precision for displays/logic
  active?: boolean; // Generic active state for fragments
  // Advanced Mechanicals
  useSpecificRounding?: boolean;
  roundingTL?: number;
  roundingTR?: number;
  roundingBL?: number;
  roundingBR?: number;
  tiling?: number;
  // Technical Asset Metadata
  id?: string;
  name?: string;
  path?: string;
  defaultFrame?: number;
  testValue?: number;
  variant?: string;
  [key: string]: unknown; // Allow for dynamic aesthetic properties
}

export interface StyleVariant {
  id: string;
  label: string;
  aesthetics: Partial<OmegaStyleNode>;
}

export interface LibraryAsset {
  id: string;
  name: string;
  path: string;
  frames?: number;
  orientation?: 'v' | 'h';
  isFolder?: boolean;
}

export interface AssetRegistry {
  statics?: LibraryAsset[];
  sequences?: LibraryAsset[];
  [key: string]: LibraryAsset[] | undefined;
}

export interface OMEGA_Contract {
  omega_version: string;
  id: string;
  name?: string;
  family?: string;
  parameters: Array<{
    id: string;
    name: string;
    min: number;
    max: number;
    default: number;
    unit?: string;
  }>;
  ports: Array<{
    id: string;
    type: 'audio' | 'cv' | 'midi' | 'gate';
    direction: 'input' | 'output';
  }>;
  firmwareHash?: string;
  metadata?: Record<string, unknown>;
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
  // Visual Overrides (Era 7.2.3 recommends moving these to style node eventually)
  asset?: string;         
  color?: string;         
  indicatorColor?: string; 
  font?: string;          
  fontSize?: number;
  fontColor?: string;
  rounding?: number;
  borderWidth?: number;
  thickness?: number;     
  opacity?: number;
  labelX?: number;        
  labelY?: number;
  labelW?: number;
  labelH?: number;
  labelBg?: string;
  labelRounding?: number;
  labelPadding?: number;
  style?: OmegaStyleNode; // [NEW] Canonical style node for containers
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
  rowSpan?: number;
  asset?: string;         // ID del asset en el bloque de recursos
  filmstrip_frame?: number; // Frame actual si es manual
  attachments: Attachment[];
  style?: OmegaStyleNode; // [NEW] Era 7.2.3 Modular Styling Node
  scale?: 'S' | 'M' | 'L' | 'XL' | number; // [NEW] Era 7.2.3 Size Decoupling
  precision?: number;
  step?: number;
  color?: string;
  indicatorColor?: string;
  glowColor?: string;
  glassColor?: string;
  options?: SelectOption[];
  /** @deprecated Use precision instead */
  ui_precision?: number;
  ui?: {
    disabled?: boolean;
    readOnly?: boolean;
    hidden?: boolean;
    [key: string]: boolean | undefined;
  };
  unit?: string;
  size?: { w: number; h: number }; 
  opacity?: number;
  font?: string;
  fontSize?: number; // [NEW] Era 7.2.3 Parity
  fontColor?: string; // [NEW] Era 7.2.3 Parity
  lookup?: string;
  height?: number; // Physical prominence (protrusion/recess)
  thickness?: number; // Line/Cable thickness
  intensity?: number; // Light emission strength
  rounding?: number; // Corner radius
  alignment?: 'left' | 'center' | 'right'; // Content alignment
  padding?: number; // Internal container spacing
  texture?: string; // Procedural surface grain
  // Industrial Filmstrip Metrics (Mirror StyleNode for direct access)
  frames?: number;  
  frameWidth?: number;
  frameHeight?: number;
  orientation?: 'v' | 'h';
  fitting?: 'stretch' | 'cover' | 'contain' | 'tile' | 'center';
  labelBg?: string;
  labelX?: number;
  labelY?: number;
  labelW?: number;
  labelH?: number;
  labelRounding?: number;
  labelPadding?: number;
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
  // Library Extensions
  category?: string;
  name?: string;
  description?: string;
  path?: string;
  isLocal?: boolean;
}

export interface ManifestMetadata {
  name: string;
  family: string;
  author?: string;
  version?: string;
  status?: string;      // Industrial status (Stable, Alpha, etc.)
  icon?: string;        // Era 7.2.3 Module icon
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

/**
 * UCA PHASE 1 - COMPOSITE TREE GRAMMAR (Additive)
 * Standardizing on hierarchical nodes for Era 7.2.3 and beyond.
 */
export type OmegaNodeKind = 'rack' | 'face' | 'container' | 'cell' | 'layer';

export interface OmegaNode {
  id: string;
  kind: OmegaNodeKind;
  role?: string;
  cellRef?: string; // Catalog blueprint reference (mandatory for kind: cell)
  bind?: string;    // Signal/State binding
  layout?: {
    pos: Position;
    size?: Dimensions;
    transform?: string;
    zIndex?: number;
  };
  style?: OmegaStyleNode;
  visible?: boolean;
  locked?: boolean;
  capabilities?: string[];
  children?: OmegaNode[];
}

export interface CellTemplate {
  id: string;
  label: string;
  category: string;
  baseNode: OmegaNode; // Structural blueprint
}

export interface OMEGA_Manifest {
  schemaVersion: string;
  id: string;
  metadata: ManifestMetadata;
  ui: {
    dimensions: Dimensions;
    controls: ManifestEntity[];
    jacks: ManifestEntity[];
    useUCA?: boolean; // [EXPERIMENTAL] Enable recursive rendering engine
    ucaDebug?: {
      enabled: boolean;
      showLabels?: boolean;
      hideDecorative?: boolean;
    };
    tree?: OmegaNode; // [NEW] Hierarchical UI Root Node
    skin?: string; // Global UI skin
    skinMode?: 'standard' | 'custom'; // Era 7.2.3 Governance Mode
    layout?: {
      containers: LayoutContainer[];
      planes?: TabName[]; // [NEW] Active architectural planes for the module
      gridSnap?: number;
      activeTab?: TabName | string;
      tabStyles?: Record<string, string>; // [NEW] Maps tabId to rack style variantId
    };
    resources?: {
      fonts?: { name: string; file: string }[];
    };
    lighting?: {
      shadowAngle: number;
      shadowColor: string;
      distance: number;
      blur: number;
      ambientIntensity?: number; // [NEW] Base illumination level
      specularIntensity?: number; // [NEW] Edge highlights / reflection strength
      surfaceGrain?: number;      // [NEW] Procedural noise intensity
      opacity?: number;           // [NEW] Global UI transparency
      globalBlur?: number;        // [NEW] Backdrop blur (Glassmorphism)
    };
    hardware?: {
      screwCount?: 0 | 4 | 6 | 8;  // [NEW] Total mounting points
      screwMapping?: string[];     // [NEW] Style IDs for each position (e.g. ['standard', 'custom', ...])
      screwOffset?: number;        // Distance from corners in px
      railStyle?: 'none' | 'slim' | 'heavy' | 'industrial';
      railColor?: string;
      showRails?: boolean;
      variant?: string; // [NEW] Era 7.2.3 Industrial Variant selection
    };
    faceplate?: string | Record<string, string>;
    faceplateMode?: 'stretch' | 'cover' | 'contain' | 'tile' | 'center'; // [NEW] Image fitting strategy
    palette?: {
      primary: string;
      secondary: string;
      utility: string;
      feedback: string;
      hardware?: string;
      chassis?: string;
      glow?: string;
      glass?: string;
      warning?: string;
      highlight?: string;
      [key: string]: string | undefined;
    };
    colors?: {
      accent: string;
      weak?: string;
      surface?: string;
      text?: string;
      [key: string]: string | undefined;
    };
    typography?: {
      defaultFont?: string;
      headings?: { font?: string; size?: number; color?: string };
      labels?: { font?: string; size?: number; color?: string };
      displays?: { font?: string; size?: number; color?: string };
      technical?: { font?: string; size?: number; color?: string };
      definitions?: {
        id: string;
        label: string;
        family: string;
      }[];
      [key: string]: unknown;
    };
    styles?: {
      [componentType: string]: StyleVariant[];
    };
    style?: OmegaStyleNode;    // Global Rack Aesthetics
    attachments?: ManifestEntity[]; // Global Rack Fragments (e.g. Screws)
  };
  modulations?: OMEGA_Modulation[];
  resources: {
    wasm: string;
    contract?: string;
    assets?: OMEGA_Asset[]; // [NEW] Catálogo de recursos externos
  };
}
