import { OMEGA_Manifest, ManifestEntity } from '@/omega-ui-core/types/manifest';
import { useDesignTokens } from '@/features/manifest-editor/hooks/useDesignTokens';

interface LabelProps {
  variant: string;
  text: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
}

export default function Label({ variant, text, manifest, item }: LabelProps) {
  const { colors, resolveFont, style, physics } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  
  const dims: Record<string, number> = { A: 32, B: 24, C: 16, D: 12 };
  const d = dims[size] || 24;

  const font = style?.resolvedFont || resolveFont('labels');
  const color = style?.color || colors.text;

  return (
    <div 
      style={{ 
        fontSize: `${Math.max(6, d/2.5)}px`, // Larger for better visibility in industrial mode
        fontFamily: font,
        color: color,
        filter: physics.filter // Sublte shadow for screen-printing effect
      } as React.CSSProperties} 
      className="font-black uppercase whitespace-nowrap tracking-wider px-1 py-0.5 rounded-xs pointer-events-none"
    >
      {text}
    </div>
  );
}
