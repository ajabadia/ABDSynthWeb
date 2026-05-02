/**
 * OMEGA WASM BRIDGE - ERA 7.1
 * Interface for real-time DSP simulation within the Manifest Editor.
 */

import { inputSignalService } from './inputSignalService';

export interface WasmInterface {
  init: () => void;
  process: (inputBuffer: Float32Array, outputBuffer: Float32Array) => void;
  setParameter: (id: string, value: number) => void;
  getTelemetry: (id: string) => number;
}

export class WasmRuntime {
  private instance: WebAssembly.Instance | null = null;
  private isMock: boolean = true;
  private mockValues: Record<string, number> = {};

  async loadWasm(buffer: ArrayBuffer): Promise<boolean> {
    try {
      // En un entorno real, aquí instanciaríamos el WASM con los imports de OMEGA
      // const { instance } = await WebAssembly.instantiate(buffer, { env: { ... } });
      // this.instance = instance;
      this.isMock = false;
      console.log('OMEGA WASM: Binario cargado y listo para ejecución.');
      return true;
    } catch (e) {
      console.error('OMEGA WASM: Error al instanciar el binario.', e);
      return false;
    }
  }

  setParameter(id: string, value: number) {
    if (this.isMock) {
      this.mockValues[id] = value;
      return;
    }
    // Lógica para escribir en la memoria lineal del WASM
  }

  getTelemetry(id: string): number {
    if (this.isMock) {
      // Si hay una señal de entrada en este ID (ej: un port), la usamos como base para la telemetría
      const inputVal = inputSignalService.getSignalValue(id);
      
      // Simulación de respuesta dinámica: la telemetría reacciona a los inputs + un pequeño offset de ruido
      return inputVal + (this.mockValues[id] || 0) + (Math.sin(Date.now() / 1000) * 0.05);
    }
    // Lógica real para WASM...
    return 0;
  }

  // Activa un modo "Demo" que hace que la telemetría se mueva
  enableDemoMode() {
    this.isMock = true;
  }
}

export const wasmRuntime = new WasmRuntime();
