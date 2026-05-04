'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, ShieldAlert, ShieldX, 
  FileText, Activity, Layers, Terminal, 
  Download, ExternalLink, AlertCircle, CheckCircle2
} from 'lucide-react';
import { AuditResult, AuditService } from '../../../services/auditService';
import { OMEGA_Manifest } from '../../../types/manifest';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  audit: AuditResult;
  manifest: OMEGA_Manifest;
}

/**
 * AuditModal (v7.2.3)
 * Detailed Industrial Compliance Report for OMEGA Era 7 modules.
 */
const AuditModal = ({ isOpen, onClose, onNavigate, audit, manifest }: AuditModalProps) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    const report = AuditService.generateCertificationReport(manifest, audit);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CERTIFICATE_${manifest.id}_${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusConfig = {
    CERTIFIED: { color: 'text-[#00ff9d]', bg: 'bg-[#00ff9d]/5', border: 'border-[#00ff9d]/20', icon: ShieldCheck, label: 'CERTIFIED_READY' },
    DRAFT: { color: 'text-[#ffcc00]', bg: 'bg-[#ffcc00]/5', border: 'border-[#ffcc00]/20', icon: ShieldAlert, label: 'DRAFT_PENDING' },
    CRITICAL_FAIL: { color: 'text-[#ff3e3e]', bg: 'bg-[#ff3e3e]/5', border: 'border-[#ff3e3e]/20', icon: ShieldX, label: 'CRITICAL_FAILURE' }
  }[audit.status];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-8 bg-black/60 backdrop-blur-xl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-5xl h-full max-h-[800px] wb-surface border wb-outline rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative transition-colors duration-500"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between p-8 border-b wb-outline bg-black/5">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-xs border ${statusConfig.border} ${statusConfig.bg}`}>
                <statusConfig.icon className={`w-8 h-8 ${statusConfig.color}`} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-[0.3em] text-foreground">Inspection Report</h2>
                <div className="flex items-center gap-3 text-[9px] font-mono font-black uppercase tracking-widest wb-text-muted">
                  <span className={statusConfig.color}>{statusConfig.label}</span>
                  <span>//</span>
                  <span>Module ID: {manifest.id}</span>
                  <span>//</span>
                  <span>Spec v7.2.3</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-xs text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary text-white transition-all group"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Export Certification
              </button>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex gap-12">
            {/* LEFT: SUMMARY & SCORE */}
            <div className="w-80 shrink-0 space-y-8">
              {/* SCORE GAUGE */}
              <div className="p-8 bg-black/40 border border-white/5 rounded-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 text-[8px] font-black text-white/10 uppercase tracking-widest">Quality Score</div>
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <span className={`text-6xl font-black font-mono ${statusConfig.color}`}>{audit.score}</span>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${audit.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${statusConfig.color.replace('text-', 'bg-')}`} 
                    />
                  </div>
                </div>
                <p className="text-[7px] text-center font-bold wb-text-muted uppercase tracking-[0.2em] leading-relaxed">
                  Calculated based on 47 weighted engineering parameters including spatial density and governance roles.
                </p>
              </div>

              {/* COMPLIANCE MATRIX */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-widest wb-text-muted px-1">Compliance Matrix</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Governance', val: audit.checks.governance, icon: ShieldCheck },
                    { label: 'Integrity', val: audit.checks.integrity, icon: Layers },
                    { label: 'Technical', val: audit.checks.technical, icon: Terminal },
                    { label: 'Aesthetic', val: audit.checks.aesthetic, icon: Activity }
                  ].map(c => (
                    <div key={c.label} className={`p-4 border rounded-xs flex flex-col gap-3 transition-all ${c.val ? 'border-[#00ff9d]/20 bg-[#00ff9d]/5 text-[#00ff9d]' : 'border-red-500/20 bg-red-500/5 text-red-500'}`}>
                       <div className="flex justify-between items-start">
                         <c.icon className="w-4 h-4 opacity-60" />
                         {c.val ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                       </div>
                       <span className="text-[9px] font-black uppercase tracking-widest">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* METRICS */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xs space-y-4">
                 <div className="space-y-1">
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Metadata Density</span>
                    <div className="flex justify-between text-[10px] font-mono font-black wb-text">
                      <span>{manifest.metadata?.name || 'NOT_SET'}</span>
                      <span className="text-primary">{manifest.metadata?.rack?.hp || 12}HP</span>
                    </div>
                 </div>
                 <div className="h-px bg-white/5" />
                 <div className="space-y-1">
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">WASM Runtime Sync</span>
                    <div className="flex justify-between text-[10px] font-mono font-black wb-text">
                      <span>{audit.isHashMatched ? 'COHERENT' : 'DEGRADED'}</span>
                      <span className={audit.isHashMatched ? 'text-[#00ff9d]' : 'text-red-500'}>
                        {audit.fingerprint?.slice(0, 8) || 'NONE'}
                      </span>
                    </div>
                 </div>
              </div>
            </div>

            {/* RIGHT: DETAILED LOGS */}
            <div className="flex-1 space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">Diagnostic Inspection Log</h3>
                </div>
                <span className="text-[10px] font-mono wb-text-muted">{audit.issues.length} Issues Detected</span>
              </div>

              <div className="space-y-4">
                {audit.issues.length === 0 ? (
                  <div className="p-12 border border-[#00ff9d]/10 bg-[#00ff9d]/2 rounded-sm flex flex-col items-center gap-4">
                    <CheckCircle2 className="w-12 h-12 text-[#00ff9d] opacity-40" />
                    <div className="text-center">
                      <p className="text-[#00ff9d] text-sm font-black uppercase tracking-widest">System Certified</p>
                      <p className="text-white/30 text-[10px] uppercase font-bold mt-1">All engineering checks passed with Aseptic Standard V7.2.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {audit.issues.map((issue, idx) => {
                      const isCritical = issue.severity === 'error' || issue.keyword === 'era7_governance' || issue.keyword === 'era7_integrity';
                      return (
                        <button 
                          key={idx} 
                          onClick={() => {
                            onNavigate(issue.path);
                            onClose();
                          }}
                          className={`w-full text-left p-4 border rounded-sm flex gap-4 group transition-all hover:bg-white/[0.05] active:scale-[0.99] ${isCritical ? 'border-red-500/20 bg-red-500/2' : 'border-white/5 bg-black/40'}`}
                        >
                          <div className={`mt-1 shrink-0 ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                             {isCritical ? <ShieldX className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isCritical ? 'text-red-500' : 'text-amber-500'}`}>
                                {issue.keyword.replace('era7_', '').toUpperCase()}
                              </span>
                              <span className="text-[8px] font-mono wb-text-muted bg-white/5 px-2 py-0.5 rounded-full">{issue.path}</span>
                            </div>
                            <p className="text-xs text-white/80 font-medium leading-relaxed">{issue.message}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* INDUSTRIAL GUIDELINES */}
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Aseptic Guidelines v7.2</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <p className="text-[9px] font-bold wb-text leading-relaxed italic">
                        "La gobernanza ERA 4 exige que cada componente tenga un Registry Role explícito vinculado a una dirección de memoria del contrato WASM."
                      </p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[9px] font-bold wb-text leading-relaxed italic">
                        "La integridad espacial requiere que todos los elementos interactivos residan al menos a 12px de los bordes del rack para garantizar la paridad física."
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/5">
             <div className="flex items-center gap-4 text-[8px] font-mono text-white/10 uppercase tracking-[0.2em]">
               <span>Fingerprint: {audit.fingerprint || 'NOT_CALCULATED'}</span>
               <span className="opacity-20">//</span>
               <span>Audit Engine v7.2.3</span>
             </div>
             <button 
               onClick={onClose}
               className="px-8 py-2 bg-white/5 border border-white/10 hover:bg-white/10 wb-text text-[10px] font-black uppercase tracking-widest transition-all rounded-xs"
             >
               Dismiss Inspection
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuditModal;
