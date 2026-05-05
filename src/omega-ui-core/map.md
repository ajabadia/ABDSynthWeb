# OMEGA UI Core — Architecture Map (Era 7.2.3)

> **Status**: INDUSTRIALIZED (SYS_READY)
> **Role**: Stateless Rendering Engine & Design System
> **Standard**: OMEGA-VPC-1.1 (Visual Parity Contract)

## 1. System Overview (Mermaid)

```mermaid
graph TD
    %% Entry Point
    INDEX[index.css] --> TOKENS[tokens/]
    INDEX --> PRIMS[primitives/]
    INDEX --> LAYOUT[layout/]
    
    %% Design Tokens
    TOKENS --> VARS[vars.css - Colores/Fuentes]
    TOKENS --> SIGS[signals.css - I/O Colors]
    TOKENS --> SKINS[skins.css - Panel Textures]
    
    %% Rendering Engine (Aseptic)
    CR[CellRenderer.ts] --> AR[AttachmentRenderer.ts]
    CR --> KR[KnobRenderer.ts]
    CR --> PR[PortRenderer.ts]
    CR --> SR[SliderRenderer.ts]
    CR --> DR[DisplayRenderer.ts]
    
    %% Styles Integration
    KR -.-> PK[knob.css]
    PR -.-> PP[port.css]
    SR -.-> PS[slider.css]
    DR -.-> PD[display.css]
    
    %% Consumer Layer
    CR --> RE[RackEntity.tsx]
    CR --> CP[CellPreview.tsx]
```

## 2. Directory Structure

### 2.1 `renderers/` (TypeScript)
Stateless functions that generate HTML strings. 
- **CellRenderer**: The main orchestrator. Handles coordinate scaling (1.5x) and attachment stacking.
- **AttachmentRenderer**: Handles orbital labels, LEDs, and steppers.
- **Primitve Renderers**: Specialized logic for each industrial control type.

### 2.2 `tokens/` (CSS)
The Single Source of Truth for visual constants.
- **vars.css**: Unified color palette (`--wb-primary`, `--wb-accent`).
- **skins.css**: Texture definitions (Carbon, Glass, Industrial) using CSS Gradients (No PNGs).

### 2.3 `primitives/` (CSS)
Component-specific styles. Pure CSS, no Tailwind.
- Uses the `{SIZE}_{COLOR}` naming convention (e.g., `.knob-container.size-B.color-cyan`).

### 2.4 `layout/` (CSS)
Architectural frame styles.
- **cells.css**: Grid positioning and attachment stack containers.
- **screws.css**: High-fidelity industrial screws.

## 3. Industrial Standards
- **Parity**: Any HTML generated here MUST render identically in the production engine (C++).
- **Scale**: All offsets and dimensions are multiplied by **1.5x** for high-DPI visual comfort.
- **Aseptic**: No React dependencies. Portability is key.

## 4. Legacy Archive
- **DEPRECATED**: `_legacy/primitives/` in the tool folder contains the old React components that have been replaced by this aseptic engine.
