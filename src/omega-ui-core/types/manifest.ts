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
  // UCA Phase 10.2 - Interaction Mode
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
  backgroundAsset?: string;
  [key: string]: unknown; // HARDENED from any
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
  authorEmail?: string;
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
 * UCA PHASE 10.2 - UNIVERSAL CELL ARCHITECTURE
 * The hierarchical tree is the canonical visual source of truth.
 */

export type NodeKind = 
  | 'rack' 
  | 'face' 
  | 'container' 
  | 'cell' 
  | 'asset-layer'
  | 'group'
  | string;

export type NodeRole = 
  | 'structure' 
  | 'decor' 
  | 'mechanical' 
  | 'control' 
  | 'telemetry' 
  | 'io' 
  | 'logic-group'
  | 'root'
  | 'presentation'
  | string;

export type CellKind = 
  | 'decor' 
  | 'mechanical' 
  | 'control' 
  | 'telemetry' 
  | 'io' 
  | 'container' 
  | 'composite'
  | string;

export interface OmegaConstraints {
  clampToParent?: boolean;   // Lock child inside parent bounding box
  margin?: number;           // Safety margin in rack units
}

export type LayoutMode = 'absolute' | 'stack-v' | 'stack-h';

/**
 * OmegaNode: The concrete unit of visual composition.
 */
export interface OmegaNode {
  id: string;
  kind: NodeKind;
  role?: NodeRole;
  cellRef?: string;  // Reference to a CellTemplate
  bind?: string;     // DSP Contract ID / Signal mapping
  layout: {
    pos: Position;
    size?: Dimensions;
    transform?: string;
    zIndex?: number;
    mode?: LayoutMode;
    gap?: number;
    padding?: number;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  };
  style?: OmegaStyleNode;
  visible?: boolean;
  locked?: boolean;
  capabilities?: string[];
  constraints?: OmegaConstraints;
  children?: OmegaNode[];
  // UCA EXTENSIONS
  overrides?: Record<string, unknown>; // HARDENED
  assetBehavior?: import('./assetBehavior').AssetBehavior;
  slotMappings?: Record<string, string>;
  snapshot?: OmegaNode;
  templateRef?: string; // Legacy alias for cellRef
  [key: string]: unknown; // HARDENED
}

// ALIASES FOR COMPATIBILITY
export type OverrideMode = 'editable' | 'locked' | 'hidden';

export interface OverridePolicy {
  path: string;
  mode: OverrideMode;
  [key: string]: unknown;
}

/**
 * CellTemplate: Reusable catalog definition for a visual cell.
 */
export interface CellTemplate {
  id: string;
  label: string;
  category: CellKind;
  family?: string; // Add family for gallery filtering
  baseNode: OmegaNode; // The structural blueprint of the cell
  root?: OmegaNode;    // [COMPAT] Legacy alias for baseNode
  policy?: OverridePolicy[]; // HARDENED
  version?: string;
  slots?: Array<{ id: string; label: string; kind: string; required?: boolean; path?: string }>; // HARDENED
  metadata?: Record<string, unknown>;
  compatibility?: Record<string, unknown>; // HARDENED
  description?: string;
  placeholders?: BlueprintPlaceholderDefinition[]; // HARDENED
  assetBehavior?: import('./assetBehavior').AssetBehavior;
  recipe?: import('./assetBehavior').LayerRecipe; // Phase 12 Layer Composition
}

export type ModuleTemplate = CellTemplate;
export type CompatibilityStatus = 'compatible' | 'incompatible' | 'unknown';
export type ValidationSeverity = 'info' | 'warning' | 'error';
export type BlueprintPlaceholderValues = Record<string, unknown>; // HARDENED
export type BlueprintInsertionMode = 'commit' | 'dry-run';
export type IdCollisionStrategy = 'remap' | 'fail' | 'ignore';
export type BlueprintAutoWirePolicy = { mode: string; [key: string]: unknown }; // HARDENED
export type BlueprintAutoWireDecision = unknown; // HARDENED
export type BlueprintCompatibility = Record<string, unknown>; // HARDENED

/**
 * BlueprintDefinition: The declarative intent for module composition.
 */
