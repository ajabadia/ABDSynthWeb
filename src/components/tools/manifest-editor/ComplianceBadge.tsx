'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Award } from 'lucide-react';
import { AuditResult } from '@/services/auditService';

interface ComplianceBadgeProps {
  audit: AuditResult;
  onClick?: () => void;
}

export function ComplianceBadge({ audit, onClick }: ComplianceBadgeProps) {
  const { score, status } = audit;
  
  const getStatusConfig = () => {
    if (status === 'CRITICAL_FAIL') return {
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/40',
      label: 'GOVERNANCE FAIL',
      pulse: true
    };
    if (status === 'DRAFT') return {
      icon: <Shield className="w-4 h-4" />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      label: 'DRAFT MODE',
      pulse: false
    };
    return {
      icon: <Award className="w-4 h-4" />,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/40',
      label: 'CERTIFIED ERA 7',
      pulse: false
    };
  };

  const config = getStatusConfig();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-1.5 rounded-sm border ${config.bg} ${config.border} transition-all group relative overflow-hidden`}
    >
      {config.pulse && (
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-red-500/20 pointer-events-none"
        />
      )}
      
      <div className={`${config.color}`}>
        {config.icon}
      </div>

      <div className="flex flex-col items-start leading-none">
        <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${config.color}`}>
          {config.label}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="h-1 w-16 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              className={`h-full ${score > 80 ? 'bg-primary' : score > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
            />
          </div>
          <span className="text-[9px] font-mono font-bold wb-text">
            {score}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default ComplianceBadge;
