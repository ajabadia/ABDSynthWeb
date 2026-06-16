import type { Instrument } from "./types";

export const junio06: Instrument = {
  id: "abd-junio-06",
  name: "ABD JUNiO 06",
  tagline: "The Definitive 1982 Vintage Poly",
  description: "The pristine emulation of the 1982 legend. Retaining the fast RC hardware envelopes, IR3109 filter design, 4-step HPF, and classic arpeggiator, combined with 56 preset memories.",
  version: "V1.2.0 (Stabilized)",
  image: "/images/instruments/hero_junio_06_render.png",
  category: "Analog",
  price: "Free / Alpha-Beta",
  colors: {
    primary: "#2ecc71",
    accent: "#9b59b6"
  },
  specs: [
    {
      group: "Synthesis Engine",
      items: [
        { label: "Oscillators", value: "Phase-Synced DCO" },
        { label: "HPF", value: "4-Step Logic" },
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
    "Fast RC Analogue Envelope Curves",
    "Classic Hardware Arpeggiator",
    "56 Factory Presets & DCB Bridge"
  ]
};
