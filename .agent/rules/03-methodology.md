---
trigger: always_on
---

# 03-methodology.md: Metodología de Ejecución Superpowers

Este módulo define el estándar obligatorio para la orquestación de tareas, asegurando que cada cambio sea deliberado, verificado y documentado.

## ⚖️ LEYES DE HIERRO METODOLÓGICAS

1. **CICLO DE VIDA OBLIGATORIO**: Todo desarrollo debe seguir el flujo:
   - **SPEC**: Definición técnica en `.brain/specs/`.
   - **PLAN**: Descomposición atómica en `.brain/implementation_plan.md`.
   - **EXECUTION**: Implementación táctica con commits (o entregas) atómicos.
   - **VERIFICATION**: Validación contra la SPEC y creación de `walkthrough.md`.

2. **TEST-DRIVEN DEVELOPMENT (TDD)**: La lógica crítica debe ser probada. Si no se puede automatizar fácilmente (UI compleja), se debe documentar el procedimiento de prueba manual.

3. **DOCUMENTACIÓN VIVA**: No se permite que la `SPEC.md` quede desactualizada. Si el plan cambia durante la ejecución, la spec se actualiza primero.

## 🛠️ HERRAMIENTAS DE APOYO

Para cumplir estas reglas, el agente utiliza las skills de `ABDSKILLS`:
- **superpowers-orchestrator**: Para no perder el hilo de las fases.
- **implementation-planning**: Para crear el `task.md`.
- **brainstorming**: Para iterar el diseño antes de tocar código.

## 📋 ENTREGABLES POR TAREA

- **SPEC.md**: Actualizada o nueva.
- **task.md**: Seguimiento de progreso en `.brain/`.
- **walkthrough.md**: Verificación final con evidencias visuales.

---
**Era 1.0** - High Rigor Orchestration
