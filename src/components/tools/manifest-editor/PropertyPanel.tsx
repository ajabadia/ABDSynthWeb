'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint, Settings, Palette, Paperclip, Shield, Package } from 'lucide-react';
import IdentitySection from './inspector/IdentitySection';
import LogicSection from './inspector/LogicSection';
import AestheticSection from './inspector/AestheticSection';
import AttachmentsSection from './inspector/AttachmentsSection';
import EngineeringSection from './inspector/EngineeringSection';
import CellPreview from './inspector/CellPreview';

interface ManifestEntity {
  id: string;
  label?: string;
  metadata?: any;
  presentation?: {
    component?: string;
    attachments?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

interface PropertyPanelProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  onClose: () => void;
  availableBinds?: string[];
  scale?: number;
}

export default function PropertyPanel({ item, onUpdate, onClose, availableBinds = [], scale = 1 }: PropertyPanelProps) {
  const [activeSection, setActiveSection] = React.useState<string>('identity');

  // Detect if we are editing the module itself or a specific control/jack
  const isModule = !!item.metadata;

  const sections = React.useMemo(() => (
    isModule ? [
      { id: 'identity', label: 'Identity', icon: Fingerprint, color: 'text-primary' },
    ] : [
      { id: 'identity', label: 'Identity', icon: Fingerprint, color: 'text-primary' },
      { id: 'engineering', label: 'Engineering', icon: Shield, color: 'text-accent' },
      { id: 'logic', label: 'Logic', icon: Settings, color: 'text-blue-400' },
      { id: 'aesthetic', label: 'Aesthetic', icon: Palette, color: 'text-purple-400' },
      { id: 'attachments', label: 'Attachments', icon: Paperclip, color: 'text-green-400' },
    ]
  ), [isModule]);

  // Auto-reset tab if current one disappears
  React.useEffect(() => {
    if (!sections.find(s => s.id === activeSection)) {
      setActiveSection('identity');
    }
  }, [isModule, sections, activeSection]);

  const handleFieldUpdate = (fieldUpdates: Partial<ManifestEntity>) => {
    onUpdate({ ...item, ...fieldUpdates });
  };

  return (
    <div className="h-full bg-[#0a0a0a] border-l border-outline flex flex-col shadow-2xl overflow-hidden">
      {/* HEADER */}
      <header className="p-4 border-b border-outline/20 bg-black/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center">
             {isModule ? <Package className="w-4 h-4 text-primary" /> : <Settings className="w-4 h-4 text-primary" />}
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
              {isModule ? 'Module Configuration' : 'Entity Inspector'}
            </h2>
            <p className="text-[8px] font-mono text-foreground/30 truncate max-w-[200px]">{item.id}</p>
          </div>
        </div>
        {!isModule && (
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-xs text-foreground/40 hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* CELL PREVIEW (Only for items) */}
      {!isModule && <CellPreview item={item} />}

      {/* NAVIGATION TABS */}
      <nav className="flex border-b border-outline/10 bg-black/20 p-1 shrink-0">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-1 rounded-xs transition-all ${
              activeSection === section.id 
                ? 'bg-white/5 text-foreground' 
                : 'text-foreground/30 hover:text-foreground/60 hover:bg-white/2'
            }`}
          >
            <section.icon className={`w-3.5 h-3.5 ${activeSection === section.id ? section.color : ''}`} />
            <span className="text-[7px] font-black uppercase tracking-tighter">{section.label}</span>
          </button>
        ))}
      </nav>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeSection === 'identity' && (
              <IdentitySection item={item} onUpdate={handleFieldUpdate} />
            )}

            {!isModule && (
              <>
                {activeSection === 'engineering' && (
                  <EngineeringSection item={item} onUpdate={handleFieldUpdate} />
                )}

                {activeSection === 'logic' && (
                  <LogicSection item={item} onUpdate={handleFieldUpdate} availableBinds={availableBinds} />
                )}

                {activeSection === 'aesthetic' && (
                  <AestheticSection item={item} onUpdate={handleFieldUpdate} />
                )}

                {activeSection === 'attachments' && (
                  <AttachmentsSection 
                    item={item} 
                    onUpdate={handleFieldUpdate} 
                    availableBinds={availableBinds}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER ACTION */}
      <footer className="p-4 bg-black/40 border-t border-outline/20 shrink-0">
        <div className="flex items-center justify-between text-[8px] font-mono text-foreground/20">
          <span>{isModule ? 'Global Context' : 'Local Context'}</span>
          <span>SYS_ID: {item.id.slice(0, 8)}</span>
        </div>
      </footer>
    </div>
  );
}
