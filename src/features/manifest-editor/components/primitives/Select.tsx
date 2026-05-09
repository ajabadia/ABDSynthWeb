import { OMEGA_Manifest, ManifestEntity } from '@/omega-ui-core/types/manifest';
import { useDesignTokens } from '@/features/manifest-editor/hooks/useDesignTokens';

interface SelectProps {
  value: number;
  variant: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  options?: string[];
  lookup?: string;
  onValueChange?: (val: number) => void;
}

export default function Select({ value, variant, options = [], lookup, manifest, item }: SelectProps) {
  const { colors, resolveFont, style, physics, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const labels = options.length > 0 ? options : [lookup || 'No Options'];
  const currentIndex = Math.min(labels.length - 1, Math.floor(value * labels.length));
  const currentLabel = labels[currentIndex];

  const font = style?.resolvedFont || resolveFont('labels');

  return (
    <div 
      className={`mini-select size-${size} color-${colorId}`}
      style={{
        ...allVars,
        backgroundColor: colors.surface,
        borderColor: colors.weak,
        color: colors.text,
        fontFamily: font,
        filter: physics.filter
      } as React.CSSProperties}
    >
      <div className="select-value">
        {currentLabel}
      </div>
      <div className="select-arrow" style={{ color: colors.accent }}>▼</div>
    </div>
  );
}

