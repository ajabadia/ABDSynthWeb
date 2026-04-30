import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { instruments } from "@/data/instruments";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { SignalPath } from "@/components/ui/SignalPath";
import { SpecsMatrix } from "@/components/ui/SpecsMatrix";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { AudioShowcase } from "@/components/ui/AudioShowcase";
import { getTranslations } from "next-intl/server";
import { 
  ArrowLeft, 
  Activity, 
  ShieldCheck,
} from "lucide-react";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { RenderShowcase } from "@/components/ui/RenderShowcase";
import fs from "fs/promises";
import path from "path";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }): Promise<Metadata> {
  const { id, locale } = await params;
  const instrument = instruments.find((i) => i.id === id);
  if (!instrument) return {};

  return {
    title: `${instrument.name} | ABD Virtual Instruments`,
    description: instrument.description,
    openGraph: {
      title: `${instrument.name} - Gold Standard Emulation`,
      description: instrument.description,
      images: [instrument.image],
    },
    twitter: {
      card: "summary_large_image",
      title: instrument.name,
      description: instrument.description,
      images: [instrument.image],
    },
    alternates: {
      canonical: `https://abdsynths.com/${locale}/instrument/${id}`,
      languages: {
        'en': `https://abdsynths.com/en/instrument/${id}`,
        'es': `https://abdsynths.com/es/instrument/${id}`,
      },
    },
  };
}

