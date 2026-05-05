'use client';

import React from 'react';
import { Terminal } from 'lucide-react';

export default function AuditGuidelines() {
  return (
    <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm space-y-4">
      <div className="flex items-center gap-3">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Aseptic Guidelines v7.2</span>
      </div>
      <div className="grid grid-cols-2 gap-6">
         <div className="space-y-2">
            <p className="text-[9px] font-bold wb-text leading-relaxed italic">
              &quot;La gobernanza ERA 4 exige que cada componente tenga un Registry Role explícito vinculado a una dirección de memoria del contrato WASM.&quot;
            </p>
         </div>
         <div className="space-y-2">
            <p className="text-[9px] font-bold wb-text leading-relaxed italic">
              &quot;La integridad espacial requiere que todos los elementos interactivos residan al menos a 12px de los bordes del rack para garantizar la paridad física.&quot;
            </p>
         </div>
      </div>
    </div>
  );
}
