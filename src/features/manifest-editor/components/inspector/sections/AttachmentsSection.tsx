'use client';
 
import React from 'react';
import { Paperclip } from 'lucide-react';
import { ManifestEntity, OMEGA_Manifest, Attachment } from '@/omega-ui-core/types/manifest';
import { useAttachmentsLogic } from '@/features/manifest-editor/hooks/useAttachmentsLogic';
import AttachmentsHeader from '../attachments/AttachmentsHeader';
import AttachmentCard from '../attachments/AttachmentCard';
import InspectorCollapsible from '../shared/InspectorCollapsible';
 
interface AttachmentsSectionProps {
  item: ManifestEntity;
  manifest: OMEGA_Manifest;
  onUpdate: (updates: Partial<ManifestEntity>) => void;
  availableBinds?: string[];
  onHelp?: (sectionId?: string) => void;
  onOpenConfig?: () => void;
}
 
export default function AttachmentsSection({ item, manifest, onUpdate, availableBinds = [], onHelp, onOpenConfig }: AttachmentsSectionProps) {
  const { 
    attachments, coreAtt, expandedIdx, setExpandedIdx, 
    addAttachment, removeAttachment, updateAttachment 
  } = useAttachmentsLogic(item, onUpdate);
 
  const hostType = item.presentation?.component || 'knob';

  return (
    <div className="space-y-4 pt-2">
      <InspectorCollapsible 
        title="Signal Attachments" 
        icon={Paperclip}
      >
        <div className="space-y-4 pt-2">
          <AttachmentsHeader onAdd={addAttachment} onHelp={onHelp} />

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {/* VIRTUAL CORE ITEM */}
            <AttachmentCard 
              att={coreAtt} 
              manifest={manifest}
              hostType={hostType}
              idx="core" 
              isCore={true} 
              isExpanded={expandedIdx === 'core'} 
              onToggle={() => setExpandedIdx(expandedIdx === 'core' ? null : 'core')}
              onRemove={() => {}} 
              onUpdate={updateAttachment} 
              availableBinds={availableBinds}
              onOpenConfig={onOpenConfig}
            />

            {/* LIST OF FRAGMENTS */}
            {attachments.map((att: Attachment, idx: number) => (
              <AttachmentCard 
                key={idx}
                att={att} 
                manifest={manifest}
                hostType={hostType}
                idx={idx} 
                isExpanded={expandedIdx === idx} 
                onToggle={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                onRemove={removeAttachment} 
                onUpdate={updateAttachment} 
                availableBinds={availableBinds}
                onOpenConfig={onOpenConfig}
              />
            ))}
          </div>
        </div>
      </InspectorCollapsible>
    </div>
  );
}
