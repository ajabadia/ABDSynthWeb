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

  // --- SECCIONES DE DESARROLLADOR (SDK COMPLETO Y COPIABLE) ---
  {
    id: 'sdk_core',
    title: 'WASM ABI & Core',
    icon: '⚙️',
    category: 'developer',
    content: 'Especificaciones técnicas para el desarrollo de binarios DSP compatibles con OMEGA.',
    subsections: [
      {
        id: 'abi_exports',
        title: 'Funciones de Exportación',
        content: 'Implementa estas funciones usando extern "C" para que el Host OMEGA pueda cargar tu código:',
        technical_params: ['omega_get_contract', 'omega_process', 'omega_set_param', 'omega_on_midi']
      },
      {
        id: 'build_emcc',
        title: 'Pipeline de Compilación',
        content: 'Comando recomendado para compilar módulos C++ a WASM usando Emscripten:',
        code: `emcc module.cpp -o module.wasm \\
  -s EXPORTED_FUNCTIONS="['_omega_get_contract', '_omega_process', '_omega_set_param', '_omega_on_midi']" \\
  -s ERROR_ON_UNDEFINED_SYMBOLS=0 \\
  --no-entry`
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
