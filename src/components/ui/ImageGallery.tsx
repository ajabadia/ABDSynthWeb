"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryItem {
  url: string;
  caption?: string;
  description?: string;
}

interface ImageGalleryProps {
  items: GalleryItem[];
  title?: string;
  altBase?: string;
  className?: string;
}

/**
 * Industrial Grade Image Gallery (v2 - Best Practices)
 * Features: 3D Cover Flow, Infinite Loop, Keyboard Navigation, Bokeh Blur, 
 * Metadata Captions, Progress Indicators.
 */
export function ImageGallery({ 
  items, 
  title = "Interface Modules", 
  altBase = "Gallery image",
  className 
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const handleNext = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % items.length);
    }
  }, [selectedIndex, items.length]);

  const handlePrev = React.useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }
  }, [selectedIndex, items.length]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setSelectedIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  return (
    <div className={cn("space-y-8 pt-16", className)}>
      {title && (
        <div className="flex items-end justify-between border-b border-primary/20 pb-4">
          <h2 className="font-headline text-xl font-bold uppercase tracking-widest">
            {title}
          </h2>
          <span className="text-[10px] font-headline text-zinc-500 uppercase tracking-widest">
            {items.length} Modules Loaded
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {items.map((item, i) => (
          <motion.div
            key={item.url}
            whileHover={{ y: -5, scale: 1.05 }}
            onClick={() => setSelectedIndex(i)}
            className="cursor-pointer group relative"
          >
            <div className="aspect-square relative overflow-hidden rounded-sm bg-zinc-900/20">
              <Image
                src={item.url}
                alt={item.caption || `${altBase} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-[10px] font-headline font-bold uppercase text-primary tracking-[0.2em] truncate">
                  {item.caption || `Module 0${i + 1}`}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/98 backdrop-blur-3xl perspective-[2000px] overflow-hidden"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <motion.button
              className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors z-[150] p-2 hover:bg-white/5 rounded-full"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={32} />
            </motion.button>

            {/* Cinematic Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center py-20 overflow-hidden">
              {/* Navigation Arrows */}
              <div className="absolute inset-x-8 md:inset-x-24 top-1/2 -translate-y-1/2 flex justify-between items-center z-[140] pointer-events-none">
                <button
                  onClick={handlePrev}
                  className="p-4 bg-white/2 border border-white/5 text-white/30 rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary transition-all pointer-events-auto backdrop-blur-sm"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-4 bg-white/2 border border-white/5 text-white/30 rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary transition-all pointer-events-auto backdrop-blur-sm"
                >
                  <ChevronRight size={32} />
                </button>
              </div>

              {/* Central Stage */}
              <div className="relative flex items-center justify-center w-full max-w-7xl h-[65vh]">
                {items.map((item, i) => {
                  let offset = i - selectedIndex;
                  if (offset > items.length / 2) offset -= items.length;
                  if (offset < -items.length / 2) offset += items.length;
                  
                  const absOffset = Math.abs(offset);
                  if (absOffset > 2) return null;

                  return (
                    <motion.div
                      key={item.url}
                      initial={false}
                      animate={{
                        x: offset * 450,
                        z: absOffset * -400,
                        rotateY: offset * -45,
                        opacity: i === selectedIndex ? 1 : 0.3,
                        scale: i === selectedIndex ? 1 : 0.7,
                        filter: i === selectedIndex ? "blur(0px) brightness(1)" : "blur(12px) brightness(0.4)",
                        zIndex: 100 - Math.round(absOffset)
                      }}
                      transition={{ type: "spring", stiffness: 150, damping: 20 }}
                      className="absolute w-[90vw] md:w-[850px] aspect-video cursor-pointer select-none"
                      style={{ transformStyle: "preserve-3d" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (i === selectedIndex) return;
                        setSelectedIndex(i);
                      }}
                    >
                      {/* Main Image */}
                      <div className="relative w-full h-full">
                        <Image
                          src={item.url}
                          alt={item.caption || `${altBase} zoom ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 90vw, 850px"
                          className="object-contain"
                          priority={i === selectedIndex}
                        />
                      </div>
                      
                      {/* Reflection Effect - Only for active item */}
                      {i === selectedIndex && (
                        <div 
                          className="absolute top-full left-0 w-full h-1/2 opacity-30 pointer-events-none mt-4"
                          style={{
                            transform: "scaleY(-1)",
                            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 80%)",
                            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 80%)"
                          }}
                        >
                          <Image
                            src={item.url}
                            alt="reflection"
                            fill
                            sizes="(max-width: 768px) 90vw, 850px"
                            className="object-contain"
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Info & Navigation Overlay */}
              <div className="mt-12 flex flex-col items-center gap-6 z-[140]">
                {/* Dots / Progress */}
                <div className="flex gap-3">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); }}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === selectedIndex ? "bg-primary w-8" : "bg-white/20 hover:bg-white/40"
                      )}
                    />
                  ))}
                </div>

                {/* Metadata Section */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center space-y-2 max-w-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                       <Info size={14} className="text-primary" />
                       <h3 className="font-headline font-black italic uppercase text-2xl tracking-tighter">
                         {items[selectedIndex].caption || "Module Identification"}
                       </h3>
                    </div>
                    <p className="text-zinc-500 font-body text-sm leading-relaxed">
                      {items[selectedIndex].description || "Technical specification and module parameter overview."}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <span className="text-[10px] font-headline font-bold uppercase tracking-[0.6em] text-white/5 select-none pt-4">
                  {String(selectedIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
