'use client';

import React from 'react';
import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';

// Modular Sub-components
import EntityIdentity from './identity/EntityIdentity';
import ModuleSignature from './identity/ModuleSignature';
import ModuleTaxonomy from './identity/ModuleTaxonomy';
import ModuleMechanicalSpec from './identity/ModuleMechanicalSpec';
import ModuleSkinSelector from './identity/ModuleSkinSelector';
import ModulePlaneSelector from './identity/ModulePlaneSelector';

interface IdentitySectionProps {
  item: OMEGA_Manifest | ManifestEntity;
  onUpdate: (updates: Partial<OMEGA_Manifest> | Partial<ManifestEntity>) => void;
  onHelp?: (sectionId?: string) => void;
  rootManifest?: OMEGA_Manifest;
  highlightPath?: string | null;
  resolveAsset: (id: string | undefined) => string | undefined;
}

export default function IdentitySection({ 
  item, 
  onUpdate, 
  onHelp, 
  rootManifest, 
  highlightPath,
  resolveAsset
}: IdentitySectionProps) {
  const isModule = 'metadata' in item;
  const isHighlighted = (key: string) => highlightPath?.includes(key);

  if (!isModule) {
    return (
      <EntityIdentity 
        entity={item as ManifestEntity} 
        rootManifest={rootManifest} 
        onUpdate={(u: Partial<ManifestEntity>) => onUpdate(u)} 
        onHelp={onHelp} 
        isHighlighted={isHighlighted} 
      />
    );
  }

  const manifest = item as OMEGA_Manifest;

  return (
    <div className="space-y-10 pt-2 pb-10">
      <ModuleSignature 
        manifest={manifest} 
        onUpdate={(u: Partial<OMEGA_Manifest>) => onUpdate(u)} 
        onHelp={onHelp} 
        isHighlighted={isHighlighted} 
        resolveAsset={resolveAsset}
      />

      <ModuleSkinSelector 
        manifest={manifest} 
        onUpdate={(u: Partial<OMEGA_Manifest>) => onUpdate(u)} 
      />

      <ModulePlaneSelector 
        manifest={manifest}
        onUpdate={(u: Partial<OMEGA_Manifest>) => onUpdate(u)}
      />
      
      <ModuleTaxonomy 
        manifest={manifest} 
        onUpdate={(u: Partial<OMEGA_Manifest>) => onUpdate(u)} 
        isHighlighted={isHighlighted} 
      />

      <ModuleMechanicalSpec 
        manifest={manifest} 
        onUpdate={(u: Partial<OMEGA_Manifest>) => onUpdate(u)} 
      />
    </div>
  );
}
