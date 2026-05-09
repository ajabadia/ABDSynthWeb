'use client';

import React from 'react';
import { ManifestEntity, OMEGA_Manifest } from '@/types/manifest';


interface PrimitiveProps {
  type: string;
  value: number;
  steps: number;
  variant: string;
  skin: string;
  isMain?: boolean;
  isSelected?: boolean;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  text?: string;
  role?: string;
  options?: string[];
  lookup?: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  resolveAsset?: (id: string | undefined) => string | undefined;
}

import { CellRenderer, CellOptions } from '@/omega-ui-core/renderers/CellRenderer';

export default function PrimitiveFactory(props: PrimitiveProps) {
  const { item, manifest, resolveAsset, value, steps, isSelected, skin } = props;

  if (!item) return null;

  // Prepare Master Engine Options
  const options: CellOptions = {
    skin,
    zoom: 1.0,
    runtimeValue: value,
    steps,
    isSelected,
    manifest,
    resolveAsset
  };

  // GENERATE MASTER HTML (The Single Engine)
  const masterHTML = CellRenderer.renderCellHTML(item, options);

  return (
    <div 
      className="primitive-master-proxy w-full h-full flex items-center justify-center pointer-events-auto"
      dangerouslySetInnerHTML={{ __html: masterHTML }}
      onClick={props.onClick}
    />
  );
}
