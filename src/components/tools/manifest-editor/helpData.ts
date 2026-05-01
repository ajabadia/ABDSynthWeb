/**
 * OMEGA ERA 7.1 - MANUAL DE INGENIERÍA (BASE DE DATOS)
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
  }[];
}

export const HELP_DATA: HelpSection[] = [
  {
    id: 'introduccion',
    title: 'Protocolo OMEGA 7.1',
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
    id: 'cells',
    title: 'Cells (Entidades)',
    icon: '🧬',
    content: 'Las Cells son los componentes activos (knobs, jacks, displays) registrados en el motor.',
    subsections: [
      {
        id: 'roles',
        title: 'Roles del Registry',
        content: 'Vital para la comunicación con C++. Define si el componente es de entrada (control), feedback visual (telemetry) o señal de audio (stream).',
        technical_params: ['role: control | telemetry | stream | mod_target']
      },
      {
        id: 'tabs',
        title: 'Planos (Tabs)',
        content: 'Organiza la interfaz en capas funcionales. MAIN para síntesis, FX para efectos, EDIT para setup, MIDI para ruteo y MOD para modulación.',
        technical_params: ['presentation.tab: MAIN | FX | EDIT | MIDI | MOD']
      }
    ]
  },
  {
    id: 'logic',
    title: 'Lógica y Contratos',
    icon: '🔌',
    content: 'Configuración de la comunicación entre la UI y el código técnico (WASM).',
    subsections: [
      {
        id: 'binding',
        title: 'Canonical Binding',
        content: 'Vincula este elemento visual con un parámetro interno del código WASM. El ID debe coincidir con el exportado por el binario.',
        technical_params: ['bind: string']
      },
      {
        id: 'precision',
        title: 'Precisión y Normalización',
        content: 'Determina cuántos decimales se usan para los cálculos y cómo se formatea el valor para el usuario.',
        technical_params: ['precision', 'ui_precision']
      }
    ]
  },
  {
    id: 'console',
    title: 'Consola y Auditoría',
    icon: '💻',
    content: 'Muestra logs en tiempo real sobre la salud del módulo y errores de validación.',
    subsections: [
      {
        id: 'audit',
        title: 'Auditoría UI',
        content: 'Al cargar un manifiesto, el sistema analiza si faltan bindings o si hay componentes huérfanos sin rol asignado.'
      }
    ]
  }
];
