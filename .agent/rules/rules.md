---
trigger: always_on
---

## 🎯 OBJETIVO

Este documento es el punto de entrada a la gobernanza de **ABDSynthsWeb**. Define el contexto, el stack tecnológico y el mapa de reglas modulares para garantizar una ejecución de élite en el desarrollo de instrumentos virtuales premium.

---

## 📋 INSTRUCCIONES DE SISTEMA

### CONTEXTO DEL PROYECTO

**Proyecto:** Boutique digital de alta fidelidad para la exhibición y gestión de instrumentos virtuales (VST3/AU/CLAP).

**Stack Tecnológico:**
- **Frontend**: Next.js 14/15 (App Router) + TypeScript Strict.
- **Styling**: Tailwind CSS (Modular Architecture) + Framer Motion.
- **Components**: Lucide React + Headless UI.
- **Tooling**: Turbo + NPM.
- **Design Standard**: Uncodixfy (Tech-Noir / Precision Engineering).

---

## 🗺️ MAPA DE REGLAS MODULARES

Para una gobernanza detallada, consulta los siguientes módulos en `.agent/rules/`:

1.  **[00-context.md](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/.agent/rules/00-context.md)**: Visión, Ecosistema y Estándares de Diseño.
2.  **[01-core-code.md](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/.agent/rules/01-core-code.md)**: Estándares de TypeScript, Lógica y Clean Code.
3.  **[02-ui-ux.md](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/.agent/rules/02-ui-ux.md)**: Estética Synth, Micro-animaciones y Uncodixfy.
4.  **[03-methodology.md](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/.agent/rules/03-methodology.md)**: Orquestación Superpowers (Spec -> Plan -> Execution).
5.  **[04-performance.md](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/.agent/rules/04-performance.md)**: Optimización Vercel y Gestión de Assets Pesados.

---

## 🚫 RED FLAGS GLOBALES (RECHAZO INMEDIATO)

❌ **Uso de Castellano (Spanish)** en código (variables, enums, esquemas). El inglés es el estándar técnico.
❌ **Uso de `any`** en cualquier parte del código. Tipado estricto siempre.
❌ **Estética "AI-Generic"**: No a las esquinas redondeadas gigantes (>8px) o gradientes suaves corporativos.
❌ **Duplicación de Código (Anti-DRY)**: Reutilización obligatoria de componentes atómicos.
❌ **Falta de Trazabilidad**: No se permite código sin una SPEC y un PLAN previos en `.brain/`.

---

## 🤖 PROTOCOLO OPERATIVO (AGENT OPS)

1.  **Estructura Brain**: Toda la documentación de planificación (Specs, Planes, Walkthroughs) debe residir en `.brain/`.
2.  **Rigor de Tareas**: Cada tarea del plan debe verificarse antes de pasar a la siguiente.
3.  **Gestión de Fallos**: Ante cualquier error sistémico, activar la skill de `systematic-debugging`.

---

**Vigente**: 28 de abril de 2026  
**Versión**: 1.0 (Synth Precision Era)
