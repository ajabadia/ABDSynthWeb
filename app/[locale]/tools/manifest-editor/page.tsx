import WorkbenchContainer from '@/components/tools/manifest-editor/WorkbenchContainer';

export default function ManifestEditorPage() {

  return (
    <div className="min-h-screen pt-8 pb-12 px-4 bg-background">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-6 flex justify-between items-end border-b border-primary/10 pb-4">
          <div>
            <h1 className="text-2xl font-headline font-bold text-primary tracking-tighter uppercase italic leading-none">
              OMEGA Manifest Workbench
            </h1>
            <p className="text-[10px] text-foreground/40 uppercase tracking-[0.3em] font-bold mt-1">
              Industrial Era 7 Engineering Suite
            </p>
          </div>
          <div className="text-[10px] font-mono text-primary/30 uppercase">
            Build v7.0.8 // Aseptic Standard
          </div>
        </header>

        <WorkbenchContainer />
      </div>
    </div>
  );
}
