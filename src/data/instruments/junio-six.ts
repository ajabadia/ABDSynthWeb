import type { Instrument } from "./types";

export const junioSix: Instrument = {
  id: "abd-junio-six",
  name: "ABD JUNiO SIX",
  tagline: "Pure Analog Hands-On Experience",
  description: "The raw power of the 1982 classic. Featuring the continuous High Pass Filter and 100% direct analog control without preset memory. Pure hands-on synthesis in its most immediate form.",
  version: "V1.2.0 (Stabilized)",
  image: "/images/instruments/hero_junio_six_render.png",
  category: "Analog",
  price: "Free / Alpha-Beta",
  colors: {
    primary: "#e67e22",
    accent: "#3498db"
  },
  specs: [
    {
      group: "Synthesis Engine",
      items: [
        { label: "Oscillators", value: "Phase-Synced DCO" },
        { label: "HPF", value: "Continuous Sweep" },
        { label: "VCF", value: "IR3109 Emulation" }
      ]
    },
    {
      group: "Performance",
      items: [
        { label: "Polyphony", value: "6 Voices" },
        { label: "Chorus", value: "Dual BBD Modes" },
        { label: "Arpeggiator", value: "Classic Analog Clock" }
      ]
    }
  ],
  signalPath: {
    type: "static",
    nodes: [
      { id: "in", label: "MIDI/Gate", type: "input", description: "Trigger and pitch control." },
      { id: "osc", label: "DCO Engine", type: "oscillator", description: "Pulse/Saw/Sub oscillators." },
      { id: "filter", label: "VCF IR3109", type: "filter", description: "24dB/oct resonant filter." },
      { id: "vca", label: "VCA", type: "vca", description: "Analog level control." },
      { id: "fx", label: "BBD Chorus", type: "fx", description: "Authentic dual-mode chorus." },
      { id: "out", label: "Master Out", type: "output", description: "Final stereo mix." }
    ]
  },
  features: [
    "Continuous HPF Resonant Sweep",
    "Classic Hardware Arpeggiator",
    "Authentic Analog Drift Emulation"
  ]
};
