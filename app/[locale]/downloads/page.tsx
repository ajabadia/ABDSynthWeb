import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { instruments } from '@/data/instruments';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { Monitor, Apple, ArrowLeft, ShieldCheck, Cpu } from 'lucide-react';
import Image from 'next/image';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Downloads | ABD Virtual Instruments",
    description: "Download the latest versions of NEURONIK, JUNiO 601, and OMEGA. Professional VST/AU plugins for macOS and Windows.",
  };
}

export default async function DownloadsPage() {
  const tc = await getTranslations('common');
  const ti = await getTranslations('instruments');

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={18} className="text-zinc-500 group-hover:text-primary transition-colors" />
            <span className="font-headline font-bold uppercase tracking-widest text-xs">{tc('nav.back')}</span>
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/contact" className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
              {tc('nav.contact')}
            </Link>
            <LocaleSwitcher />
            <span className="hidden md:inline text-[10px] font-headline text-zinc-500 uppercase tracking-[0.2em]">
              {tc('nav.status')}: <span className="text-primary">{tc('nav.online')}</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pt-40 pb-32 relative z-10">
        <header className="space-y-6 mb-20">
          <div className="flex items-center gap-4">
            <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 text-[10px] font-bold tracking-[0.3em] uppercase">
              {tc('downloads.repo')}
            </span>
            <div className="h-px w-24 bg-primary/30" />
          </div>
          <h1 className="text-7xl font-headline font-black italic uppercase tracking-tighter">
            {tc('nav.downloads')}
          </h1>
          <p className="text-zinc-400 font-body text-xl max-w-2xl leading-relaxed">
            {tc('downloads.description')}
          </p>
        </header>
 
        <div className="grid grid-cols-1 gap-8">
          {instruments.map((instrument) => {
            const idKey = instrument.id.replace('abd-', '').replace(/-/g, '');
            return (
              <GlassPanel key={instrument.id} className="p-8 md:p-12 bg-zinc-900/10 border-white/5 group overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Preview */}
                  <div className="lg:col-span-3 relative aspect-square rounded-sm overflow-hidden border border-white/10">
                    <Image 
                      src={instrument.image} 
                      alt={instrument.name} 
                      fill 
                      sizes="300px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
 
                  {/* Info */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-headline font-black italic uppercase tracking-tighter">
                        {instrument.name}
                      </h2>
                      <p className="text-primary font-headline font-bold text-xs uppercase tracking-widest">
                        {ti(`${idKey}.tagline`)}
                      </p>
                    </div>
                    <p className="text-zinc-500 font-body text-sm leading-relaxed line-clamp-2">
                      {ti(`${idKey}.description`)}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 text-[10px] font-headline text-zinc-400 uppercase tracking-widest bg-white/5 px-3 py-1 border border-white/5">
                        <Cpu size={12} />
                        Build: {instrument.version}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-headline text-zinc-400 uppercase tracking-widest bg-white/5 px-3 py-1 border border-white/5">
                        <ShieldCheck size={12} />
                        {tc('downloads.certified')}
                      </span>
                    </div>
                  </div>
 
                  {/* Download Actions */}
                  <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
                    <Button 
                      size="lg" 
                      className="w-full gap-3 py-8 text-sm uppercase tracking-widest font-black bg-primary text-zinc-950"
                      aria-label={`Download ${instrument.name} for macOS`}
                    >
                      <Apple size={18} />
                      {tc('buttons.macOS')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full gap-3 py-8 text-sm uppercase tracking-widest font-bold border-white/10 hover:bg-white/5"
                      aria-label={`Download ${instrument.name} for Windows`}
                    >
                      <Monitor size={18} />
                      {tc('buttons.windows')}
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>
 
        {/* Global Requirements */}
        <footer className="mt-32 pt-16 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="font-headline font-bold uppercase tracking-widest text-primary text-sm">{tc('downloads.requirements')}</h4>
            <p className="text-zinc-500 text-sm font-body leading-relaxed">
              {tc('downloads.requirements_desc')}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline font-bold uppercase tracking-widest text-primary text-sm">{tc('downloads.formats')}</h4>
            <p className="text-zinc-500 text-sm font-body leading-relaxed">
              {tc('downloads.formats_desc')}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-headline font-bold uppercase tracking-widest text-primary text-sm">{tc('downloads.notice')}</h4>
            <p className="text-zinc-500 text-sm font-body leading-relaxed">
              {tc('downloads.notice_desc')}
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
