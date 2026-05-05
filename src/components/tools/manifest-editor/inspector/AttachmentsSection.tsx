'use client';

import React from 'react';
import { ManifestEntity } from '@/types/manifest';
import { useAttachmentsLogic } from '@/hooks/manifest-editor/useAttachmentsLogic';
import AttachmentsHeader from './attachments/AttachmentsHeader';
import AttachmentCard from './attachments/AttachmentCard';

interface AttachmentsSectionProps {
  item: ManifestEntity;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  availableBinds?: string[];
  onHelp?: (sectionId?: string) => void;
}

export default function AttachmentsSection({ item, onUpdate, availableBinds = [], onHelp }: AttachmentsSectionProps) {
  const { 
    attachments, coreAtt, expandedIdx, setExpandedIdx, 
    addAttachment, removeAttachment, updateAttachment 
  } = useAttachmentsLogic(item, onUpdate);

  return (
    <div className="space-y-4 pt-2">
      <AttachmentsHeader onAdd={addAttachment} onHelp={onHelp} />

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {/* VIRTUAL CORE ITEM */}
        <AttachmentCard 
          att={coreAtt} 
          idx="core" 
          isCore={true} 
          isExpanded={expandedIdx === 'core'} 
          onToggle={() => setExpandedIdx(expandedIdx === 'core' ? null : 'core')}
          onRemove={() => {}} 
          onUpdate={updateAttachment} 
          availableBinds={availableBinds}
        />

        {/* LIST OF FRAGMENTS */}
        {attachments.map((att, idx) => (
          <AttachmentCard 
            key={idx}
            att={att} 
            idx={idx} 
            isExpanded={expandedIdx === idx} 
            onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            onRemove={removeAttachment} 
            onUpdate={updateAttachment} 
            availableBinds={availableBinds}
          />
        ))}
      </div>
    </div>
  );
}
