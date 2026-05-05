'use client';

import React from 'react';
import AttachmentTypeAnchor from './attachments/AttachmentTypeAnchor';
import AttachmentVariantSpec from './attachments/AttachmentVariantSpec';
import AttachmentLogicFields from './attachments/AttachmentLogicFields';
import AttachmentPrecisionOffsets from './attachments/AttachmentPrecisionOffsets';

import { Attachment } from '@/types/manifest';

interface AttachmentItemProps {
  att: Attachment;
  availableBinds: string[];
  onUpdate: (updates: Partial<Attachment>) => void;
}

export default function AttachmentItem({ att, availableBinds, onUpdate }: AttachmentItemProps) {
  const isCore = att.isCore === true;

  return (
    <div className="space-y-4">
      <AttachmentTypeAnchor 
        type={att.type} 
        position={att.position} 
        isCore={isCore} 
        onUpdate={onUpdate} 
      />

      <div className="grid grid-cols-2 gap-3">
        <AttachmentVariantSpec 
          variant={att.variant} 
          onUpdate={onUpdate} 
        />

        <AttachmentLogicFields 
          att={att} 
          availableBinds={availableBinds} 
          onUpdate={onUpdate} 
        />
      </div>

      <AttachmentPrecisionOffsets 
        offsetX={att.offsetX} 
        offsetY={att.offsetY} 
        onUpdate={onUpdate} 
      />
    </div>
  );
}
