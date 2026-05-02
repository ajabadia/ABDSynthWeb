'use client';

import React from 'react';

interface HiddenFileHandlersProps {
  onBulkUpload: (files: File[]) => void;
  onResourceUpload: (files: FileList) => void;
  setPendingFiles: (files: File[]) => void;
}

/**
 * HiddenFileHandlers (v7.2.3)
 * Isolates invisible file input infrastructure to keep the main workbench clean.
 */
export const HiddenFileHandlers = ({ 
  onBulkUpload, 
  onResourceUpload, 
  setPendingFiles 
}: HiddenFileHandlersProps) => {
  return (
    <>
      <input 
        id="bulk-upload" 
        type="file" 
        accept=".acemm,.wasm,.json" 
        multiple 
        className="hidden" 
        onChange={(e) => { 
          if (e.target.files) { 
            setPendingFiles(Array.from(e.target.files)); 
            e.target.value = ''; 
          } 
        }} 
      />
      <input 
        id="folder-upload" 
        type="file" 
        {...({ webkitdirectory: "", directory: "" } as any)}
        className="hidden" 
        onChange={(e) => { 
          if (e.target.files) { 
            setPendingFiles(Array.from(e.target.files)); 
            e.target.value = ''; 
          } 
        }} 
      />
      <input 
        id="resource-upload" 
        type="file" 
        accept="image/*" 
        multiple 
        className="hidden" 
        onChange={(e) => { 
          if (e.target.files) { 
            onResourceUpload(e.target.files); 
            e.target.value = ''; 
          } 
        }} 
      />
    </>
  );
};
