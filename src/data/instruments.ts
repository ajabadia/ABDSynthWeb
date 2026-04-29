export interface Instrument {
  id: string;
  name: string;
  tagline: string;
  description: string;
  version: string;
  image: string;
  gallery?: {
    url: string;
    caption?: string;
    description?: string;
  }[];
  category: "Analog" | "Digital" | "Modular" | "Neural";
  price: string;
  colors: {
    primary: string;
    accent: string;
  };
  specs: {
    group: string;
    items: {
      label: string;
      value: string;
    }[];
  }[];
  signalPath: {
    type: "static" | "modular";
    nodes: {
      id: string;
      label: string;
      type: "input" | "oscillator" | "filter" | "vca" | "fx" | "output" | "matrix";
      description?: string;
    }[];
  };
  features: string[];
}

export const instruments: Instrument[] = [
  {
    id: "abd-junio-601",
    name: "ABD JUNiO 601",
    tagline: "Authentic 80017A VCF/VCA Emulation",
    description: "The definitive restoration of the 1984 legend. Meticulously modeled circuit-by-circuit, featuring the unique 4-step HPF logic and dual-mode BBD chorus with authentic background hiss.",
    version: "V1.2.0 (Stabilized)",
    image: "/images/instruments/hero_junio_601_render.png",
    category: "Analog",
    price: "Free / Alpha-Beta",
    colors: {
      primary: "#cf3838",
      accent: "#60a8d6"
    },
    specs: [
      {
        group: "Synthesis Engine",
        items: [
          { label: "Oscillators", value: "Phase-Synced DCO" },
          { label: "HPF", value: "4-Step Logic" },
          { label: "VCF", value: "80017A Emulation" }
        ]
      },
      {
        group: "Performance",
        items: [
          { label: "Polyphony", value: "6 Voices" },
          { label: "Chorus", value: "Dual BBD Modes" },
          { label: "MIDI", value: "SysEx / CC Mapping" }
        ]
      }
    ],
    signalPath: {
      type: "static",
      nodes: [
        { id: "in", label: "MIDI/Gate", type: "input", description: "Trigger and pitch control." },
        { id: "osc", label: "DCO Engine", type: "oscillator", description: "Pulse/Saw/Sub oscillators." },
        { id: "filter", label: "VCF 80017A", type: "filter", description: "24dB/oct resonant filter." },
        { id: "vca", label: "VCA", type: "vca", description: "Analog level control." },
        { id: "fx", label: "BBD Chorus", type: "fx", description: "Authentic dual-mode chorus." },
        { id: "out", label: "Master Out", type: "output", description: "Final stereo mix." }
      ]
    },
    features: [
      "SysEx Roland Protocol Support",
      "Tape Simulation (FSK Data)",
      "Authentic Test Mode Diagnostic"
    ]
  },
  {
    id: "abd-omega",
    name: "ABD OMEGA",
    tagline: "System Under Construction",
    description: "The next generation of modular synthesis is currently in the laboratory. Omega is undergoing deep structural calibration for the Era 6.2 deployment. Access is currently restricted to core engineers.",
    version: "ERA 6.2_DEV",
    image: "/images/instruments/hero_omega_render.png",
    category: "Modular",
    price: "Free / Alpha-Beta",
    colors: {
      primary: "#00f2ff",
      accent: "#ffaa00"
    },
    specs: [
      {
        group: "Modular Architecture",
        items: [
          { label: "Patchbay", value: "Matrix 2.0 Hub" },
          { label: "Engine", value: "Stateless Aseptic" },
          { label: "Routing", value: "Zero-Latency Virtual" }
        ]
      },
      {
        group: "DSP Foundation",
        items: [
          { label: "Precision", value: "64-bit Double" },
          { label: "Sample Rate", value: "Up to 192kHz" },
          { label: "Platform", value: "Era 6 Standard" }
        ]
      }
    ],
    signalPath: {
      type: "modular",
      nodes: [
        { id: "m1", label: "Matrix In 1", type: "matrix", description: "Input stage alpha." },
        { id: "m2", label: "Matrix In 2", type: "matrix", description: "Input stage beta." },
        { id: "hub", label: "Patchbay Hub", type: "matrix", description: "Dynamic routing matrix." },
        { id: "proc1", label: "Engine A", type: "oscillator", description: "Primary synthesis engine." },
        { id: "proc2", label: "Engine B", type: "oscillator", description: "Secondary synthesis engine." },
        { id: "out", label: "Unified Out", type: "output", description: "Consolidated signal output." }
      ]
    },
    features: [
      "Universal Command Dispatcher",
      "Dynamic AceCatalog Packs",
      "Real-time Telemetry Visualization"
    ]
  },
  {
    id: "abd-neuronik",
    name: "NEURONiK",
    tagline: "64-Partial Additive Hybrid Engine",
    description: "Sonic matter sculpting through neural-inspired synthesis. NEURONiK uses a 64-partial additive resonator to blend harmonic models and manipulate timbre through inharmonicity and entropy.",
    version: "V1.0.4 (Experimental)",
    image: "/images/instruments/hero_neuronik_render.png",
    gallery: [
      { url: "/images/instruments/neuro001.png", caption: "Additive Engine", description: "64-Partial harmonic resonator control panel." },
      { url: "/images/instruments/neuro002.png", caption: "Spectral Morphing", description: "Real-time blending between Model A and Model B." },
      { url: "/images/instruments/neuro003.png", caption: "Matter Sculpting", description: "Advanced controls for Inharmonicity and Entropy." },
      { url: "/images/instruments/neuro004.png", caption: "Modulation Matrix", description: "Neural-inspired routing for complex movement." },
      { url: "/images/instruments/neuro005.png", caption: "Filter Section", description: "Surgical precision filtering and tone shaping." },
      { url: "/images/instruments/neuro006.png", caption: "Master Output", description: "Final stage processing and level management." }
    ],
    category: "Neural",
    price: "Free / Alpha-Beta",
    colors: {
      primary: "#ca00ff",
      accent: "#39ff14"
    },
    specs: [
      {
        group: "Neural Synthesis",
        items: [
          { label: "Additive Engine", value: "64-Partial" },
          { label: "Morphing", value: "Model A/B Spectral" },
          { label: "Resonator", value: "Physical Matter Mode" }
        ]
      },
      {
        group: "Control System",
        items: [
          { label: "MPE", value: "Full Support" },
          { label: "DSP", value: "Zero-Alloc C++20" },
          { label: "Mapping", value: "Neural MIDI CC Hub" }
        ]
      }
    ],
    signalPath: {
      type: "static",
      nodes: [
        { id: "midi", label: "Neural Input", type: "input", description: "MPE and CC mapping hub." },
        { id: "res", label: "Resonator", type: "oscillator", description: "64-Partial additive engine." },
        { id: "morph", label: "Morpher", type: "fx", description: "Spectral model blending." },
        { id: "matter", label: "Matter Sculpt", type: "filter", description: "Inharmonicity sculpting." },
        { id: "filter", label: "Precision Filter", type: "filter", description: "Dynamic spectral filtering." },
        { id: "out", label: "Neural Out", type: "output", description: "Master signal distribution." }
      ]
    },
    features: [
      "Inharmonicity Matter Sculpting",
      "Entropy & Roughness Controls",
      "Flexible MIDI CC Mapping Hub"
    ]
  }
];
