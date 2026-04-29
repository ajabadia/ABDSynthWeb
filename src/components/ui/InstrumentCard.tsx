"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowUpRight, Cpu, Zap, Activity } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
import { Button } from "./Button";
import { type Instrument } from "@/data/instruments";

interface InstrumentCardProps {
  instrument: Instrument;
}

import { useTranslations } from "next-intl";

export function InstrumentCard({ instrument }: InstrumentCardProps) {
  const t = useTranslations('instruments');
  const tb = useTranslations('common.buttons');
  
  // Normalize ID to match translation keys (e.g., abd-junio-601 -> junio601)
  const idKey = instrument.id.replace('abd-', '').replace(/-/g, '');

  return (
    <GlassPanel 
      hoverEffect 
      className="group flex flex-col h-full overflow-hidden border-white/5"
    >
      {/* Accent Strip */}
      <div 
        className="absolute top-0 left-0 w-full h-1" 
        style={{ backgroundColor: instrument.colors.primary }} 
      />

      {/* Image Container */}
      <div className="relative aspect-video mb-6 overflow-hidden rounded-sm bg-zinc-900">
        <Image
          src={instrument.image}
          alt={instrument.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-zinc-950/80 backdrop-blur-md text-[10px] font-headline font-bold uppercase tracking-widest text-zinc-400 border border-white/5">
            {instrument.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-headline text-3xl font-black italic uppercase leading-none mb-2 tracking-tighter">
              {instrument.name}
            </h3>
            <p className="text-[10px] text-primary font-headline font-bold uppercase tracking-[0.2em] cyan-bloom">
              {t(`${idKey}.tagline`)}
            </p>
          </div>
          <span className="text-[10px] font-headline font-bold text-zinc-600 bg-white/5 px-2 py-1 border border-white/5">
            {instrument.version}
          </span>
        </div>

        <p className="text-sm text-zinc-500 font-body leading-relaxed line-clamp-3">
          {t(`${idKey}.description`)}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {instrument.specs[0].items.map((item) => (
            <div key={`${instrument.id}-${item.label}`} className="p-3 bg-zinc-900/50 border border-white/5 rounded-none group-hover:border-primary/20 transition-colors">
              <p className="text-[8px] text-zinc-600 uppercase font-headline font-bold tracking-widest mb-1">{item.label}</p>
              <p className="text-[10px] font-headline font-black text-zinc-300 uppercase truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-end">
        <Link 
          href={`/instrument/${instrument.id}`}
          aria-label={`${tb('viewDetail')} ${instrument.name}`}
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-3 px-6 py-5 text-[10px] uppercase tracking-widest font-bold border-white/10 hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary group/btn"
          >
            {tb('viewDetail')}
            <ArrowUpRight size={14} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-primary" />
          </Button>
        </Link>
      </div>
    </GlassPanel>
  );
}
