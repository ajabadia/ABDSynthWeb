import { OMEGA_Manifest, ManifestEntity } from '@/omega-ui-core/types/manifest';
import { useDesignTokens } from '@/features/manifest-editor/hooks/useDesignTokens';
import { renderSliderHTML } from '@/omega-ui-core/renderers/SliderRenderer';

interface SliderProps {
  type: 'slider-v' | 'slider-h';
  value: number;
  variant: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  isMain?: boolean;
}

export default function Slider({ type, value, variant, onValueChange, onClick, manifest, item }: SliderProps) {
  const { physics, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const html = renderSliderHTML({
    type,
    size,
    colorId,
    value
  });

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: html }}
      className="contents cursor-crosshair"
      style={{
        ...allVars,
        filter: physics.filter
      } as React.CSSProperties}
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); 
        if (onClick) onClick(); 
      }}
      onPointerUp={(e) => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); }}
      onPointerMove={(e) => { 
        if (e.buttons === 1) { 
          e.stopPropagation(); 
          const isHoriz = type === 'slider-h';
          onValueChange(value + (isHoriz ? e.movementX : -e.movementY) * 0.015); 
        } 
      }}
    />
  );
}
