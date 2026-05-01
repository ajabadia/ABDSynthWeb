# OMEGA Engineering Manifest Specification (Era 7.1)

Este documento detalla las especificaciones técnicas para la construcción de módulos industriales bajo el estándar **OMEGA Era 7.1 (Industrial Hardening)**.

## 1. The Rack (Global Container)
El Rack define las dimensiones físicas y el estilo visual del módulo.

| Propiedad | Tipo | Opciones / Rango | Descripción |
| :--- | :--- | :--- | :--- |
| `hp` | Number | 4, 6, 8, 12, 16, 24... | Ancho industrial en HP. 1 HP ≈ 15px en este motor. |
| `dimensions` | Object | `{ width, height }` | Definición de píxeles reales. Autoridad sobre `hp` en el renderizado. |
| `skin` | Enum | `carbon`, `industrial`, `glass`, `minimal` | Estética del panel frontal. |
| `grid_snap` | Number | 1, 2, 5, 10 | Paso de rejilla para el snapping. |

---

## 2. The Cells (Registry Entities)
Las Cells son las entidades registradas en el motor. **IMPORTANTE**: El `id` debe ser un STRING (ej: `lfo_freq`).

### Roles del Registry (Era 7.1)
Cada Cell debe tener un `role` definido para que el motor WASM identifique su función:
- `control`: Input de usuario (Knobs, Sliders, Switches).
- `telemetry`: Feedback visual (LEDs, Displays pasivos).
- `stream`: Datos de audio o CV de alta velocidad (Ports).
- `mod_target`: Destino de modulación explícito.

### Pestañas Canónicas (Tabs)
La organización multi-capa se rige por estas pestañas:
- `MAIN`: Controles principales de síntesis.
- `FX`: Parámetros de efectos y post-procesado.
- `EDIT`: Configuración profunda y sistema.
- `MIDI`: Mapeos y ajustes de protocolo.
- `MOD`: Matriz de modulación y ruteo interno.

### Tipos de Componente (Core)
| Tipo | Opciones Particulares | Descripción |
| :--- | :--- | :--- |
| `knob` | `variant_labels` | Giro continuo o por pasos. |
| `display` | **Integrated Stepper** | Pantalla con botones `+`/`-` integrados. |
| `select` | `options`, `lookup` | Selector de lista o tabla del motor. |
| `slider-v/h` | `travel_length` | Faders de recorrido variable (A: 100mm, B: 30mm). |
| `port` | `role: stream` | Punto de parcheo físico. |

---

## 3. Attachments (Visual Fragments)
Los Attachments son accesorios visuales con **Precisión Dual (X/Y)**.

- **`offsetX / offsetY`**: Desplazamiento fino en píxeles relativo al Core.
- **`type: stepper`**: *Deprecated*. Usar el componente core `display` para controles de paso integrados.
- **`type: label`**: Serigrafía técnica con soporte de `role: unit`.

---

## 4. Naming Convention (Estética)
Las variantes deben seguir el patrón: `[SIZE]_[STYLE/COLOR]`.
- Ejemplos: `A_red`, `B_cyan`, `C_silver_3mm`.
- *Evitar nombres genéricos como "default" o "standard".*

---

## 5. Technical Handshake (Contract Sync)
La sincronización entre la UI y el motor WASM se rige por el contrato técnico:
- **`bind`**: Debe coincidir exactamente con los IDs exportados por el hook `omega_get_contract` del binario.
- **`precision`**: El motor industrial utiliza por defecto 6 decimales para cálculos internos y 2 para el readout de la UI.
- **Source of Truth (SOT)**: El archivo `.acemm` es la autoridad estética, mientras que el binario `.wasm` es la autoridad lógica.

---

## 6. Governance ERA 4 (Hardening)
Para cumplir con el Mandato Guardián V3, todo manifiesto debe ser:
- **Strictly Typed**: No se permiten campos "ad-hoc" fuera de la especificación.
- **String ID Authority**: Los IDs numéricos son volátiles; el sistema de ingeniería utiliza Strings persistentes para toda la cadena de suministro de datos.
- **Registry Validated**: Todo componente sin un `role` válido será marcado como `orphan` y no recibirá eventos del motor.

---
*OMEGA — Engineering Standard V7.1 — Industrial Governance ERA 4 — SYS_READY*
