# OMEGA Technical Brief: Visualizers Integration (Scope & Terminal)
**Target Project**: ABDOmega (C++/JUCE / WebView)  
**Standard**: OMEGA Era 7.2.3 — Visual Parity Contract (VPC)

## 1. Sincronización de Estilos
El motor de renderizado de ABDOmega debe consumir el paquete `omega-ui-core`.
- **Acción**: Copiar `ABDSynthsWeb/src/omega-ui-core/` a la carpeta de recursos de la UI de ABDOmega.
- **Importante**: No modificar los archivos en ABDOmega; cualquier cambio estético debe hacerse en `omega-ui-core` para mantener la paridad.

## 2. Estructura HTML Requerida (Renderer)

Para que los estilos se apliquen correctamente, el `module_renderer.ts` (o equivalente en ABDOmega) debe generar la siguiente estructura:

### 2.1 Para el SCOPE (Osciloscopio)
```html
<div class="scope-display variant-${variant}" 
     style="--scope-width: ${w}px; --scope-height: ${h}px; --scope-color: ${color};">
    <canvas class="scope-canvas" width="${w}" height="${h}"></canvas>
    <div class="scope-grid"></div>
</div>
```

### 2.2 Para la TERMINAL (Monitor)
```html
<div class="terminal-display variant-${variant}" 
     style="--terminal-width: ${w}px; --terminal-height: ${h}px; color: ${color}; font-family: ${font};">
    <div class="terminal-container">
        <!-- Las líneas se inyectan dinámicamente -->
        <div class="terminal-line">> ${message}</div>
    </div>
</div>
```

## 3. Protocolo de Datos (WASM -> UI)

### 3.1 Scope (Streaming de Señal)
- **Frecuencia**: Se recomienda 60 Hz.
- **Datos**: El módulo WASM debe exponer un buffer circular (ej. `float*`).
- **Bridge**: La UI debe llamar a una función que recupere este buffer (ej. `omega_get_scope_buffer(bindId)`) y dibujarlo en el Canvas.
- **Normalización**: Los datos deben estar en el rango `[-1, 1]`.

### 3.2 Terminal (Streaming de Eventos)
- **Frecuencia**: Bajo demanda (cuando ocurre el evento).
- **Datos**: Strings (JSON o texto plano).
- **Bridge**: El motor debe emitir un evento que la UI escuche (ej. `omega_on_terminal_log(bindId, message)`).
- **Buffer**: La UI debe mantener un buffer de ~50 líneas para evitar degradación de rendimiento.

## 4. Propiedades del Manifiesto (.acemm)
El motor de ABDOmega debe ser capaz de parsear estas nuevas propiedades en el bloque `presentation`:
- `color`: Hexadecimal (ej. `#00ff88`).
- `font`: Nombre de la fuente (ej. `'Fragment Mono'`).
- `size.w` / `size.h`: Dimensiones en píxeles.

---
*Este contrato asegura que cualquier módulo diseñado en el editor se vea y funcione de forma idéntica en el motor de producción.*
