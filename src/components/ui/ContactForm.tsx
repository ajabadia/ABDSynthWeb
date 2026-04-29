"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { GlassPanel } from "./GlassPanel";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(false);
  
  // Math Challenge - Initialized to null to avoid hydration mismatch
  const [challenge, setChallenge] = useState<{ a: number; b: number; answer: number } | null>(null);

  useEffect(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setChallenge({ a, b, answer: a + b });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cooldown) return;
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Basic Client-side Validation
    if (data.bot_field) {
      // If honeypot is filled, silent reject
      setStatus("success");
      return;
    }

    if (!challenge || Number(data.challenge) !== challenge.answer) {
      setStatus("error");
      setErrorMessage(t("challengeError") || "Verification challenge failed. Are you human?");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          challenge_expected: challenge?.answer
        }),
      });

      const result = await response.json();
      console.log('SERVER RESPONSE:', result);

      if (!response.ok) {
        throw new Error(result.error || t("error"));
      }

      setStatus("success");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 5000); // 5s cooldown
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || t("error"));
    }
  };

  if (status === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 space-y-6"
        role="status"
        aria-live="polite"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-headline font-black italic uppercase tracking-tighter text-white">
            {t("successTitle")}
          </h3>
          <p className="text-zinc-500 font-body max-w-sm mx-auto">
            {t("successDesc")}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setStatus("idle")}
          className="px-8 border-white/10"
        >
          {t("newTransmission")}
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" aria-labelledby="contact-title">
      {/* Honeypot Field (Hidden for humans) */}
      <div className="sr-only opacity-0 h-0 w-0 overflow-hidden" aria-hidden="true">
        <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label htmlFor="name" className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {t("name")}
          </label>
          <input
            required
            aria-required="true"
            id="name"
            name="name"
            type="text"
            placeholder={t("namePlaceholder")}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-none px-6 py-4 text-white font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-zinc-800"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {t("email")}
          </label>
          <input
            required
            aria-required="true"
            id="email"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-none px-6 py-4 text-white font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-zinc-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-2">
          <label htmlFor="subject" className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {t("subject")}
          </label>
          <input
            required
            aria-required="true"
            id="subject"
            name="subject"
            type="text"
            placeholder={t("subjectPlaceholder")}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-none px-6 py-4 text-white font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-zinc-800"
          />
        </div>
        <div className="space-y-4">
          <label htmlFor="challenge" className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
            {t("challenge")}
          </label>
          <div className="flex items-stretch gap-2">
            <div className="flex-[2] bg-zinc-900/80 border border-primary/30 h-[64px] flex items-center justify-center font-headline text-3xl italic font-black text-primary px-6 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
              {challenge ? `${challenge.a} + ${challenge.b}` : (
                <Loader2 className="animate-spin text-zinc-700" size={24} />
              )}
            </div>
            <div className="flex-1">
              <input
                required
                aria-required="true"
                id="challenge"
                name="challenge"
                type="number"
                placeholder="?"
                className="w-full bg-zinc-900/50 border border-white/10 rounded-none h-[64px] text-center text-2xl text-white font-headline font-bold focus:outline-none focus:border-primary transition-all placeholder:text-zinc-800"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">
          {t("message")}
        </label>
        <textarea
          required
          aria-required="true"
          id="message"
          name="message"
          rows={6}
          placeholder={t("messagePlaceholder")}
          className="w-full bg-zinc-900/50 border border-white/5 rounded-none px-6 py-4 text-white font-body focus:outline-none focus:border-primary/50 transition-colors placeholder:text-zinc-800 resize-none"
        />
      </div>

      <AnimatePresence>
        {status === "error" && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-body"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle size={18} />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={status === "loading" || cooldown}
        className="w-full py-8 text-sm uppercase tracking-widest font-black bg-primary text-zinc-950 group"
      >
        {status === "loading" ? (
          <Loader2 className="animate-spin mr-2" size={20} />
        ) : (
          <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform mr-2" size={20} />
        )}
        {t("submit")}
      </Button>

      {/* Security Notice */}
      <p className="text-[9px] text-zinc-700 uppercase tracking-widest text-center">
        {t("security")}
      </p>
    </form>
  );
}