export default async function InstrumentDetail({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id, locale } = await params;
  const instrument = instruments.find((i) => i.id === id);

  if (!instrument) {
    notFound();
  }

  const t = await getTranslations('instruments');
  const tc = await getTranslations('common');
  
  // Dynamic Render Detection
  const cleanId = instrument.id.replace('abd-', '');
  const renderDirPath = path.join(process.cwd(), 'public', 'images', 'renders', cleanId);
  let availableViews: string[] = [];
  const currentVariant = "black"; // This will be dynamic in the future

  try {
    const files = await fs.readdir(renderDirPath);
    availableViews = files
      .filter(file => file.startsWith(`${currentVariant}_`) && file.endsWith('.png'))
      .map(file => file.replace(`${currentVariant}_`, '').replace('.png', ''));
    
    // Sort views to keep a consistent order (front first if exists)
    availableViews.sort((a, b) => {
      if (a === 'front') return -1;
      if (b === 'front') return 1;
      return a.localeCompare(b);
    });
  } catch {
    availableViews = [];
  }

  // Gallery Discovery Logic
  const galleryDirPath = path.join(process.cwd(), 'public', 'images', 'gallery', instrument.id);
  let galleryItems: { url: string; caption?: string; description?: string }[] = [];

  try {
    const galleryFiles = await fs.readdir(galleryDirPath);
    
    // Look for metadata.json
    let galleryMetadata: Record<string, Record<string, Record<string, string>>> = {};
    if (galleryFiles.includes('metadata.json')) {
      const metadataContent = await fs.readFile(path.join(galleryDirPath, 'metadata.json'), 'utf-8');
      galleryMetadata = JSON.parse(metadataContent).images || {};
    }

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
    const validGalleryFiles = galleryFiles.filter(file => 
      imageExtensions.includes(path.extname(file).toLowerCase())
    );

    galleryItems = validGalleryFiles.map(file => {
      const meta = galleryMetadata[file] || {};
      
      // Specifically handle the locale translation
      const translatedMeta = meta[locale] || meta['en'] || {};

      return {
        url: `/images/gallery/${instrument.id}/${file}`,
        caption: translatedMeta.caption || "",
        description: translatedMeta.description || ""
      };
    });
  } catch {
    galleryItems = [];
  }
  
  // Normalize ID to match translation keys (e.g., abd-junio-601 -> junio601)
  const idKey = instrument.id.replace('abd-', '').replace(/-/g, '');

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": instrument.name,
            "image": [
              `https://abdsynths.com${instrument.image}`
            ],
            "description": instrument.description,
            "brand": {
              "@type": "Brand",
              "name": "ABD Virtual Instruments"
            },
            "category": instrument.category,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={16} className="text-zinc-500 group-hover:text-primary transition-colors" />
            <span className="font-headline font-bold uppercase tracking-widest text-xs">{tc('nav.back')}</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
              {tc('nav.contact')}
            </Link>
            <LocaleSwitcher />
            <span className="hidden md:flex items-center gap-6">
              <span className="text-[10px] font-headline text-zinc-500 uppercase tracking-[0.2em]">
                {tc('nav.status')}: <span className="text-primary">{tc('nav.online')}</span>
              </span>
            </span>
            <Link href="/downloads">
              <Button size="sm" variant="primary">{tc('nav.download')}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5">
        <HeroBackground 
          src={instrument.image} 
          alt={`${instrument.name} Background Parallax`} 
        />
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] z-10" />
        
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span 
                  className="px-3 py-1 text-[10px] font-headline font-bold uppercase tracking-widest border"
                  style={{ borderColor: instrument.colors.primary, color: instrument.colors.primary }}
                >
                  {instrument.category}
                </span>
                <span className="text-zinc-600 font-headline text-xs tracking-widest uppercase">
                  Build: {instrument.version}
                </span>
              </div>
              <h1 className="font-headline text-6xl md:text-8xl font-black italic uppercase leading-none tracking-tighter">
                {instrument.name.split(" ").map((word, i) => (
                  <span key={i} className={i === 1 ? "text-primary cyan-bloom" : ""}>{word} </span>
                ))}
              </h1>
              <p className="text-xl text-zinc-400 font-body leading-relaxed max-w-xl">
                {t(`${idKey}.description`)}
              </p>
            </div>
 
            <div className="flex gap-4">
              <Link href="/downloads">
                <Button size="lg" className="px-12">{tc('nav.download')}</Button>
              </Link>
              <Button size="lg" variant="outline">{tc('buttons.manual')}</Button>
              {instrument.id === 'abd-omega' && (
                <Link href="/tools/manifest-editor">
                  <Button size="lg" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                    {tc('buttons.manifestEditor')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
 
          <div className="lg:col-span-7 relative aspect-square lg:aspect-[4/3] z-20">
            
            {availableViews.length > 0 ? (
              <RenderShowcase 
                instrumentId={instrument.id} 
                variant="black" 
                views={availableViews} 
              />
            ) : (
              <>
                {instrument.id === 'abd-omega' && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 border border-primary/30 text-primary font-headline font-bold uppercase tracking-[0.3em] animate-pulse">
                        <Activity size={18} />
                        Lab Status: Restricted
                      </div>
                      <div className="pt-4">
                        <Link href="/tools/manifest-editor">
                          <Button variant="outline" size="sm" className="border-primary/20 text-primary/60 hover:text-primary hover:border-primary">
                            {tc('buttons.manifestEditor')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                <Image
                  src={instrument.image}
                  alt={instrument.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-90"
                  priority
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Technical Specifications Matrix */}
      <section className="max-w-7xl mx-auto px-8 py-32 space-y-24">
        {/* Pass translated groups if necessary or handle in component */}
        <SpecsMatrix specs={instrument.specs} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
          <div className="space-y-4">
            <h3 className="font-headline text-xl font-bold uppercase tracking-widest text-primary">
              Proprietary Tech
            </h3>
            <p className="text-zinc-500 font-body text-sm">
              Unique innovations and certified protocols integrated into the {instrument.name} engine.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {instrument.features.map((feature, i) => (
              <GlassPanel key={i} className="flex gap-4 items-start border-white/5 bg-white/[0.02]">
                <div className="p-2 bg-primary/10 text-primary rounded-sm mt-1">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-sm text-zinc-400 font-body leading-snug">
                  {feature}
                </p>
              </GlassPanel>
            ))}
          </div>
        </div>

        {/* Signal Path Visualization */}
        <GlassPanel className="w-full p-8 md:p-12 border-primary/10 relative overflow-hidden">
          <SignalPath path={instrument.signalPath} accentColor={instrument.colors.primary} />
        </GlassPanel>

        {/* Audio Showcase */}
        <AudioShowcase instrumentId={instrument.id} />

        {/* Gallery Section */}
        {galleryItems.length > 0 && (
          <ImageGallery 
            items={galleryItems} 
            title="Interface Modules"
            altBase={instrument.name} 
          />
        )}
      </section>

      {/* Footer / CTA */}
      <footer className="max-w-7xl mx-auto px-8 py-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-2">
            <h3 className="font-headline text-3xl font-black italic uppercase leading-none">
              Ready to <span className="text-primary">Synthesize</span>?
            </h3>
            <p className="text-zinc-500 font-body">Available for Windows 10+ and macOS 12+ (Apple Silicon Native).</p>
          </div>
          <div className="flex gap-4">
             <Link href="/downloads">
               <Button size="lg">{tc('nav.download')}</Button>
             </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
