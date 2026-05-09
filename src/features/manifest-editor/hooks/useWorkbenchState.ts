'use client';

import { useState, useCallback } from 'react';
import { OMEGA_Manifest } from '@/omega-ui-core/types/manifest';

export type SelectionRef = 
  | { source: 'legacy'; id: string }
  | { source: 'uca'; id: string; path?: string[] };

export const useWorkbenchState = (manifest: OMEGA_Manifest) => {
  const [viewMode, setViewMode] = useState<'orbital' | 'rack' | 'source'>('orbital');
  const [selectionRef, setSelectionRef] = useState<SelectionRef | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showModGrid, setShowModGrid] = useState(false);
  const [helpState, setHelpState] = useState<{ isOpen: boolean; sectionId?: string }>({ isOpen: false });
  const [mockupOpen, setMockupOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCellEditorOpen, setIsCellEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(manifest.ui?.layout?.activeTab || 'MAIN');
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>('dark');
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);

  const openHelp = useCallback((sectionId?: string) => {
    setHelpState({ isOpen: true, sectionId });
  }, []);

  const closeHelp = useCallback(() => {
    setHelpState({ isOpen: false });
  }, []);

  return {
    viewMode, setViewMode,
    selectionRef, setSelectionRef,
    showLogs, setShowLogs,
    isLiveMode, setIsLiveMode,
    showModGrid, setShowModGrid,
    helpState, openHelp, closeHelp,
    mockupOpen, setMockupOpen,
    isAuditModalOpen, setIsAuditModalOpen,
    isAboutModalOpen, setIsAboutModalOpen,
    isConfigModalOpen, setIsConfigModalOpen,
    isCellEditorOpen, setIsCellEditorOpen,
    activeTab, setActiveTab,
    uiTheme, setUiTheme,
    pendingFiles, setPendingFiles
  };
};
