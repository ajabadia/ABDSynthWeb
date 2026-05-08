# Universal Cell Architecture (UCA)

## Overview
The Universal Cell Architecture (UCA) transitions the OMEGA Manifest from a flat, attachment-based structure to a hierarchical, recursive tree of "Cells". This unifies all visual elements into a single, composable contract.

## Key Concepts

### 1. The Tree Model
Everything in the OMEGA UI is a `Node`. A node can be a Rack, a Face, a Container, or a Cell.
Nodes are recursive: a Cell can contain other Cells (Layers).

### 2. Taxonomy
- **Rack**: The top-level module unit.
- **Face**: A physical or logical plane of the module (e.g., MAIN, REAR, FX).
- **Container / Group**: A logical grouping of elements with its own coordinate system.
- **Cell**: The universal atomic unit. Can be a simple control (Knob) or a complex composite (ADSR).

### 3. Node Contract (`OmegaNode`)
Each node in the tree follows a common contract:
- `id`: Unique identifier.
- `kind`: Structural category (`rack` | `face` | `container` | `cell` | `layer`).
- `role`: Functional purpose (`control` | `telemetry` | `decor` | `io`).
- `cellRef`: Reference to a `CellTemplate` in the library.
- `pos` / `size`: Relative spatial coordinates.
- `style`: Aesthetic overrides.
- `children`: Array of child nodes.

### 4. Cell Templates vs. Instances
- **CellTemplate**: A reusable blueprint in the Catalog. Defines default layers, interaction rules, and capabilities.
- **CellInstance (OmegaNode)**: A concrete usage of a template within a manifest, containing specific bindings and positioning.

## Structural Comparison

### Legacy (Flat)
```json
{
  "controls": [
    { "id": "cutoff", "type": "knob", "container": "vcf_section" }
  ],
  "layout": {
    "containers": [
      { "id": "vcf_section", "pos": { "x": 10, "y": 10 } }
    ]
  }
}
```

### UCA (Hierarchical)
```json
{
  "tree": {
    "kind": "rack",
    "children": [
      {
        "id": "main_face",
        "kind": "face",
        "children": [
          {
            "id": "vcf_section",
            "kind": "container",
            "pos": { "x": 10, "y": 10 },
            "children": [
              {
                "id": "cutoff",
                "kind": "cell",
                "cellRef": "moog_knob_01",
                "bind": "vcf.cutoff"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Migration Strategy
1. **Stabilization**: Ensure zero-noise `tsc` and `eslint` on the current flat model.
2. **Phase 1 (Additive)**: Introduce `OmegaNode` types and documentation.
3. **Phase 2 (Conversion)**: Implement `manifestToTree` and `treeToManifest` bidirectional converters.
4. **Phase 3 (Experimental)**: Build a recursive `UniversalRenderer` that works in parallel with the legacy renderer.
5. **Phase 4 (Transition)**: Switch the workbench viewport to UCA and deprecate legacy arrays.

## Benefits
- **Composability**: Create complex controls (like a multi-stage envelope) by nesting cells.
- **Encapsulation**: Styles and assets are bundled at the cell level.
- **Clean Bindings**: Clear hierarchy for signal routing and modulation.
- **Portability**: .acepack generation becomes a simple tree traversal.
