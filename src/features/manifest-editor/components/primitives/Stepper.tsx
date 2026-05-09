import { OMEGA_Manifest, ManifestEntity } from '@/omega-ui-core/types/manifest';
import { useDesignTokens } from '@/features/manifest-editor/hooks/useDesignTokens';

interface StepperProps {
  type: 'stepper' | 'button' | 'push';
  value: number;
  variant: string;
  manifest: OMEGA_Manifest;
  item?: ManifestEntity;
  onValueChange: (val: number) => void;
  onClick?: () => void;
  text?: string;
  isMain?: boolean;
}

export default function Stepper({ type, value, variant, onValueChange, onClick, text, manifest, item }: StepperProps) {
  const { colors, resolveFont, style, physics, allVars } = useDesignTokens(manifest, item);
  
  const parts = (variant || 'B_cyan').split('_');
  const size = parts[0] || 'B';
  
  const dims: Record<string, number> = { A: 24, B: 18, C: 14, D: 12 };
  const d = dims[size] || 18;

  const font = style?.resolvedFont || resolveFont('labels');

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (type === 'push') onValueChange(1);
    if (onClick) onClick();
  };

  const handlePointerUp = () => {
    if (type === 'push') onValueChange(0);
  };

  return (
    <div 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`bg-black/60 border rounded-xs flex items-center justify-center cursor-pointer active:scale-95 transition-all overflow-hidden ${value > 0.5 ? 'border-primary/40' : ''}`} 
      style={{ 
        ...allVars,
        width: `${d}px`, 
        height: `${d}px`,
        backgroundColor: colors.surface,
        borderColor: value > 0.5 ? colors.accent : colors.weak,
        filter: physics.filter
      } as React.CSSProperties}
    >
      {text ? (
        <span 
          style={{ 
            color: value > 0.5 ? colors.accent : colors.text, 
            fontSize: `${d/2}px`,
            fontFamily: font
          }} 
          className="font-mono font-black select-none pointer-events-none opacity-80"
        >
          {text}
        </span>
      ) : (
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ 
            backgroundColor: value > 0.5 ? colors.accent : colors.weak, 
            boxShadow: value > 0.5 ? `0 0 10px ${colors.accent}` : 'none',
            opacity: value > 0.5 ? 1 : 0.2
          }} 
        />
      )}
    </div>
  );
}
