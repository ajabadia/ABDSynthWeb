import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/routing";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { InstrumentCard } from "@/components/ui/InstrumentCard";
import { instruments } from "@/data/instruments";
import { Download, Grid, Activity as ActivityIcon, Mail, Zap } from "lucide-react";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { HeroBackground } from "@/components/ui/HeroBackground";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home');
  return {
    title: t('hero.title1') + " " + t('hero.title2') + " | ABD",
    description: t('hero.description'),
    openGraph: {
      title: "ABD Virtual Instruments - The Future of Analog Legacy",
      description: "Experience high-fidelity neural and analog emulations of iconic hardware.",
      images: ["/images/og-image.png"],
    },
    alternates: {
      canonical: `https://abdsynths.com/`,
      languages: {
        'en': `https://abdsynths.com/en`,
        'es': `https://abdsynths.com/es`,
      },
    },
  };
}

export default async function Home() {
  const t = await getTranslations('home');
  const tc = await getTranslations('common');

  // Select the first instrument for stable SSR (Math.random is not allowed in render)
  const heroInstruments = instruments.filter(i => i.image.includes('hero_'));
  const randomInstrument = heroInstruments[0] || instruments[0];

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-primary/20 overflow-x-hidden">
      {/* Locale Switcher Floating */}
      <div className="fixed top-8 right-8 z-[100]">
        <LocaleSwitcher />
      </div>

      {/* Hero Section: Industrial Lab Style */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden border-b border-white/5">
        {/* Background Visuals with Parallax */}
        <HeroBackground 
          src={randomInstrument.image} 
          alt={`${randomInstrument.name} Hero Render`} 
        />

        <div className="max-w-7xl mx-auto px-8 w-full relative z-20">
          <div className="max-w-4xl space-y-12">
            <div className="flex items-center gap-4">
              <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 text-[10px] font-bold tracking-[0.3em] uppercase">
                {t('hero.subtitle')}
              </span>
              <div className="h-px w-24 bg-primary/30" />
            </div>

            <h1 className="font-headline text-[80px] md:text-[140px] leading-[0.8] font-black italic uppercase tracking-tighter">
              {t('hero.title1')} <br />
              <span className="text-primary cyan-bloom">{t('hero.title2')}</span>
            </h1>
            
            <p className="font-body text-zinc-400 text-xl max-w-2xl leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap gap-6 pt-8">
              <Link href="/downloads">
                <Button size="lg" className="px-10 py-8 text-sm uppercase tracking-widest font-black bg-primary text-zinc-950 hover:scale-105 transition-transform group">
                  <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                  {tc('buttons.downloadNow')}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-10 py-8 text-sm uppercase tracking-widest font-black border-white/10 hover:bg-white/5 hover:scale-105 transition-transform group">
                  <Mail size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                  {tc('nav.contact')}
                </Button>
              </Link>
              <a href="#philosophy">
                <Button variant="outline" size="lg" className="px-10 py-8 text-sm uppercase tracking-widest border-white/20 hover:bg-white/5">
                  {tc('buttons.learnMore')}
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Floating Tech Specs Matrix */}
        <div className="absolute bottom-24 right-12 hidden xl:block w-[400px]">
          <GlassPanel className="p-8 border-primary/20 bg-zinc-950/80 backdrop-blur-2xl">
            <div className="space-y-6">
               <div className="flex justify-between items-end">
                 <span className="text-[10px] font-headline text-zinc-500 uppercase tracking-[0.2em]">DSP Precision</span>
                 <span className="text-xl font-headline font-black text-primary italic">64-BIT FLOAT</span>
               </div>
               <div className="h-px bg-white/5" />
               <div className="flex justify-between items-end">
                 <span className="text-[10px] font-headline text-zinc-500 uppercase tracking-[0.2em]">Architecture</span>
                 <span className="text-xl font-headline font-black text-primary italic">ARM NATIVE</span>
               </div>
               <div className="h-px bg-white/5" />
               <div className="flex justify-between items-end">
                 <span className="text-[10px] font-headline text-zinc-500 uppercase tracking-[0.2em]">Sample Rate</span>
                 <span className="text-xl font-headline font-black text-primary italic">192 KHZ</span>
               </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* Philosophy & Technology Section (Bento Grid) */}
      <section id="philosophy" className="py-32 bg-black border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 glass-panel p-12 space-y-8 bg-zinc-900/10 border-white/5">
              <h2 className="text-5xl font-headline font-black italic uppercase tracking-tighter">
                {t('philosophy.title')} <span className="text-primary">{t('philosophy.highlight')}</span>
              </h2>
              <p className="text-zinc-400 font-body text-lg leading-relaxed max-w-2xl">
                {t.rich('philosophy.description', {
                  bold: (chunks) => <span className="text-white font-bold">{chunks}</span>
                })}
              </p>
              <div className="grid grid-cols-2 gap-12 pt-8">
                <div className="space-y-2">
                  <span className="text-primary font-headline font-bold text-xs uppercase tracking-[0.2em]">{t('philosophy.f1_title')}</span>
                  <p className="text-zinc-500 text-sm">{t('philosophy.f1_desc')}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-headline font-bold text-xs uppercase tracking-[0.2em]">{t('philosophy.f2_title')}</span>
                  <p className="text-zinc-500 text-sm">{t('philosophy.f2_desc')}</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-4 glass-panel p-12 flex flex-col justify-between border-primary/20 bg-primary/5">
              <Zap size={48} className="text-primary" />
              <div className="space-y-4">
                <h3 className="text-2xl font-headline font-black italic uppercase tracking-tighter">{t('philosophy.side_title')}</h3>
                <p className="text-zinc-400 text-sm font-body leading-relaxed">
                  {t('philosophy.side_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instrument Catalog */}
      <section className="max-w-7xl mx-auto px-8 py-32 space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h2 className="font-headline text-6xl font-black italic uppercase leading-none tracking-tighter">
              {t('catalog.title')} <span className="text-primary">{t('catalog.highlight')}</span> {t('catalog.catalog')}
            </h2>
            <p className="text-zinc-500 max-w-lg font-body text-lg">
              {t('catalog.description')}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="px-6 py-3 bg-zinc-900 border border-white/5 text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-400">
              {t('catalog.total')}: {instruments.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {instruments.map((instrument) => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
        </div>
      </section>

      {/* Industrial Grid Features */}
      <section className="max-w-7xl mx-auto px-8 py-32 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/5">
        {[
          { icon: <Grid size={32} />, title: t('features.f1_title'), desc: t('features.f1_desc') },
          { icon: <ActivityIcon size={32} />, title: t('features.f2_title'), desc: t('features.f2_desc') },
          { icon: <Download size={32} />, title: t('features.f3_title'), desc: t('features.f3_desc') }
        ].map((feat) => (
          <div key={feat.title} className="space-y-6 group">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-sm text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5 group-hover:border-primary/20">
              {feat.icon}
            </div>
            <h3 className="font-headline font-bold uppercase tracking-[0.2em] text-lg text-white">{feat.title}</h3>
            <p className="text-zinc-500 font-body leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </section>
      {/* Connect Section */}
      <section className="max-w-7xl mx-auto px-8 py-32 border-t border-white/5">
        <GlassPanel className="p-16 border-primary/20 bg-zinc-900/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-primary/10 transition-colors" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl text-center md:text-left">
              <h2 className="text-5xl font-headline font-black italic uppercase tracking-tighter leading-none">
                {t('connect.title')} <span className="text-primary">{t('connect.highlight')}</span>
              </h2>
              <p className="text-zinc-400 font-body text-lg leading-relaxed">
                {t('connect.description')}
              </p>
            </div>
            
            <Link href="/contact">
              <Button size="lg" className="px-12 py-10 text-md uppercase tracking-[0.3em] font-black bg-primary text-zinc-950 hover:scale-105 transition-transform group">
                <Mail className="mr-3" />
                {tc('buttons.contactLab')}
              </Button>
            </Link>
          </div>
        </GlassPanel>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-headline font-black italic uppercase tracking-widest text-white">ABD Virtual Instruments</h4>
            <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em]">{tc('footer.tagline')}</p>
          </div>
          
          <nav className="flex gap-12">
            <Link href="/downloads" className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
              {tc('nav.downloads')}
            </Link>
            <Link href="/contact" className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
              {tc('nav.contact')}
            </Link>
          </nav>

          <div className="text-[9px] font-headline text-zinc-700 uppercase tracking-[0.2em]">
            © 2026 / {tc('footer.matrix')}
          </div>
        </div>
      </footer>
    </main>
  );
}
