'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ChevronDown, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditResult, AuditService } from '../../../services/auditService';
import { OMEGA_Manifest } from '../../../types/manifest';

interface ComplianceBadgeProps {
  audit: AuditResult;
  manifest: OMEGA_Manifest;
  onOpenAudit?: () => void;
}

export default function ComplianceBadge({ audit, manifest, onOpenAudit }: ComplianceBadgeProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  const handleDownloadReport = () => {
    const report = AuditService.generateCertificationReport(manifest, audit);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CERTIFICATE_${manifest.id}_${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusConfig = () => {
    switch (audit.status) {
      case 'CERTIFIED':
        return {
          icon: ShieldCheck,
          label: 'SYS_READY',
          color: 'text-[#00ff9d] border-[#00ff9d]/30 bg-[#00ff9d]/5',
          glow: 'shadow-[0_0_15px_rgba(0,255,157,0.2)]'
        };
      case 'CRITICAL_FAIL':
        return {
          icon: ShieldX,
          label: 'GOV_FAIL',
          color: 'text-[#ff3e3e] border-[#ff3e3e]/30 bg-[#ff3e3e]/5',
          glow: 'shadow-[0_0_15px_rgba(255,62,62,0.2)]'
        };
      default:
        return {
          icon: ShieldAlert,
          label: 'DRAFT_MODE',
          color: 'text-[#ffcc00] border-[#ffcc00]/30 bg-[#ffcc00]/5',
          glow: 'shadow-[0_0_15px_rgba(255,204,0,0.2)]'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-3 px-3 py-1.5 border rounded-full transition-all duration-500 ${config.color} ${config.glow} group hover:border-white/20`}
      >
        <div className="relative">
           <Icon className="w-3.5 h-3.5" />
           {audit.status === 'CERTIFIED' && (
             <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute inset-0 bg-current rounded-full blur-xs -z-10"
             />
           )}
        </div>
        <div className="flex flex-col items-start leading-none gap-0.5">
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">{config.label}</span>
          <span className="text-[6px] font-bold opacity-40 uppercase tracking-tighter">Compliance Engine v7.2.3</span>
        </div>
        <div className="w-px h-4 bg-current opacity-20 mx-1" />
        <div className="flex flex-col items-center leading-none">
           <span className="text-[9px] font-black">{audit.score}%</span>
           <span className="text-[5px] font-bold opacity-30 uppercase">Score</span>
        </div>
        <ChevronDown className={`w-3 h-3 opacity-30 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-72 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-4 space-y-4">
               <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-foreground/60">Audit Diagnostics</span>
                  </div>
                  <span className={`text-[7px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                    {audit.status}
                  </span>
               </div>

               <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'GOV', val: audit.checks.governance },
                    { label: 'INT', val: audit.checks.integrity },
                    { label: 'TECH', val: audit.checks.technical },
                    { label: 'STYLE', val: audit.checks.aesthetic },
                  ].map(c => (
                    <div key={c.label} className={`p-1.5 border rounded-xs flex flex-col items-center gap-1 ${c.val ? 'border-[#00ff9d]/20 bg-[#00ff9d]/5 text-[#00ff9d]' : 'border-red-500/20 bg-red-500/5 text-red-500'}`}>
                       <span className="text-[5px] font-black uppercase">{c.label}</span>
                       <div className="w-1 h-1 rounded-full bg-current" />
                    </div>
                  ))}
               </div>

               <div className="space-y-2">
                  <div className="text-[7px] font-black uppercase text-foreground/20 tracking-widest px-1">Detailed Log</div>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {audit.details.length === 0 ? (
                      <div className="text-[8px] font-mono text-[#00ff9d] opacity-60 px-2 py-1 bg-[#00ff9d]/5 rounded-xs">
                        &gt; NO ISSUES DETECTED. SYSTEM READY.
                      </div>
                    ) : (
                      audit.details.map((d, i) => (
                        <div key={i} className="text-[8px] font-mono text-foreground/50 border-l-2 border-primary/20 pl-2 py-1 bg-white/5">
                          {d}
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {audit.fingerprint && (
                  <div className={`p-2 bg-black/40 border rounded-xs space-y-1 ${audit.isHashMatched ? 'border-[#00ff9d]/40 shadow-[0_0_10px_rgba(0,255,157,0.1)]' : 'border-white/5'}`}>
                    <div className="flex justify-between items-center">
                      <div className="text-[6px] font-black uppercase text-primary/40 tracking-[0.2em]">Firmware Fingerprint (SHA-256)</div>
                      {audit.isHashMatched && (
                        <div className="flex items-center gap-1 text-[#00ff9d]">
                          <ShieldCheck className="w-2 h-2" />
                          <span className="text-[5px] font-black uppercase tracking-tighter">Binary Sync</span>
                        </div>
                      )}
                    </div>
                    <div className={`text-[7px] font-mono break-all leading-tight select-all cursor-copy font-bold ${audit.isHashMatched ? 'text-[#00ff9d]' : 'text-primary/60'}`} title="Click to copy">
                      {audit.fingerprint}
                    </div>
                  </div>
               )}

                <button 
                  onClick={onOpenAudit}
                  className="w-full py-2.5 bg-[#00ff9d] text-black hover:bg-[#00ff9d]/90 text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-xs shadow-[0_0_20px_rgba(0,255,157,0.2)]"
                >
                   Open Industrial Inspection Sheet
                </button>

                <button 
                  onClick={handleDownloadReport}
                  className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 text-[8px] font-black uppercase tracking-[0.2em] transition-all rounded-xs"
                >
                   Export Markdown Certificate
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
