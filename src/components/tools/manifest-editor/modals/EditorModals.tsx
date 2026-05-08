'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import IngestionModal from './IngestionModal';
import HelpModal from './HelpModal';
import AuditModal from './AuditModal';
import MockupModal from './MockupModal';
import AboutModal from './AboutModal';
import GlobalGovernanceModal from './GlobalGovernanceModal';
import UniversalCellEditorModal from './UniversalCellEditorModal';
import UniversalCellLibraryModal from './UniversalCellLibraryModal';
import { OMEGA_Manifest } from '@/types/manifest';
import { AuditResult } from '@/services/auditService';
import { useModuleMetrics } from '@/hooks/manifest-editor/useModuleMetrics';

interface EditorModalsProps {
  manifest: OMEGA_Manifest;
  pendingFiles: File[] | null;
  setPendingFiles: (files: File[] | null) => void;
  handleBulkUpload: (files: File[]) => void;
  helpState: { isOpen: boolean; sectionId?: string };
  closeHelp: () => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  isAboutModalOpen: boolean;
  setIsAboutModalOpen: (open: boolean) => void;
  handleNavigateToIssue: (path: string) => void;
  auditResult: AuditResult;
  mockupOpen: boolean;
  setMockupOpen: (open: boolean) => void;
  resolveAsset?: (id: string | undefined) => string | undefined;
  onDeploy: () => void;
  isConfigModalOpen: boolean;
  setIsConfigModalOpen: (open: boolean) => void;
  onUpdateManifest: (updates: Partial<OMEGA_Manifest>) => void;
  isCellEditorOpen: boolean;
  setIsCellEditorOpen: (open: boolean) => void;
  isCellLibraryOpen?: boolean;
  setIsCellLibraryOpen?: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAddEntityFromLibrary?: (template: any) => void;
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
  isAboutModalOpen,
  setIsAboutModalOpen,
  handleNavigateToIssue,
  auditResult,
  mockupOpen,
  setMockupOpen,
  resolveAsset,
  onDeploy,
  isConfigModalOpen,
  setIsConfigModalOpen,
  onUpdateManifest,
  isCellEditorOpen,
  setIsCellEditorOpen,
  isCellLibraryOpen,
  setIsCellLibraryOpen,
  onAddEntityFromLibrary
}: EditorModalsProps) {
  const { metrics, sysReady } = useModuleMetrics(manifest);

  return (
    <>
      <GlobalGovernanceModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        manifest={manifest}
        onUpdate={onUpdateManifest}
        resolveAsset={resolveAsset || ((id) => id)}
      />
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
        audit={auditResult}
        resolveAsset={resolveAsset}
      />

      <AboutModal 
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        metrics={metrics}
        sysReady={sysReady}
        onDeploy={onDeploy}
      />

      <AnimatePresence>
        {isCellEditorOpen && (
          <UniversalCellEditorModal 
            isOpen={isCellEditorOpen}
            onClose={() => setIsCellEditorOpen(false)}
            resolveAsset={resolveAsset}
            onSave={(cell) => {
              console.log("Saving Cell to Library:", cell);
              try {
                const localLibrary = JSON.parse(localStorage.getItem('omega_cell_library') || '[]');
                localLibrary.push({
                  ...cell,
                  id: `local_${Date.now()}`,
                  isLocal: true,
                  timestamp: new Date().toISOString()
                });
                localStorage.setItem('omega_cell_library', JSON.stringify(localLibrary));
              } catch (e) {
                console.error("Failed to save to local library", e);
              }
              setIsCellEditorOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <UniversalCellLibraryModal 
        isOpen={isCellLibraryOpen || false}
        onClose={() => setIsCellLibraryOpen?.(false)}
        onSelect={(dna) => {
          onAddEntityFromLibrary?.(dna);
          setIsCellLibraryOpen?.(false);
        }}
        resolveAsset={resolveAsset}
      />
    </>
  );
}
