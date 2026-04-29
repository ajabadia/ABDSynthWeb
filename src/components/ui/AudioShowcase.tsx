"use client";

import * as React from "react";
import { Play, Pause, Volume2, Activity, SkipBack, SkipForward, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface AudioTrack {
  name: string;
  url: string;
  artist?: string;
  album?: string;
  sampleRate?: string;
  bitrate?: string;
  channels?: string;
  format?: string;
  cover?: string | null;
}

interface AudioShowcaseProps {
  instrumentId: string;
}

export function AudioShowcase({ instrumentId }: AudioShowcaseProps) {
  const t = useTranslations("instruments");
  const [tracks, setTracks] = React.useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = React.useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  
  // State for time tracking to avoid ref access in render
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [showMeta, setShowMeta] = React.useState(false);

  // Deterministic visualizer data (Pure & Idempotent)
  // We use the index to create pseudo-random but stable variety
  const visualizerBars = Array.from({ length: 60 }, (_, i) => ({
    seed1: (i * 0.1337) % 1,
    seed2: (i * 0.4242) % 1,
    seed3: (i * 0.7777) % 1
  }));

  React.useEffect(() => {
    async function loadTracks() {
      try {
        const response = await fetch(`/api/audio?id=${instrumentId}`);
        if (response.ok) {
          const data = await response.json();
          setTracks(data.tracks);
          if (data.tracks.length > 0) {
            setCurrentTrack(data.tracks[0]);
          }
        }
      } catch (error) {
        console.error("Failed to load audio tracks:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTracks();
  }, [instrumentId]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackSelect = (track: AudioTrack) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 0;
      setCurrentTime(time);
      setDuration(dur);
      setProgress(dur > 0 ? (time / dur) * 100 : 0);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !audioRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
    setProgress(percentage * 100);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || tracks.length === 0) return null;

  return (
    <section className="w-full py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-zinc-950/50">
      <div className="max-w-7xl mx-auto px-8 space-y-16">
        
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="relative">
                <Activity size={18} className="relative z-10" />
                <div className="absolute inset-0 bg-primary/20 blur-md animate-pulse" />
              </div>
              <span className="text-[10px] font-headline font-bold uppercase tracking-[0.5em]">
                {t('audio.telemetry')}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tight text-white leading-none">
              {t('audio.title1')} <span className="italic text-zinc-500">{t('audio.title2')}</span>
            </h2>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[10px] font-headline text-zinc-600 uppercase tracking-widest border-l border-white/10 pl-8">
             <div className="space-y-1">
               <div className="text-zinc-400">{t('audio.sampleRate')}</div>
               <div className="font-bold text-white">{currentTrack?.sampleRate || "N/A"}</div>
             </div>
             <div className="space-y-1">
               <div className="text-zinc-400">{t('audio.bitDepth')}</div>
               <div className="font-bold text-white">{currentTrack?.bitrate || "N/A"}</div>
             </div>
             <div className="space-y-1">
               <div className="text-zinc-400">{t('audio.mastering')}</div>
               <div className="font-bold text-primary">ABD Gold Standard</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Playlist Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-headline text-zinc-500 uppercase tracking-widest">
                 {t('audio.playlist')}
               </span>
               <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[8px] font-headline text-zinc-400">
                 {tracks.length} Artifacts
               </span>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 styled-scroll">
              {tracks.map((track, i) => (
                <button
                  key={track.url}
                  onClick={() => handleTrackSelect(track)}
                  className={cn(
                    "w-full flex items-center gap-5 p-4 rounded-sm border group transition-all relative overflow-hidden",
                    currentTrack?.url === track.url
                      ? "bg-primary/5 border-primary/40 text-white"
                      : "bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.05] hover:border-white/10"
                  )}
                >
                  {track.cover ? (
                    <div className="relative w-10 h-10 shrink-0 rounded-sm overflow-hidden border border-white/10">
                      <Image src={track.cover} alt="cover" fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono opacity-30 w-10 text-center">0{i + 1}</span>
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold uppercase tracking-[0.1em] truncate group-hover:text-white transition-colors">
                      {track.name}
                    </div>
                    {track.artist && <div className="text-[9px] text-zinc-600 uppercase font-headline">{track.artist}</div>}
                  </div>
                  <AnimatePresence>
                    {currentTrack?.url === track.url && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-primary"
                      >
                        {isPlaying ? <Activity size={14} className="animate-pulse" /> : <Play size={14} />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>
          </div>

          {/* Mastering Console (Player) */}
          <div className="lg:col-span-8">
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-sm p-10 h-full flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              
              <div className="relative z-10 space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex gap-6 items-center">
                    {currentTrack?.cover && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={currentTrack.cover}
                        className="relative w-20 h-20 rounded-sm overflow-hidden border border-white/10 shadow-2xl"
                      >
                        <Image src={currentTrack.cover} alt="cover" fill className="object-cover" sizes="80px" />
                      </motion.div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <div className={cn("w-1.5 h-1.5 rounded-full shadow-lg", isPlaying ? "bg-primary shadow-primary/50 animate-pulse" : "bg-zinc-800")} />
                         <div className="text-[10px] font-headline text-zinc-500 font-bold uppercase tracking-[0.2em]">
                           {t('audio.streamStatus')}: {isPlaying ? t('audio.streaming') : t('audio.standby')}
                         </div>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-headline font-bold uppercase tracking-tighter text-white cyan-bloom leading-none">
                        {currentTrack?.name || t('audio.initializing')}
                      </h3>
                      <div className="text-xs text-zinc-500 uppercase font-headline tracking-widest italic">
                        {currentTrack?.artist} — {currentTrack?.album}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMeta(!showMeta)}
                    className={cn(
                      "p-3 rounded-sm border transition-all",
                      showMeta ? "bg-primary text-black border-primary" : "bg-white/5 border-white/5 text-zinc-600 hover:text-white"
                    )}
                  >
                    <Info size={20} />
                  </button>
                </div>

                <AnimatePresence>
                  {showMeta && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-black/40 border border-white/5 p-6 rounded-sm space-y-4 overflow-hidden"
                    >
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="space-y-1">
                            <div className="text-[8px] text-zinc-600 uppercase font-headline">Container</div>
                            <div className="text-[10px] text-zinc-300 font-mono uppercase">{currentTrack?.format}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[8px] text-zinc-600 uppercase font-headline">Frequency</div>
                            <div className="text-[10px] text-zinc-300 font-mono uppercase">{currentTrack?.sampleRate}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[8px] text-zinc-600 uppercase font-headline">Bitrate</div>
                            <div className="text-[10px] text-zinc-300 font-mono uppercase">{currentTrack?.bitrate}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[8px] text-zinc-600 uppercase font-headline">Mode</div>
                            <div className="text-[10px] text-zinc-300 font-mono uppercase">{currentTrack?.channels}</div>
                          </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-32 flex items-center justify-center gap-1.5 px-4 bg-black/40 rounded-sm border border-white/[0.02] relative overflow-hidden">
                  {visualizerBars.map((bar, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: isPlaying 
                          ? [
                              bar.seed1 * 20 + 5 + (Math.sin(i * 0.2) * 20), 
                              bar.seed2 * 50 + 30 + (Math.cos(i * 0.3) * 30), 
                              bar.seed3 * 20 + 5 + (Math.sin(i * 0.2) * 20)
                            ] 
                          : 4 
                      }}
                      transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
                      className={cn(
                        "flex-1 rounded-full transition-colors duration-500",
                        isPlaying ? "bg-primary/40" : "bg-zinc-800"
                      )}
                      style={{ height: '10%' }}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div ref={progressBarRef} onClick={handleSeek} className="relative h-2 bg-white/5 rounded-full cursor-pointer group/progress overflow-hidden">
                    <motion.div className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                       <span className="text-primary">{formatTime(currentTime)}</span>
                       <span className="opacity-20">/</span>
                       <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between">
                 <div className="flex items-center gap-6">
                    <button onClick={togglePlay} className={cn("w-20 h-20 flex items-center justify-center rounded-sm transition-all shadow-xl active:scale-95", isPlaying ? "bg-white text-black shadow-white/10" : "bg-primary text-black shadow-primary/20 hover:bg-white")}>
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
                    </button>
                    <div className="flex gap-2">
                       <button className="p-4 bg-white/5 rounded-sm text-zinc-500 hover:text-white hover:bg-white/10 transition-all"><SkipBack size={18} /></button>
                       <button className="p-4 bg-white/5 rounded-sm text-zinc-500 hover:text-white hover:bg-white/10 transition-all"><SkipForward size={18} /></button>
                    </div>
                 </div>
                 <div className="flex items-center gap-6 bg-black/20 p-4 rounded-sm border border-white/5">
                   <div className="flex items-center gap-3">
                     <Volume2 size={16} className="text-zinc-600" />
                     <div className="w-32 h-1 bg-white/5 rounded-full relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-zinc-500 w-[80%]" />
                     </div>
                   </div>
                 </div>
              </div>

              <audio 
                ref={audioRef} 
                src={currentTrack?.url} 
                onTimeUpdate={onTimeUpdate} 
                onLoadedMetadata={onLoadedMetadata}
                onEnded={() => setIsPlaying(false)} 
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
