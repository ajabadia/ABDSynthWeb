'use client';

import React from 'react';
import { 
  FileText, ShieldX, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { AuditResult } from '@/services/auditService';

interface AuditIssuesListProps {
  audit: AuditResult;
  onNavigate: (path: string) => void;
  onClose: () => void;
}

export default function AuditIssuesList({ audit, onNavigate, onClose }: AuditIssuesListProps) {
  return (
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
    </div>
  );
}
