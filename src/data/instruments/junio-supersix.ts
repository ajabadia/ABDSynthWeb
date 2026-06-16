import type { Instrument } from "./types";

export const junioSuperSix: Instrument = {
  id: "abd-junio-supersix",
  name: "ABD JUNiO Super SIX",
  tagline: "The Ultimate Hybrid Juno Engine",
  description: "The ultimate manifestation of the series. An interchangeable modular engine allowing you to swap filters, HPF models, envelope types, and BBD character at will, plus the legendary RE-201 Space Delay.",
  version: "V1.2.0 (Stabilized)",
  image: "/images/instruments/hero_junio_supersix_render.png",
  category: "Analog",
  price: "Free / Alpha-Beta",
  colors: {
    primary: "#1abc9c",
    accent: "#f1c40f"
  },
  specs: [
    {
      group: "Synthesis Engine",
      items: [
        { label: "Oscillators", value: "Non-linear DCO & Drift" },
        { label: "HPF", value: "Continuous + Bass Boost" },
        { label: "VCF", value: "IR3109 / 80017A Selector" }
      ]
    },
    {
      group: "Performance",
      items: [
        { label: "Polyphony", value: "6-16 Voices Expandable" },
        { label: "Chorus", value: "J60 / J106 BBD Wear" },
        { label: "Effects", value: "RE-201 Space Delay" }
      ]
    }
  ],
  signalPath: {
    type: "modular",
    nodes: [
      { id: "in", label: "MIDI/Gate", type: "input", description: "Trigger and pitch control." },
      { id: "osc", label: "DCO / Drift", type: "oscillator", description: "Custom DCO engine with drift." },
      { id: "filter", label: "VCF J60/J106", type: "filter", description: "Conmutable IR3109 / 80017A." },
      { id: "vca", label: "VCA (Env/Gate)", type: "vca", description: "Non-linear exponential VCA." },
      { id: "fx1", label: "BBD Chorus", type: "fx", description: "Chorus MN3009 with noise/wear." },
      { id: "fx2", label: "RE-201 Delay", type: "fx", description: "Classic tape delay emulation." },
      { id: "out", label: "Stereo Out", type: "output", description: "Final master stereo stage." }
    ]
  },
  features: [
    "Modular Section Switching",
    "Simultaneous Arpeggiator & Portamento",
    "RE-201 Space Delay Integration"
  ]
};
