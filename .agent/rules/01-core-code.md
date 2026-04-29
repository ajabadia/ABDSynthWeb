---
trigger: always_on
---

# 01-core-code.md: Estándares de Código y Lógica

Este módulo garantiza la robustez y mantenibilidad del código mediante el uso estricto de TypeScript y patrones de ingeniería modernos.

## ⚖️ LEYES DE HIERRO DE CÓDIGO

1. **TYPESCRIPT STRICT**: No se permiten `any`, `unknown` sin validación, ni elusión de tipos mediante `// @ts-ignore`.
2. **CLEAN CODE**: Funciones pequeñas (< 30 líneas) con una única responsabilidad.
3. **ZERO BARREL IMPORTS**: Prohibido el uso de archivos `index.ts` que re-exportan carpetas enteras. Importa directamente del archivo fuente para optimizar el tree-shaking y la velocidad de build.
4. **ZOD VALIDATION**: Todos los inputs de formularios o datos provenientes de fuentes externas deben ser validados con esquemas `Zod`.

## 🛠️ PATRONES DE IMPLEMENTACIÓN

- **Server Components por Defecto**: Mantener la lógica de negocio en RSC (React Server Components) siempre que sea posible.
- **Client Components Granulares**: Solo usar `"use client"` para interactividad (knobs, sliders, visualizadores).
- **Separación de Lógica**: La lógica de procesamiento de señales (DSP) o cálculos complejos debe residir en `src/lib` y ser puramente funcional.

## 🚫 PROHIBICIONES

- Prohibido el uso de librerías de componentes masivas (MUI, Chakra) que rompan la estética premium. Preferir Tailwind + componentes propios.
- Prohibido dejar comentarios TODO en el código. Si falta algo, debe ir al `task.md`.
- Prohibido el uso de variables globales de estado (Redux, Context) si se puede resolver con `URL SearchParams` o paso de props.

---
**Era 1.0** - Engineering Excellence
