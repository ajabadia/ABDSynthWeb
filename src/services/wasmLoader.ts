/**
 * OMEGA WASM Loader Service
 * Handles instantiation and contract extraction from self-descriptive WASM modules.
 */

export interface OmegaContract {
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
}

export class WasmLoaderService {
  /**
   * Loads a WASM file and attempts to call 'omega_get_contract'
   */
  static async extractContract(file: File): Promise<OmegaContract> {
    const arrayBuffer = await file.arrayBuffer();
    
    // Create a robust import object using a Proxy to catch all OMEGA host functions
    const hostFunctions = {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
      abort: () => console.warn('[WASM] Abort called'),
      // Standard OMEGA host functions that might be called during static init
      omega_log: (ptr: number) => console.log('[WASM LOG] Pointer:', ptr),
    };

    const importObject = {
      env: new Proxy(hostFunctions, {
        get(target: any, prop: string) {
          if (prop in target) return target[prop];
          
          // Return a dummy callable for any requested OMEGA host function (omega_...)
          if (prop.startsWith('omega_')) {
            console.debug(`[WASM-LINK] Providing dummy for missing host function: ${prop}`);
            return () => 0; 
          }
          
          return undefined;
        }
      })
    };

    try {
      const { instance } = await WebAssembly.instantiate(arrayBuffer, importObject);
      const exports = instance.exports as any;

      if (!exports.omega_get_contract) {
        throw new Error("WASM module is not OMEGA-compliant (missing 'omega_get_contract' export).");
      }

      // Call the function to get the pointer to the JSON string
      const ptr = exports.omega_get_contract();
      
      // Read the string from WASM memory
      const memory = exports.memory || hostFunctions.memory;
      const jsonString = this.readStringFromMemory(memory, ptr);

      return JSON.parse(jsonString) as OmegaContract;
    } catch (err: any) {
      console.error("Failed to extract OMEGA contract:", err);
      throw new Error(`LinkError: Binary requires host functions or is corrupted. Details: ${err.message}`);
    }
  }

  private static readStringFromMemory(memory: WebAssembly.Memory, ptr: number): string {
    const view = new Uint8Array(memory.buffer);
    let end = ptr;
    while (view[end] !== 0 && end < view.length) end++; // Null-terminated string
    
    const decoder = new TextDecoder();
    return decoder.decode(view.slice(ptr, end));
  }
}
