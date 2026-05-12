# Phase 10.2 — Universal Cell Architecture (UCA) Foundation

**Status:** ACTIVE
**Date:** 2026-05-12
**Scope:** OMEGA Manifest Editor
**Related:** OMEGA Phase 10.1C, OMEGA_ENGINEERING_MANIFEST_SPEC, INTEGRATION_BRIEF, src/omega-ui-core/SPEC.md

---

## Objective

Phase 10.2 establishes UCA as the canonical visual data model and formalizes **blueprint compilation** as the path from declarative intent to tree materialization. Blueprints are authored against templates and slots, compiled into OmegaNode trees, and serialized as `.acemm` manifests for rendering and packaging.

---

## The Compilation Pipeline

The transition from intent to serialized instance follows a formal, unidirectional pipeline:

1. **BlueprintDefinition**: High-level declarative intent.
2. **Validation**: Integrity checks against schemas and versioning.
3. **Resolution**: Expansion of `CellTemplates`, slot filling, and default propagation.
4. **OmegaNode Tree**: The concrete, recursive materialization in memory.
5. **Manifest (.acemm)**: The final serialized state, serving as the source of truth for the runtime.
6. **Package (.acepack)**: Distribution bundle containing WASM, Manifest, and Assets.

---

## Operational Rules

### 1. Overrides & Authority
- **Blueprint** defines the "factory defaults" and structural constraints.
- **Manifest (.acemm)** stores the "instance overrides" (e.g., specific knob positions, custom colors).
- **Rule**: Manifest values always take precedence over Blueprint defaults. If a property is defined in both, the Manifest value is the source of truth.

### 2. Template Resiliance
- If a referenced `CellTemplate` is missing from the catalog during resolution:
  - The system must log a **CRITICAL** warning.
  - A **Fallback Cell** (Generic/Error placeholder) must be rendered to prevent tree collapse.
  - The integrity of the rest of the tree must be preserved.

### 3. Versioning Strategy
- **Blueprint Version**: Tracks the evolution of the recipe/intent.
- **Manifest Schema**: Tracks the technical format of the `.acemm` file.
- **Rule**: Blueprints and Manifests are versioned independently. The Bridge must handle cross-version resolution (e.g., applying an older blueprint to a newer schema).

---

## Principles

1. **Tree is source of truth.**
   - The manifest uses `tree` as the canonical structure.
   
2. **Cell is the universal unit.**
   - Everything visible is modeled as a Cell or a Cell-like node.

3. **Rack, Face, Container, and Cell are all nodes.**
   - Recursive structure where role defines behavior.

---

## Core Definitions

### OmegaNode
The concrete unit of composition.
- `id`, `kind`, `role`, `cellRef?`, `bind?`, `pos?`, `size?`, `style?`, `children?`.

### CellTemplate
Reusable catalog piece with default layers, style tokens, and asset references.

### BlueprintDefinition
Authoring artifact with slots, placeholders, and structural intent.

---

## Bridge Contract

The `ucaBridge.ts` serves as the formal gateway for data transformation:
- `blueprintToTree(blueprint, context) -> OmegaNode`: Compiles intent into structure.
- `manifestToOmegaTree(manifest) -> OmegaNode`: Migrates legacy data into UCA.
- `omegaTreeToManifest(tree) -> OMEGA_Manifest`: Serializes UCA into the manifest format.

---

## Phase Scope

### Deliverables
- **Foundation**: `OmegaNode`, `CellTemplate`, `BlueprintDefinition` interfaces.
- **Source of Truth**: Implementation of `manifest.ui.tree`.
- **Bridge Engine**: `ucaBridge.ts` (Compilers & Migrators).
- **Runtime**: `UniversalRenderer.tsx` (Recursive traversal).
- **Feature Flag**: `ui.useUCA` for side-by-side verification.

### Not in scope
- Blueprint Studio UI (Future Authoring Interface).
- Real-time legacy array syncing (One-way migration only).
- Packaging automation.