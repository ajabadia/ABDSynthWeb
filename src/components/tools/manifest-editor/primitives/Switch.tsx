import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';

interface SwitchProps {
  value: number;
  variant: string;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  isMain?: boolean;
}

export default function Switch({ value, variant, onValueChange, onClick, manifest, item }: SwitchProps) {
  const { colors, physics, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value > 0.5 ? 0 : 1);
    if (onClick) onClick();
  };

  return (
    <div 
      onClick={handleToggle}
      className={`switch-container size-${size} color-${colorId}`}
      style={{
        ...allVars,
        backgroundColor: colors.surface,
        borderColor: colors.weak,
        filter: physics.filter
      } as React.CSSProperties}
    >
      <div className={`sw-led ${value < 0.5 ? 'active' : ''}`} style={{ backgroundColor: value < 0.5 ? colors.accent : undefined }} />
      <div className={`sw-led ${value >= 0.5 ? 'active' : ''}`} style={{ backgroundColor: value >= 0.5 ? colors.accent : undefined }} />
    </div>
  );
}
