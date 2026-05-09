import React from 'react';
import { LayoutContainer, OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { CellRenderer } from '@/omega-ui-core/renderers/CellRenderer';

interface IndustrialContainerProps {
  container: LayoutContainer;
  manifest: OMEGA_Manifest;
  resolveAsset?: (id: string | undefined) => string | undefined;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  isError?: boolean;
  hideLabel?: boolean;
}

/**
 * OMEGA INDUSTRIAL CONTAINER ENGINE (Era 7.2.3)
 * Delegating to CellRenderer for absolute visual parity.
 */
export default function IndustrialContainer({
  container,
  manifest,
  resolveAsset,
  className = '',
  style: externalStyle = {},
  isSelected = false,
  isError = false,
}: IndustrialContainerProps) {
  // Create a phantom entity for the static engine
  const entity: ManifestEntity = {
    id: container.id,
    type: 'container' as ManifestEntity['type'],
    label: 'LABEL',
    pos: container.pos,
    role: 'infrastructure',
    bind: '',
    presentation: {
      component: 'container' as unknown as string,
      variant: container.variant || 'default',
      // Map LayoutContainer direct properties to the unified Style Node
      style: {
        color: container.color,
        indicatorColor: container.indicatorColor,
        rounding: container.rounding,
        borderWidth: container.borderWidth,
        opacity: container.opacity,
        font: container.font,
        fontSize: container.fontSize,
        fontColor: container.fontColor,
        asset: container.asset,
        // Include any other presentation.style if it somehow exists
        ...((container as unknown as Record<string, unknown>).presentation as Record<string, unknown>)?.style as Record<string, unknown> || {}
      },
      size: { 
        w: typeof container.size.w === 'number' ? container.size.w : 320, 
        h: container.size.h 
      },
      tab: 'MAIN',
      offsetX: 0,
      offsetY: 0,
      attachments: []
    }
  };

  return (
    <div
      className={`industrial-container-wrapper ${isSelected ? 'selected' : ''} ${isError ? 'integrity-error' : ''} ${className}`}
      style={{ 
        ...externalStyle,
        position: 'relative',
      }}
      dangerouslySetInnerHTML={{
        __html: CellRenderer.renderCellHTML(entity, {
          skin: 'industrial',
          zoom: 1.0,
          runtimeValue: 0,
          steps: 1,
          isSelected,
          manifest,
          resolveAsset
        })
      }}
    />
  );
}
