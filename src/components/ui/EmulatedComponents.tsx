"use client";

import React, { useState } from "react";
import { 
  Activity, 
  Cpu, 
  Flame, 
  Radio, 
  Volume2, 
  FileAudio,
  Maximize2,
  Disc
} from "lucide-react";
import { GlassPanel } from "./GlassPanel";

interface ComponentDetail {
  id: string;
  name: string;
  icon: React.ReactNode;
  tagline: string;
  features: string[];
  detailsEn: string;
  detailsEs: string;
}

export function EmulatedComponents({ locale, instrumentId }: { locale: string; instrumentId: string }) {
  const [activeTab, setActiveTab] = useState("dco");

  // Dynamic content logic based on instrumentId
  const getComponentsList = (): ComponentDetail[] => {
    const isJ601 = instrumentId === "abd-junio-601";
    const isJ06 = instrumentId === "abd-junio-06";
    const isJSix = instrumentId === "abd-junio-six";
    const isSuperSix = instrumentId === "abd-junio-supersix";

    return [
      {
        id: "dco",
        name: "DCO (Digitally Controlled Oscillator)",
        icon: <Cpu className="w-5 h-5" />,
        tagline: isSuperSix ? "Motor de oscilación con deriva térmica" : "El motor digital con alma analógica",
        features: isSuperSix 
          ? ["Reloj divisor Intel 8253", "Analog Drift controlable", "Curvatura de carga variable", "Sub-Oscilador PolyBLEP"]
          : ["Reloj divisor Intel 8253", "Curvatura de carga no lineal", "Discharge Blip en graves", "Sub-Oscilador PolyBLEP"],
        detailsEn: isSuperSix
          ? "Faithful emulation of the Intel 8253 digital divisor clock with customizable Analog Drift. Dial in thermal drift and organic tuning instability. Features non-linear sawtooth charge curvature and smoothed PolyBLEP sub-oscillators."
          : "Faithful emulation of the Intel 8253 digital divisor clock. It features hardware-accurate Charge Curvature (the sawtooth ramp bends slightly due to output impedance) and 'Discharge Blips' (capacitor discharge rebound) giving it a signature low-end punch. The Sub-Oscillator is smoothed via 4th-order PolyBLEP and a 4.2 kHz passive RC filter.",
        detailsEs: isSuperSix
          ? "Emulación fiel del reloj divisor digital Intel 8253 con deriva térmica (Analog Drift) personalizable mediante potenciómetro. Cuenta con curvatura de carga de rampa no lineal y sub-osciladores suavizados por PolyBLEP."
          : "Emulación fiel del reloj divisor digital Intel 8253. Cuenta con curvatura de carga no lineal del hardware real (la rampa de diente de sierra se deforma sutilmente por la impedancia de salida) y el 'Discharge Blip' (rebote de descarga del condensador) que le da su pegada característica en graves. El Sub-oscilador está suavizado con PolyBLEP de 4º orden y un filtro pasivo RC a 4.2 kHz."
      },
      {
        id: "vcf",
        name: "VCF (Voltage Controlled Filter)",
        icon: <Flame className="w-5 h-5" />,
        tagline: isSuperSix 
          ? "Doble circuito de filtro seleccionable" 
          : (isJ601 ? "El corazón rugiente del chip 80017A" : "El corazón rugiente del chip IR3109"),
        features: isSuperSix
          ? ["Modelado IR3109 vs. 80017A", "ZDF TPT de 4 polos", "Saturación OTA no lineal", "Auto-oscilación térmica"]
          : ["ZDF TPT de 4 polos", "Resolvedor Newton-Raphson", "Compensación de graves Q", "Auto-oscilación térmica"],
        detailsEn: isSuperSix
          ? "Toggle between the creamy, bright Roland IR3109 filter (Juno-6/60) and the warmer, smoother 80017A (Juno-106) filter models. Emulated step-by-step using a zero-delay feedback loop and non-linear OTA saturation."
          : (isJ601
            ? "A 4-pole cascade Zero-Delay Feedback (ZDF) Trapezoidal Parameter-Integrating (TPT) filter replicating the original Roland 80017A chip. Uses an iterative Newton-Raphson solver to compute non-linear OTA saturation. Includes Input Q-Compensation to prevent low-end loss at high resonance."
            : "A 4-pole cascade Zero-Delay Feedback (ZDF) Trapezoidal Parameter-Integrating (TPT) filter replicating the original Roland IR3109 chip. Known for its brighter, aggressive self-oscillation and lack of low-end loss at high resonance compared to later designs."
          ),
        detailsEs: isSuperSix
          ? "Conmutador físico para alternar entre el filtro Roland IR3109 clásico (Juno-6/60) y el más suave 80017A (Juno-106). Emulados circuito a circuito usando resolvedores no lineales y realimentación de retardo cero."
          : (isJ601
            ? "Filtro pasabajo resonante ZDF TPT de 4 polos en cascada que emula el chip Roland 80017A integrado. Implementa un resolvedor interactivo de Newton-Raphson para calcular la saturación física no lineal de los OTAs, manteniendo la respuesta cremosa original."
            : "Filtro pasabajo resonante ZDF TPT de 4 polos en cascada que emula el chip Roland IR3109 discreto. Famoso por su auto-oscilación más agresiva y brillante, con menor pérdida de graves al resonar."
          )
      },
      {
        id: "hpf",
        name: "HPF (High Pass Filter)",
        icon: <Maximize2 className="w-5 h-5" />,
        tagline: isSuperSix
          ? "Barrido continuo + Bass Boost"
          : (isJSix ? "Filtro de barrido continuo y continuo" : "El legendario circuito de posiciones discretas"),
        features: isSuperSix
          ? ["Sweep continuo (38 - 1394 Hz)", "Bass Boost independiente", "Biquad activo conmutable", "Sin pasos rígidos"]
          : (isJSix 
            ? ["Barrido analógico continuo", "Mapeo PCHIP de 11 puntos", "Corte preciso 38Hz - 1.4kHz", "Potenciómetro de carbono"]
            : (isJ06 
              ? ["Bypass plano (Posición 0)", "Posición 1: 122 Hz", "Posición 2: 269 Hz", "Posición 3: 571 Hz"]
              : ["Biquad Active Bass Boost (+10.5 dB)", "Posición 1: Flat lineal", "Posición 2: Corte a 236 Hz", "Posición 3: Corte a 754 Hz"]
            )
          ),
        detailsEn: isSuperSix
          ? "Get the best of both worlds: a continuous high-pass slider (from the Juno-6) paired with a separate toggle for the legendary active Bass Boost (boosting +10.5 dB at 59 Hz from the Juno-106)."
          : (isJSix
            ? "Recreates the continuous analog high-pass slider of the Juno-6. Modulates the passive resistor-capacitor network continuously using an 11-point measured PCHIP interpolation model (from 38.6 Hz up to 1394.2 Hz) instead of fixed steps."
            : (isJ06
              ? "Recreates the 4-position physical selector of the Juno-60. Position 0 is a clean flat bypass (unlike the Juno-106 which boosts bass). Positions 1, 2, and 3 cut at 122 Hz, 269 Hz, and 571 Hz respectively."
              : "A 4-step high-pass filter. Position 0 activates the proprietary Active Bass Boost (an active 2-pole, 2-zero low-shelf biquad filter boosting +10.5 dB at 59 Hz). Positions 1, 2, and 3 provide Flat (no filter), 236 Hz, and 754 Hz cuts."
            )
          ),
        detailsEs: isSuperSix
          ? "El diseño híbrido definitivo: combina un deslizador de barrido continuo de frecuencia (estilo Juno-6) con un interruptor independiente para activar el realce activo de graves (Bass Boost de +10.5 dB a 59 Hz del Juno-106)."
          : (isJSix
            ? "Recrea el deslizador analógico continuo original del Juno-6. Modula la red pasiva RC de forma totalmente fluida, mapeada mediante interpolación PCHIP de 11 puntos medidos en hardware (de 38.6 Hz a 1394.2 Hz)."
            : (isJ06
              ? "Recrea el conmutador físico de 4 posiciones del Juno-60. La posición 0 es un bypass plano (no infla los graves como el 106). Las posiciones 1, 2 y 3 recortan a 122 Hz, 269 Hz y 571 Hz respectivamente."
              : "Filtro pasaltos de 4 posiciones. La posición 0 activa el icónico Bass Boost Activo (un filtro biquad activo de 2 polos y 2 ceros con realce de +10.5 dB a 59 Hz). Las posiciones 1, 2 y 3 proporcionan cortes plano (sin filtro), 236 Hz y 754 Hz."
            )
          )
      },
      {
        id: "adsr",
        name: "ADSR Envelopes",
        icon: <Activity className="w-5 h-5" />,
        tagline: (isJ06 || isJSix) ? "Envolventes analógicas ultrarrápidas" : (isSuperSix ? "Curvas conmutables RC vs. Digital" : "Microcontrolador digital en tiempo real"),
        features: (isJ06 || isJSix)
          ? ["Circuito RC analógico discreto", "Ataque percusivo inmediato", "Descarga hacia -0.1V virtual", "Overshoot del ataque (8%)"]
          : (isSuperSix
            ? ["Selector RC / Digital", "Simulación uPD7811G MCU", "Multiplicación CalcDecay", "Snappy hardware transients"]
            : ["Frecuencia de ticks a 234.2 Hz", "Truncamiento CalcDecay original", "8% Overshoot de transistores", "Interpolación lineal per-sample"]),
        detailsEn: (isJ06 || isJSix)
          ? "Faithful simulation of the discrete analog resistor-capacitor (RC) envelope circuit of the Juno-6/60. Attack charging target is virtualized at 1.2V and discharge targets at -0.1V, achieving incredibly snappy, percussive transients impossible with digital curves."
          : (isSuperSix
            ? "Choose between the percussive, hardware-snappy RC analog curves (Juno-6/60) and the linear, digitally-quantized uPD7811G MCU envelope curves (Juno-106) with authentic 8-bit truncation artifacts."
            : "Emulates the original digital uPD7811G MCU operating at ~234.2 Hz (4.23ms ticks). It implements the exact 'CalcDecay' 8-bit truncated multiplication arithmetic which discards the lowest cross-product, accelerating decay times by 6% like the real hardware."
          ),
        detailsEs: (isJ06 || isJSix)
          ? "Simulación fiel del circuito analógico discreto Resistencia-Condensador (RC) de las envolventes del Juno-6/60. El ataque carga hacia una meta virtual de 1.2V y decae hacia -0.1V, logrando ataques de percusión y pegada inmediata imposibles con curvas digitales."
          : (isSuperSix
            ? "Permite conmutar entre las envolventes analógicas RC percusivas y veloces (Juno-6/60) y las envolventes digitales de rampa lineal y cuantización de 8 bits del microcontrolador uPD7811G (Juno-106)."
            : "Emula el comportamiento del microcontrolador uPD7811G original corriendo a ticks de ~234.2 Hz (periodo de 4.23ms). Implementa la multiplicación truncada de 8 bits 'CalcDecay' original que descarta el producto inferior acelerando el decaimiento un 6% real."
          )
      },
      {
        id: "vca",
        name: "VCA (Voltage Controlled Amplifier)",
        icon: <Volume2 className="w-5 h-5" />,
        tagline: isSuperSix ? "Saturación y simulación de Power Sag" : "Saturación orgánica y caída de tensión",
        features: isSuperSix
          ? ["Curva de transferencia Boaris", "Fuga analógica constante", "Slew analógico de CV", "Simulación de Power Sag"]
          : ["Curva de transferencia Boaris", "Fuga analógica constante", "Slew analógico CV (687 us)", "Simulación de Power Sag"],
        detailsEn: "Dual VCA control modes (Env / Gate). Features the exponential transfer curve mapped from hardware measurements of clone Boaris chips (kVCATableHW), dropping sharply below 10% to cut long decays rhythmically. Simulates passive RC CV slew (687 us) and power supply voltage sag when stacking voices.",
        detailsEs: "Modo de control dual (Envolvente o Gate). Incorpora la curva de transferencia exponencial medida directamente de chips clones Boaris reales (kVCATableHW), cayendo bruscamente por debajo del 10% para cortes secos y rítmicos. Emula el slew analógico del voltaje de control de 687 us y la caída de tensión (Power Sag) de la fuente al acumular voces."
      },
      {
        id: "lfo",
        name: "LFO (Low Frequency Oscillator)",
        icon: <Disc className="w-5 h-5" />,
        tagline: "El modulador maestro unificado",
        features: ["Monofónico para todo el sintetizador", "Velocidad cuantizada por ROM", "Delay de 2 etapas (Holdoff & Ramp)", "Redondeo de pico cúbico"],
        detailsEn: "A global monophonic LFO. Replicates the original uPD7811G firmware ROM speed quantization table (128 discrete steps). Features a two-stage digital delay envelope (silent Holdoff phase followed by a linear Ramp fade-in) and cubic rounding of waveform peaks.",
        detailsEs: "Oscilador de baja frecuencia monofónico global. Recrea la tabla de cuantización de velocidad de 128 pasos de la ROM del uPD7811G original. Cuenta con envolvente de delay de dos etapas (fase silenciosa Holdoff y rampa lineal de entrada Fade-in) y redondeo cúbico de picos de onda."
      },
      {
        id: "chorus",
        name: "Chorus BBD (Bucket-Brigade Delay)",
        icon: <Radio className="w-5 h-5" />,
        tagline: isSuperSix ? "Chorus analógico con control de desgaste" : "El mítico ensanchador estéreo",
        features: isSuperSix
          ? ["Desgaste de chip BBD Wear", "Ruido analógico de soplido (Hiss)", "Transitorios de reloj MN3101", "Resonancia ClickRing"]
          : ["Chips MN3009 y MN3101", "Ruido de fondo analógico (Hiss)", "Pérdidas de eficiencia CTE", "Resonancia de retorno ClickRing"],
        detailsEn: isSuperSix
          ? "Authentic dual BBD chorus MN3009. Adds a dedicated slider to adjust BBD Noise/Wear, letting you control the amount of analog hiss and bucket-brigade degradation, alongside the signature 30Hz cabinet resonance."
          : "Authentic dual-mode BBD chorus. Features MN3009 line delays with active pre/post 9.6 kHz Butterworth filters, MN3101 clock transients (BBDClick), and local PCB resonance (ClickRing at 30 Hz). Emulates Charge Transfer Efficiency (CTE) losses alongside authentic background analog hiss.",
        detailsEs: isSuperSix
          ? "Coro analógico dual MN3009 con un potenciómetro para regular el desgaste de los condensadores internos (BBD Wear/Noise), permitiendo ensuciar o limpiar el siseo y el soplido analógico de fondo a placer."
          : "Chorus BBD analógico de modo dual. Incorpora líneas de retardo MN3009 con filtros biquad Butterworth activos a 9.6 kHz, transitorios de reloj del driver MN3101 (BBDClick) y la resonancia local de placa (ClickRing a 30 Hz). Emula la pérdida de transferencia de carga (CTE Loss) y el siseo analógico de fondo."
      },
      {
        id: "connectivity",
        name: "Fidelidad y Conectividad",
        icon: <FileAudio className="w-5 h-5" />,
        tagline: isJSix 
          ? "Experiencia física sin presets" 
          : (isJ06 
            ? "56 presets analógicos y bus DCB" 
            : (isSuperSix ? "Importador multiformato y RE-201" : "Fidelidad de presets y volcados SysEx")),
        features: isJSix
          ? ["Guardado en proyecto del DAW", "Automatización continua", "Teclado virtual QWERTY", "Sobremuestreo 1x-4x"]
          : (isJ06
            ? ["56 Presets conmutables", "Emulación de puente DCB", "Respaldo de datos FSK", "Classic Hardware Arpeggiator"]
            : (isSuperSix
              ? ["Importador inteligente WAV/SysEx", "Efecto RE-201 integrado", "Arpegiador + Portamento", "Polifonía hasta 16 voces"]
              : ["SysEx bidireccional completo", "Respaldo por cinta FSK", "128 Presets de fábrica", "Teclado virtual QWERTY"]
            )
          ),
        detailsEn: isJSix
          ? "The Juno-6 is purely hands-on; what you see is what you hear. It has no preset memory storage. For DAW integration, parameters are fully automatable, and the plugin state is stored directly within your host DAW project."
          : (isJ06
            ? "Emulates the Juno-60's digital control bus (DCB) bridge and memory storage, featuring 56 selectable patches, tape interface FSK saving/loading (FSK audio data), and the physical arpeggiator clock synchronization."
            : (isSuperSix
              ? "The Super SIX features a Universal Preset Manager that imports classic Tape WAVs, SysEx dumps, CSV libraries, and JSON presets. It integrates a simulated RE-201 Space Delay tape echo and expands voice polyphony up to 16."
              : "Bidirectional SysEx integration for real-time parameter changes (IPR) and library dumps (APR). Features cassette tape storage emulation (FSK wave encoding/decoding), full 128 factory bank recovery, and QWERTY playback keyboard."
            )
          ),
        detailsEs: isJSix
          ? "El Juno-6 es puramente directo; lo que ves en los deslizadores es lo que suena. Carece de memoria de presets en el hardware. Para automatización en el DAW, el estado se guarda directamente dentro de tu proyecto del secuenciador."
          : (isJ06
            ? "Recrea el bus DCB (Digital Communication Bus) del Juno-60 y su sistema de 56 presets de memoria conmutables, además del puerto de carga de datos mediante cinta de cassette codificada en FSK."
            : (isSuperSix
              ? "Super SIX cuenta con un administrador universal de presets que importa archivos de cinta WAV, SysEx del 106/60, CSV y JSON. Integra un eco de cinta RE-201 Space Delay y expande la polifonía de 6 a 16 voces."
              : "Integración SysEx bidireccional para cambios en vivo (IPR) y volcados de librería (APR). Incluye emulación de almacenamiento de datos por cinta (codificador/decodificador de audio FSK) y restauración del banco de 128 presets."
            )
          )
      }
    ];
  };

  const emulatedComponentsList = getComponentsList();
  const activeComp = emulatedComponentsList.find(c => c.id === activeTab) || emulatedComponentsList[0];

  return (
    <div className="pt-16 space-y-8">
      <div className="space-y-4">
        <h2 className="font-headline text-3xl font-black italic uppercase leading-none tracking-tighter">
          Ingeniería de Emulación <span className="text-primary">Componente a Componente</span>
        </h2>
        <p className="text-zinc-400 font-body text-base max-w-3xl leading-relaxed">
          No nos limitamos a aproximar el comportamiento general del sintetizador. Hemos reconstruido y simulado las inercias de la circuitería analógica original y las especificaciones físicas del modelo de hardware seleccionado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Component Tabs List (Left Side) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 h-fit">
          {emulatedComponentsList.map((comp) => {
            const isActive = activeTab === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => setActiveTab(comp.id)}
                className={`text-left p-4 rounded-sm border transition-all duration-300 flex items-center gap-4 group ${
                  isActive 
                    ? "bg-primary/10 border-primary/50 text-white" 
                    : "bg-white/[0.01] hover:bg-white/[0.03] border-white/5 text-zinc-400"
                }`}
              >
                <div className={`p-2 rounded-sm transition-colors ${isActive ? "bg-primary text-white" : "bg-white/5 text-zinc-500 group-hover:text-zinc-300"}`}>
                  {comp.icon}
                </div>
                <div>
                  <span className="font-headline text-xs font-bold uppercase tracking-wider block">
                    {comp.name.split(" (")[0]}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-body block mt-0.5 line-clamp-1">
                    {comp.tagline}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Component Showcase Card (Right Side) */}
        <div className="lg:col-span-7">
          <GlassPanel className="p-8 border-primary/10 bg-white/[0.01] h-full flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 text-primary rounded-sm">
                  {activeComp.icon}
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-black italic uppercase leading-none text-white">
                    {activeComp.name}
                  </h3>
                  <span className="text-xs text-primary font-headline font-bold uppercase tracking-widest mt-1 block">
                    {activeComp.tagline}
                  </span>
                </div>
              </div>

              <p className="text-zinc-300 font-body text-sm leading-relaxed">
                {locale === "es" ? activeComp.detailsEs : activeComp.detailsEn}
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
              <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-zinc-500 block">
                {locale === "es" ? "Características Clave Emuladas" : "Key Emulated Features"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeComp.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/[0.02] p-3 border border-white/5 rounded-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs font-headline font-bold uppercase tracking-wider text-zinc-400">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
