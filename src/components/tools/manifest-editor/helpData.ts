/**
 * OMEGA ERA 7.2 - MANUAL DE INGENIERÍA (BASE DE DATOS)
 * Idioma: Castellano (Manual de Referencia Industrial)
 */

export interface HelpSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  subsections?: {
    id: string;
    title: string;
    content: string;
    technical_params?: string[];
    category?: string;
  }[];
}

export const HELP_DATA: HelpSection[] = [
  {
    id: 'introduccion',
    title: 'Protocolo OMEGA 7.2.3',
    icon: '🚀',
    content: 'Bienvenido al entorno de ingeniería de OMEGA. Este editor permite construir manifiestos (.acemm) para módulos industriales con precisión sub-píxel y sincronización total con el motor WASM de la Era 7.'
  },
  {
    id: 'rack',
    title: 'El Rack (Chasis)',
    icon: '🧱',
    content: 'Define las propiedades físicas y estéticas del panel frontal del módulo.',
    subsections: [
      {
        id: 'dimensiones',
        title: 'Dimensiones y HP',
        content: 'El ancho se mide en HP (Horizontal Pitch). En OMEGA, 1 HP equivale exactamente a 15 píxeles reales. El alto estándar es 3U (420px) o 1U (compacto).',
        technical_params: ['hp', 'dimensions.width', 'dimensions.height']
      },
      {
        id: 'estetica',
        title: 'Skins (Acabados)',
        content: 'Determina el acabado visual del panel. Los acabados industriales como "Industrial" o "Carbon" están optimizados para reducir la fatiga visual.',
        technical_params: ['skin: industrial | carbon | glass | minimal']
      }
    ]
  },
  {
    id: 'layout',
    title: 'Arquitectura de Layout (Era 7.2.3)',
    icon: '📐',
    content: 'Define la estructura organizativa del módulo mediante contenedores declarativos.',
    subsections: [
      {
        id: 'contenedores',
        title: 'Layout Containers',
        content: 'Los contenedores son marcos arquitectónicos con posición y tamaño fijos. Permiten agrupar visualmente componentes y definir la jerarquía del panel.',
        technical_params: ['ui.layout.containers[]', 'container_id']
      },
      {
        id: 'planos',
        title: 'Container Authority',
        content: 'Jerarquía: Rack > Contenedor > Cell. El Tab definido en el contenedor TIENE PRIORIDAD sobre el del elemento. Esto garantiza la integridad del plano arquitectónico.',
        technical_params: ['tab: MAIN | FX | EDIT | MIDI | MOD | PATCHING']
      },
      {
        id: 'integrity',
        title: 'Firmware Integrity (SHA-256)',
        content: 'Cada manifiesto genera una firma criptográfica SHA-256 (Fingerprint). Para que el módulo sea validado por el motor ABDOmega, el hash del manifiesto debe coincidir exactamente con el del binario .wasm (Binary Sync).',
        category: 'professional'
      },
      {
        id: 'heatmap',
        title: 'Activity Heatmap',
        content: 'Los contenedores reaccionan visualmente a la actividad. Al mover un control, el contenedor padre emitirá un pulso de brillo industrial que se desvanece suavemente, indicando flujo de señal activo.',
        category: 'ui'
      },
      {
        id: 'compliance-v7',
        title: 'Inspección de Obra (Era 7.2.3)',
        content: 'El sistema de cumplimiento (Audit) ahora desglosa 4 áreas: GOV (Gobernanza), INT (Integridad Espacial), TECH (Esquema Técnico) y STYLE (Identidad Visual).',
        category: 'professional'
      },
      {
        id: 'integridad',
        title: 'Integridad Estructural',
        content: 'Los componentes no pueden "escapar" de sus contenedores ni del rack. El sistema audita las coordenadas físicas para asegurar que todo encaje en el chasis.',
        technical_params: ['pos.x', 'pos.y', 'size.w', 'size.h']
      },
      {
        id: 'sizing',
        title: 'Sizing Industrial',
        content: 'Soporta anchos fraccionales respecto al ancho total del rack: full, 1/2, 3/4, 1/3, etc. Esto asegura que el diseño sea consistente en cualquier ancho de HP.',
        technical_params: ['size.w: full | 1/2 | 3/4 | ...', 'size.h: pixels']
      },
      {
        id: 'variantes',
        title: 'Variantes Visuales',
        content: 'Define el estilo del contenedor: "header" para cabeceras cian, "inset" para zonas hundidas, o "section" para divisores con borde lateral grueso.',
        technical_params: ['variant: header | section | panel | inset | minimal']
      }
    ]
  },
  {
    id: 'cells',
    title: 'Cells (Entidades)',
    icon: '🧬',
    content: 'Las Cells son los componentes activos (knobs, jacks, displays) registrados en el motor.',
    subsections: [
      {
        id: 'roles',
        title: 'Registry Roles (Gobernanza)',
        content: 'Cada cell DEBE tener un rol técnico (control, telemetry, mod_target, stream). Esto permite que el motor OMEGA sepa cómo tratar la señal interna del componente.',
        technical_params: ['role: control | telemetry | mod_target | stream']
      },
      {
        id: 'bindings',
        title: 'Canonical Binding',
        content: 'Vincula la cell física con un parámetro del binario WASM mediante su ID de contrato.',
        technical_params: ['bind: string']
      }
    ]
  },
  {
    id: 'senales',
    title: 'Señales e I/O',
    icon: '🔌',
    content: 'Gestión de ruteos internos y modulación.',
    subsections: [
      {
        id: 'jack_config',
        title: 'Configuración de Jacks',
        content: 'Los jacks de entrada aceptan señales CV/Audio externas. Los jacks de salida permiten monitorizar la telemetría interna.',
        technical_params: ['type: port']
      }
    ]
  }
];
