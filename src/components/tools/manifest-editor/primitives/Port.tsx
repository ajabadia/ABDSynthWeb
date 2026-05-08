import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';
import { renderPortHTML } from '@/omega-ui-core/renderers/PortRenderer';

interface PortProps {
  value: number;
  variant: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  isMain?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  color?: string;
}

export default function Port({ value, variant, isMain, isSelected, onClick, color, item, manifest }: PortProps) {
  const { colors, physics, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_accent').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'accent';
  
  const html = renderPortHTML({
    size,
    colorId,
    value,
    isMain,
    isSelected,
    id: item?.id,
    label: item?.label,
    explicitColor: color || colors.accent
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="contents cursor-pointer"
      style={{
        ...allVars,
        filter: physics.filter
      } as React.CSSProperties}
    />
  );
}
