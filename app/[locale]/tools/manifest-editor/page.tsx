import { Suspense } from 'react';
import WorkbenchContainer from '@/components/tools/manifest-editor/WorkbenchContainer';

export default function ManifestEditorPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black">
      <Suspense fallback={<div className="h-full w-full bg-black flex items-center justify-center text-primary font-mono text-[10px] animate-pulse">INITIALIZING OMEGA CORE...</div>}>
        <WorkbenchContainer />
      </Suspense>
    </main>
  );
}
