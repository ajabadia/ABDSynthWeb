import { OMEGA_Manifest, ManifestEntity } from '@/types/manifest';
import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';
import { renderLedHTML } from '@/omega-ui-core/renderers/LedRenderer';

interface LedProps {
  value: number;
  variant: string;
  role?: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
}

export default function Led({ value, variant, manifest, item }: LedProps) {
  const { physics, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const html = renderLedHTML({ size, colorId, value });
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }} 
      style={{ 
        display: 'contents',
        ...allVars,
        filter: physics.filter
      } as React.CSSProperties} 
    />
  );
}
