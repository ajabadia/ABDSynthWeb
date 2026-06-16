import { junio601 } from "./junio-601";
import { junioSix } from "./junio-six";
import { junio06 } from "./junio-06";
import { junioSuperSix } from "./junio-supersix";
import { omega } from "./omega";
import { neuronik } from "./neuronik";
import type { Instrument } from "./types";

export * from "./types";
export { junio601, junioSix, junio06, junioSuperSix, omega, neuronik };

export const instruments: Instrument[] = [
  junio601,
  junioSix,
  junio06,
  junioSuperSix,
  omega,
  neuronik
];

