/**
 * OMEGA ERA 7.2.3 - MANUAL DE INGENIERÍA Y SDK
 * Estructura de Datos Unificada, Completa y Autoportante
 */

export interface HelpSubsection {
  id: string;
  title: string;
  content: string;
  technical_params?: string[];
  category?: string;
  code?: string;
}

export interface HelpSection {
  id: string;
  title: string;
  icon: string;
  content: string;
  category: 'user' | 'developer';
  subsections?: HelpSubsection[];
}

export const HELP_DATA: HelpSection[] = [
  // --- SECCIONES DE USUARIO ---
  {
    id: 'introduccion',
    title: 'Protocolo OMEGA 7.2.3',
    icon: '🚀',
    category: 'user',
    content: 'Bienvenido al entorno de ingeniería de OMEGA. Este editor permite construir manifiestos (.acemm) para módulos industriales con precisión sub-píxel y sincronización total con el motor WASM de la Era 7.'
  },
  {
    id: 'rack',
    title: 'El Rack (Chasis)',
    icon: '🧱',
    category: 'user',
    content: 'Define las propiedades físicas y estéticas del panel frontal del módulo.',
    subsections: [
      {
        id: 'dimensiones',
        title: 'Dimensiones y HP',
        content: 'El ancho se mide en HP (Horizontal Pitch). En OMEGA, 1 HP equivale exactamente a 15 píxeles reales. El alto estándar es 3U (420px) o 1U (compacto).',
        technical_params: ['hp', 'dimensions.width', 'dimensions.height']
      }
    ]
  },
  {
    id: 'layout',
    title: 'Arquitectura de Layout',
    icon: '📐',
    category: 'user',
    content: 'Define la estructura organizativa del módulo mediante contenedores declarativos.',
    subsections: [
      {
        id: 'contenedores',
        title: 'Layout Containers',
        content: 'Los contenedores son marcos arquitectónicos con posición y tamaño fijos.',
        technical_params: ['ui.layout.containers[]', 'container_id']
      },
      {
        id: 'planos',
        title: 'Container Authority',
        content: 'Jerarquía: Rack > Contenedor > Cell. El Tab definido en el contenedor TIENE PRIORIDAD sobre el del elemento.',
        technical_params: ['tab: MAIN | FX | EDIT | MIDI | MOD']
      },
      {
        id: 'integrity',
        title: 'Firmware Integrity (SHA-256)',
        content: 'El hash del manifiesto debe coincidir exactamente con el del binario .wasm para ser validado.',
        category: 'professional'
      }
    ]
  },
  {
    id: 'cells',
    title: 'Cells (Entidades)',
    icon: '🧬',
    category: 'user',
    content: 'Componentes activos registrados en el motor.',
    subsections: [
      {
        id: 'roles',
        title: 'Registry Roles (Gobernanza)',
        content: 'Cada cell DEBE tener un rol técnico (control, telemetry, mod_target, stream).',
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
    id: 'ui_components',
    title: 'Catálogo de Componentes',
    icon: '🎛️',
    category: 'user',
    content: 'Lista de componentes industriales estándar reconocidos por el motor de la Era 7:',
    subsections: [
      {
        id: 'knob_desc',
        title: 'Knob / Slider',
        content: 'Controles giratorios o deslizantes para mapeo continuo (0.0 a 1.0).',
        technical_params: ['component: knob | slider-v | slider-h']
      },
      {
        id: 'display_desc',
        title: 'Display (Stepper)',
        content: 'Pantalla digital con botones +/- integrados para ajustes de precisión.',
        technical_params: ['component: display']
      },
      {
        id: 'io_desc',
        title: 'Port (Jack)',
        content: 'Representación física de un punto de parcheo (Audio/CV/MIDI).',
        technical_params: ['component: port']
      }
    ]
  },
  {
    id: 'binary_truth',
    title: 'Binary Truth (Descubrimiento)',
    icon: '💎',
    category: 'developer',
    content: 'En la Era 7, el binario WASM es la Fuente de Verdad (SOT).',
    subsections: [
      {
        id: 'discovery_flow',
        title: 'Flujo de Descubrimiento',
        content: '1. El Host busca el archivo .acemm.\\n2. Si no existe, invoca omega_get_contract() del .wasm.\\n3. El sistema autogenera el contrato técnico basándose en el binario.',
        category: 'professional'
      }
    ]
  },
  // --- SECCIONES DE DESARROLLADOR (SDK COMPLETO Y COPIABLE) ---
  {
    id: 'sdk_core',
    title: 'WASM ABI & Core',
    icon: '⚙️',
    category: 'developer',
    content: 'Especificaciones técnicas para el desarrollo de binarios DSP compatibles con OMEGA.',
    subsections: [
      {
        id: 'abi_handshake',
        title: 'The Handshake (Exports)',
        content: 'El binario es la **Fuente de Verdad**. Debes exportar estas funciones para que OMEGA pueda instanciar tu código:',
        technical_params: [
          'omega_get_contract(): Retorna el JSON del contrato.',
          'omega_init(float sampleRate): Inicialización de buffers.',
          'omega_process(float* buffer, int len): Procesamiento DSP.',
          'omega_on_param(int id, float val): Cambio de parámetro.',
          'omega_on_midi(byte s, byte d1, byte d2): Eventos MIDI.'
        ]
      },
      {
        id: 'abi_imports',
        title: 'Host Imports (Namespace: env)',
        content: 'Funciones que tu plugin puede importar desde el host OMEGA para interactuar con el motor:',
        technical_params: [
          'omega_publish_telemetry(float): Envío de datos a la UI.',
          'omega_set_voice_freq(float): Control de pitch nativo.',
          'omega_set_voice_gate(float): Control de envolvente ADSR.',
          'omega_log(const char*): Depuración en consola host.'
        ]
      },
      {
        id: 'abi_specs',
        title: 'Especificaciones Industriales',
        content: 'Límites recomendados para garantizar la estabilidad en tiempo real:',
        technical_params: [
          'Stack Size: 128 KB',
          'Heap Size: 64 KB',
          'Standard: OMEGA-ABI-7.0-INDUSTRIAL'
        ]
      },
      {
        id: 'build_pipeline',
        title: 'Build System (Clang/LLVM)',
        content: 'El motor utiliza clang++ (LLVM 18.1.8) para generar binarios ultra-ligeros optimizados para DSP. El comando exacto es:',
        code: `clang++ --target=wasm32 -O3 -nostdlib \\
  -fno-exceptions -fno-rtti \\
  -Wl,--no-entry -Wl,--export-all -Wl,--allow-undefined \\
  -o plugin.wasm source.cpp`
      },
      {
        id: 'build_flags',
        title: 'Desglose de Flags',
        content: '• -O3: Optimización máxima para audio en tiempo real.\\n• -nostdlib: Evita la librería estándar para mantener el binario ligero.\\n• -Wl,--export-all: Garantiza que omega_process y omega_on_midi sean visibles por el host.'
      },
      {
        id: 'build_contract',
        title: 'Extracción del Contrato',
        content: 'Tras la compilación, se debe extraer el contrato técnico llamando a omega_get_contract():',
        code: `node extract_contract.js modulo.wasm`
      },
      {
        id: 'build_bat',
        title: '🚀 Cómo lanzarlo',
        content: 'Simplemente ejecuta el script automatizado desde la raíz de ABDOmega:',
        code: `.\\scripts\\build_plugins.bat`
      },
      {
        id: 'build_aot',
        title: 'Optimización AOT (Pro)',
        content: 'Si tienes wamrc instalado, el sistema generará código máquina nativo:',
        code: `wamrc --target=x86_64 --format=aot -o module.aot module.wasm`
      },
      {
        id: 'build_script_ref',
        title: 'Referencia del Script (.bat)',
        content: 'Contenido íntegro del script de automatización para tu entorno local:',
        code: `@echo off
setlocal enabledelayedexpansion
echo [OMEGA] Building Plugins...

set "SDK_DIR=%~dp0.."
set "PLUGIN_SRC=%SDK_DIR%\\src\\WasmPlugins"
set "PLUGIN_OUT=%SDK_DIR%\\Resources\\modules"

set "CLANG_CMD=clang++"
:: [Lógica de descubrimiento de Clang/LLVM omitida para brevedad en este ejemplo, usa el estándar del sistema]

for %%f in ("%PLUGIN_SRC%\\*.c" "%PLUGIN_SRC%\\*.cpp") do (
    set "FILENAME=%%~nf"
    echo [OMEGA] Compiling !FILENAME!...
    
    clang++ --target=wasm32 -O3 -nostdlib -fno-exceptions -fno-rtti \\
    -Wl,--no-entry -Wl,--export-all -Wl,--allow-undefined \\
    -o "%PLUGIN_OUT%\\!FILENAME!\\!FILENAME!.wasm" "%%f"

    if exist "%PLUGIN_OUT%\\!FILENAME!\\!FILENAME!.wasm" (
        echo [SUCCESS] !FILENAME! built.
        node "%SDK_DIR%\\scripts\\extract_contract.js" "%PLUGIN_OUT%\\!FILENAME!\\!FILENAME!.wasm"
    )
)
echo [OMEGA] Build Process Finished.`
      }
    ]
  },
  {
    id: 'sdk_files',
    title: 'Archivos del Starter Kit',
    icon: '📦',
    category: 'developer',
    content: 'Código fuente íntegro para el inicio rápido de nuevos módulos.',
    subsections: [
      {
        id: 'sdk_header',
        title: 'omega_sdk.h (Header)',
        content: 'Define este archivo en tu proyecto para acceder a las funciones del host:',
        code: `#pragma once
extern "C" {
    extern float omega_get_sample_rate();
    extern int omega_get_block_size();
    extern void omega_publish_telemetry(float val);
    extern void omega_log(const char* msg);
    
    // Exports obligatorios
    const char* omega_get_contract();
    void omega_process(float* buffer, int length);
    void omega_set_param(int paramId, float value);
}`
      },
      {
        id: 'sdk_cpp',
        title: 'minimal_osc.cpp (Código)',
        content: 'Implementación de un oscilador Sawtooth básico con telemetría:',
        code: `#include "omega_sdk.h"
#include <math.h>

float phase = 0.0f;
float frequency = 440.0f;
float gain = 0.5f;

extern "C" {
    const char* omega_get_contract() {
        return "{\\"id\\":\\"min_osc\\",\\"parameters\\":[{\\"id\\":\\"freq\\",\\"role\\":\\"control\\"},{\\"id\\":\\"gain\\",\\"role\\":\\"control\\"}]}";
    }
    void omega_set_param(int id, float val) {
        if (id == 0) frequency = 20.0f + (val * 1000.0f);
        if (id == 1) gain = val;
    }
    void omega_process(float* buffer, int len) {
        float phaseDelta = frequency / omega_get_sample_rate();
        for (int i=0; i<len; ++i) {
            buffer[i] = (phase * 2.0f - 1.0f) * gain;
            phase += phaseDelta;
            if (phase >= 1.0f) phase -= 1.0f;
        }
    }
}`
      },
      {
        id: 'sdk_acemm',
        title: 'minimal_osc.acemm (Manifiesto)',
        content: 'Estructura de panel (4HP) para el oscilador de ejemplo:',
        code: `schemaVersion: '7.2.3'
id: minimal_osc
metadata:
  name: MINIMAL SAW
  family: oscillator
  rack: { hp: 4 }
ui:
  dimensions: { width: 60, height: 420 }
  skin: industrial
  layout:
    containers:
      - id: MAIN_PANEL
        label: Engine
        pos: { x: 0, y: 40 }
        size: { w: "full", h: 200 }
        variant: panel
  controls:
    - id: k_freq
      bind: freq
      pos: { x: 30, y: 80 }
      presentation: { container: MAIN_PANEL, component: knob }
resources:
  wasm: minimal_osc.wasm`
      }
    ]
  }
];
