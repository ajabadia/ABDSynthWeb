# ABD Virtual Instruments: Aseptic Synthesis Research Lab

![ABD Virtual Instruments Banner](/public/images/instruments/hero_junio_601_render.png)

## Overview
ABD Virtual Instruments is a next-generation platform for high-fidelity digital synthesis and hardware emulation. Built with an "Anti-AI" industrial aesthetic, the platform prioritizes precision, character, and boutique engineering.

This repository hosts the web interface, instrument catalog, and the communication terminal for the ABD research lab.

## Key Features

### 🔬 Industrial 3D Showcase
- **Cinematic Renders**: Professional studio-grade 3D renders for every instrument.
- **Dynamic Render Engine**: A custom React component that automatically detects and cycles through available 3D views (Front, Diagonal, Top, Rear) with smooth cross-fades and telemetrical overlays.
- **High-Key & Low-Key Modes**: Optimized for dark and light industrial themes.

### 🌍 Global Localization (i18n)
- **Full Bilingual Support**: Seamless switching between English and Spanish.
- **Namespace Architecture**: Optimized translation loading using `next-intl`.
- **Rich Text Support**: Preserves industrial formatting and highlighting across languages.

### 🛡️ Secure Communication
- **Contact Terminal**: A hardened communication interface with built-in math challenge verification.
- **Serverless Dispatch**: Live email transmission powered by the **Resend API**.
- **Diagnostic Logging**: Server-side telemetry for monitoring dispatch health.

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)
- **Email Engine**: [Resend](https://resend.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Tailwind CSS & Modern Industrial CSS variables.

## Project Structure
```text
/app/[locale]     # i18n-ready App Router
/messages         # Translation dictionaries
/public/images    # 4K Textures and 3D Renders
/src/components   # High-end boutique UI components
/src/data         # Instrument metadata and specs
/docs             # Visual Style Guides and Rendering Manuals
```

## Getting Started

1. **Clone and Install**:
   ```bash
   git clone https://github.com/ajabadia/ABDSynthWeb.git
   cd ABDSynthWeb
   npm install
   ```

2. **Environment Setup**:
   Create a `.env` file with your Resend credentials:
   ```env
   RESEND_API_KEY="re_..."
   RESEND_FROM_EMAIL="Your Lab <noreply@resend.dev>"
   ```

3. **Run Laboratory**:
   ```bash
   npm run dev
   ```

## Development Standards
All visual assets must adhere to the [Visual Style Guide](docs/VISUAL_STYLE_GUIDE.md) and the [Studio Render Guide](docs/STUDIO_RENDER_GUIDE.md).

---
© 2026 / **ABD Virtual Instruments** / Global Digital Matrix
