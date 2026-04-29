import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { LocaleSwitcher } from '@/components/ui/LocaleSwitcher';
import { ArrowLeft, Mail, MessageSquare, Terminal, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/ui/ContactForm';

export default async function ContactPage() {
  const tc = await getTranslations('common');
  const t = await getTranslations('contact');

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-primary/20 overflow-x-hidden">
      {/* Background Visuals */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft size={18} className="text-zinc-500 group-hover:text-primary transition-colors" />
            <span className="font-headline font-bold uppercase tracking-widest text-xs">{tc('nav.back')}</span>
          </Link>
          <div className="flex items-center gap-8">
            <LocaleSwitcher />
            <span className="hidden md:inline text-[10px] font-headline text-zinc-500 uppercase tracking-[0.2em]">
              {tc('nav.status')}: <span className="text-primary">{tc('nav.online')}</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 pt-40 pb-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Info Side */}
          <div className="lg:col-span-5 space-y-12">
            <header className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-primary/10 text-primary border border-primary/30 px-3 py-1 text-[10px] font-bold tracking-[0.3em] uppercase">
                  {t('terminal')}
                </span>
                <div className="h-px w-24 bg-primary/30" />
              </div>
              <h1 id="contact-title" className="text-7xl font-headline font-black italic uppercase tracking-tighter">
                {t('title')} <span className="text-primary">{t('highlight')}</span>
              </h1>
              <p className="text-zinc-400 font-body text-xl leading-relaxed">
                {t('description')}
              </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Mail size={20} />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em]">{t('info.inquiries')}</span>
                </div>
                <p className="text-white font-headline text-lg italic">support@abd-instruments.com</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <MessageSquare size={20} />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em]">{t('info.community')}</span>
                </div>
                <p className="text-white font-headline text-lg italic">Discord / GitHub</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Terminal size={20} />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em]">{t('info.lab')}</span>
                </div>
                <p className="text-white font-headline text-lg italic">{t('info.remote')}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <MapPin size={20} />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em]">{t('info.origin')}</span>
                </div>
                <p className="text-white font-headline text-lg italic">{t('info.global')}</p>
              </div>
            </div>

            {/* Industrial Quote */}
            <GlassPanel className="p-8 border-white/5 bg-white/5 italic font-body text-zinc-500 text-sm leading-relaxed">
              {t('info.quote')}
            </GlassPanel>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-7">
            <GlassPanel className="p-8 md:p-12 border-primary/20 bg-zinc-900/10 relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-1/2 translate-x-1/2 blur-[60px]" />
              
              <ContactForm />
            </GlassPanel>
          </div>

        </div>
      </div>

      {/* Footer Industrial Decoration */}
      <div className="max-w-7xl mx-auto px-8 pb-12">
        <div className="h-px bg-white/5 w-full mb-8" />
        <div className="flex justify-between items-center text-[9px] font-headline text-zinc-700 uppercase tracking-[0.3em]">
          <span>Transmission Status: Operational</span>
          <span>© 2026 ABD Virtual Instruments</span>
          <span>Encryption: AES-256 Enabled</span>
        </div>
      </div>
    </main>
  );
}
