import { OMEGA_Manifest, ManifestEntity } from '@/omega-ui-core/types/manifest';
import { useDesignTokens } from '@/features/manifest-editor/hooks/useDesignTokens';
import { motion } from 'framer-motion';

interface KnobProps {
  value: number;
  variant: string;
  skin: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  isMain?: boolean;
  isSelected?: boolean;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  resolveAsset?: (id: string | undefined) => string | undefined;
}

export default function Knob({ value, variant, isSelected, onValueChange, onClick, manifest, item }: KnobProps) {
  const { physics, colors, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  const colorId = parts[1] || 'cyan';
  
  const rotation = -135 + (value * 270);

  return (
    <div 
      onPointerDown={(e) => { 
        e.stopPropagation(); 
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); 
        if (onClick) onClick(); 
      }}
      onPointerUp={(e) => { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); }}
      onPointerMove={(e) => { 
        if (e.buttons === 1) { 
          e.stopPropagation(); 
          onValueChange(value - (e.movementY * 0.012)); 
        } 
      }}
      className={`knob-container size-${size} color-${colorId} ${isSelected ? 'selected' : ''}`}
      style={{ 
        ...allVars,
        '--knob-rotation': `${rotation}deg`,
        position: 'relative',
        cursor: 'ns-resize',
        filter: physics.filter // Apply global shadow filter
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <div className="knob-cap" style={{ backgroundColor: colors.surface } as any} />
      <motion.div 
        animate={{ rotate: rotation }} 
        transition={{ type: 'spring', stiffness: 350, damping: 25 }} 
        className="knob-marker" 
        style={{ backgroundColor: colors.accent }}
      />
    </div>
  );
}