export interface BlueprintDefinition {
  blueprintId: string;
  version: string;
  name: string;
  description?: string;
  origin: 'system' | 'user' | 'imported';
  tags?: string[];
  rootNode: OmegaBlueprintNode; // Allows placeholders
  placeholders: BlueprintPlaceholderDefinition[];
  compatibility: {
    allowedParentKinds?: NodeKind[];
    deniedParentKinds?: NodeKind[];
    allowedPlanes?: string[];
    singleton?: boolean;
    minManifestVersion?: string;
    [key: string]: unknown; // HARDENED
  };
  autoWirePolicy?: BlueprintAutoWirePolicy;
  materializeSnapshot?: boolean;
  templateId?: string;
  [key: string]: unknown; // HARDENED
}

export interface OmegaBlueprintNode extends Omit<OmegaNode, 'id' | 'children'> {
  id: string; // Allows expressions like "{{placeholderId}}"
  children?: OmegaBlueprintNode[];
}

export interface BlueprintPlaceholderDefinition {
  id: string;
  label: string;
  valueType: 'string' | 'number' | 'boolean' | 'nodeId' | 'color' | 'enum' | 'enumValue';
  defaultValue?: unknown;
  required: boolean;
  description?: string;
  targetPath: string; // JSON Pointer or dot-notation
  allowedValues?: unknown[]; // HARDENED
  hint?: string;
}

export interface GridConfig {
  enabled: boolean;
  spacingX: number;
  spacingY: number;
}

/**
 * OMEGA_Manifest: The final serialized editable instance.
 */
export interface OMEGA_Manifest {
  schemaVersion: string;
  id: string;
  metadata: ManifestMetadata;
  ui: {
    dimensions: Dimensions;
    /** @deprecated Projections of the tree model */
    controls: ManifestEntity[];
    /** @deprecated Projections of the tree model */
    jacks: ManifestEntity[];
    /** @deprecated Projections of the tree model */
    layout?: {
      containers: LayoutContainer[];
      planes?: string[];
      gridSnap?: number;
      grid?: GridConfig; // Typed for CADOverlay
      tabStyles?: Record<string, string>;
      activeTab?: string;
    };
    
    // CANONICAL UCA STATE (Phase 10.2)
    tree?: OmegaNode; // Canonic hierarchical source of truth
    useUCA?: boolean; // Feature flag for recursive rendering
    cellLibrary?: Record<string, CellTemplate>; // Library of reusable visual cells
    moduleTemplates?: Record<string, CellTemplate>; // [COMPAT] Alias for cellLibrary
    
    ucaDebug?: {
      enabled: boolean;
      showLabels?: boolean;
      showCADOverlay?: boolean;
      hideDecorative?: boolean;
    };
    
    // GLOBAL AESTHETICS (Inherited by UCA nodes)
    palette?: Record<string, string>;
    colors?: Record<string, string>;
    typography?: {
      defaultFont?: string;
      definitions?: { id: string; label: string; family: string }[];
      [key: string]: unknown;
    };
    lighting?: {
      shadowAngle?: number;
      ambientIntensity?: number;
      surfaceGrain?: number;
      specularIntensity?: number;
      opacity?: number;
      globalBlur?: number;
      [key: string]: unknown;
    };
    
    // LEGACY UI GOVERNANCE (Restored for Editor Parity)
    skin?: string;
    skinMode?: 'standard' | 'custom' | string;
    styles?: Record<string, StyleVariant[]>; 
    faceplate?: string | Record<string, string>;
    faceplateMode?: string;
    hardware?: {
      screwCount?: number;
      screwMapping?: string[];
      screwOffset?: number;
      showRails?: boolean;
      railStyle?: string;
      railColor?: string;
      variant?: string;
    };
    attachments?: Attachment[];
    resources?: {
       fonts?: { id?: string, name: string, url?: string, file?: string, family?: string }[];
       [key: string]: unknown;
    };
    [key: string]: unknown; // HARDENED for extension
  };
  resources: {
    wasm: string;
    contract?: string;
    assets?: OMEGA_Asset[];
    [key: string]: unknown;
  };
  modulations?: OMEGA_Modulation[]; // Restored to root
  [key: string]: unknown; 
}
