import { OMEGA_Manifest } from '@/types/manifest';
import { useDesignTokens } from '@/hooks/manifest-editor/useDesignTokens';

interface RackScrewsProps {
  manifest: OMEGA_Manifest;
}

export const RackScrews = ({ manifest }: RackScrewsProps) => {
  const { colors } = useDesignTokens(manifest);

  return (
    <>
      <div className="module-screw top-left" style={{ backgroundColor: colors.weak }} />
      <div className="module-screw top-right" style={{ backgroundColor: colors.weak }} />
      <div className="module-screw bottom-left" style={{ backgroundColor: colors.weak }} />
      <div className="module-screw bottom-right" style={{ backgroundColor: colors.weak }} />
    </>
  );
};
