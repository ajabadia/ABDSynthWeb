"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { GlassPanel } from "./GlassPanel";
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
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.url}
            whileHover={{ y: -5 }}
            onClick={() => setSelectedIndex(i)}
            className="cursor-pointer group"
          >
            <GlassPanel className="p-1 border-white/5 aspect-square relative overflow-hidden">
              <Image
                src={item.url}
                alt={item.caption || `${altBase} ${i + 1}`}
                fill
                className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-black/60 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-[8px] font-headline font-bold uppercase text-primary truncate text-center">
                  {item.caption || `Module 0${i + 1}`}
                </p>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl perspective-[1200px] overflow-hidden"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <motion.button
              className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors z-[150]"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={40} />
            </motion.button>

            {/* Cover Flow Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center py-20 overflow-hidden">
              {/* Navigation Arrows */}
              <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 flex justify-between items-center z-[140] pointer-events-none">
                <button
                  onClick={handlePrev}
                  className="p-5 bg-white/2 border border-white/5 text-white/50 rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary transition-all pointer-events-auto backdrop-blur-md"
                >
                  <ChevronLeft size={40} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-5 bg-white/2 border border-white/5 text-white/50 rounded-full hover:bg-primary/20 hover:text-primary hover:border-primary transition-all pointer-events-auto backdrop-blur-md"
                >
                  <ChevronRight size={40} />
                </button>
              </div>

              {/* Cover Flow Items */}
              <div className="relative flex items-center justify-center w-full max-w-7xl h-[60vh]">
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
                        x: offset * 350,
                        z: absOffset * -250,
                        rotateY: offset * -65,
                        opacity: i === selectedIndex ? 1 : 0.4,
                        scale: i === selectedIndex ? 1.15 : 0.8,
                        filter: i === selectedIndex ? "blur(0px) brightness(1)" : "blur(8px) brightness(0.5)",
                        zIndex: 100 - Math.round(absOffset)
                      }}
                      transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      className="absolute w-[85vw] md:w-[750px] aspect-video border border-white/10 glass-panel overflow-hidden cursor-pointer shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                      style={{ transformStyle: "preserve-3d" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (i === selectedIndex) return;
                        setSelectedIndex(i);
                      }}
                    >
                      <Image
                        src={item.url}
                        alt={item.caption || `${altBase} zoom ${i + 1}`}
                        fill
                        className="object-contain p-2"
                        priority={i === selectedIndex}
                      />
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
