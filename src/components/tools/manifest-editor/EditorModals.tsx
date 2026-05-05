'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import IngestionModal from './IngestionModal';
import HelpModal from './HelpModal';
import AuditModal from './AuditModal';
import MockupModal from './MockupModal';
import { OMEGA_Manifest } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';

interface EditorModalsProps {
  manifest: OMEGA_Manifest;
  pendingFiles: File[] | null;
  setPendingFiles: (files: File[] | null) => void;
  handleBulkUpload: (files: File[]) => void;
  helpState: { isOpen: boolean; sectionId?: string };
  closeHelp: () => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  handleNavigateToIssue: (path: string) => void;
  auditResult: AuditResult;
  mockupOpen: boolean;
  setMockupOpen: (open: boolean) => void;
}

export default function EditorModals({
  manifest,
  pendingFiles,
  setPendingFiles,
  handleBulkUpload,
  helpState,
  closeHelp,
  isAuditModalOpen,
  setIsAuditModalOpen,
  handleNavigateToIssue,
  auditResult,
  mockupOpen,
  setMockupOpen
}: EditorModalsProps) {
  return (
    <>
      <AnimatePresence>
        {pendingFiles && (
          <IngestionModal 
            files={pendingFiles} 
            onConfirm={(selected) => {
              handleBulkUpload(selected);
              setPendingFiles(null);
            }}
            onCancel={() => setPendingFiles(null)}
          />
        )}
      </AnimatePresence>

      <HelpModal 
        isOpen={helpState.isOpen} 
        initialSectionId={helpState.sectionId} 
        onClose={closeHelp} 
      />

      <AuditModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        onNavigate={handleNavigateToIssue}
        audit={auditResult} 
        manifest={manifest} 
      />

      <MockupModal 
        isOpen={mockupOpen} 
        onClose={() => setMockupOpen(false)} 
        manifest={manifest} 
      />
    </>
  );
}
