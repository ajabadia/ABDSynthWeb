# OMEGA Technical Brief: Asset Portability (Phase 13)
**Target Project**: ABDOmega Engine / Host UI
**Standard**: Era 7.2.3 Compliance

## 1. El Nuevo Paradigma: "Assets Portátiles"
Hasta ahora, ABDOmega buscaba las ilustraciones en una ruta global:
`ui/assets/modules/{id}/illustration.svg`

A partir de la **Fase 13**, el ecosistema OMEGA pasa a un modelo de recursos locales para garantizar que un módulo sea un paquete único y portátil.

## 2. Instrucciones de Implementación para ABDOmega

### A. Nueva Lógica de Resolución de Iconos
Cuando el motor descubra un módulo, el componente `ModuleBrowser` debe seguir este orden de prioridad para la miniatura:
1.  **Local Asset**: Buscar `./module_logo.svg` en la carpeta donde reside el `.wasm`.
2.  **Manifest Link**: Leer `metadata.icon` del archivo `.acemm`. Si es un ID de asset, resolverlo mediante el catálogo `resources.assets`.
3.  **Legacy Fallback**: Si nada de lo anterior existe, usar la ruta global antigua `ui/assets/modules/{id}/illustration.svg`.

### B. Soporte para el Componente `illustration`
El renderizador de ABDOmega debe reconocer el componente `illustration` en el manifiesto. 
-   **Acción**: Debe inyectar un tag `<img>` en el rack.
-   **Source**: El atributo `src` debe resolverse llamando a una nueva función interna (ej: `getModuleAssetURL(assetId)`), que convierta el ID del manifiesto en una ruta de archivo local válida para el navegador.

### C. Mapeo de Filmstrips (Knobs)
Para los Knobs con textura, el motor debe:
1.  Detectar si el componente tiene un `asset` vinculado.
2.  Si existe, calcular el offset de CSS `background-position` basándose en el valor del parámetro (0.0 a 1.0) y el número de `frames` especificado en el catálogo de assets del manifiesto.

## 3. Beneficios para el Usuario
-   **Zero Setup**: Al arrastrar un `.zip` o `.acepack` al host, el logo y las ilustraciones aparecen instantáneamente sin necesidad de copiar archivos manualmente a carpetas del sistema.
-   **Branding Dinámico**: Los desarrolladores pueden actualizar su logo simplemente cambiando el SVG en su carpeta de proyecto.

---
> [!IMPORTANT]
> Se recomienda que ABDOmega implemente un **Sanitizer de SVG** similar al del editor para evitar que SVGs mal formados rompan el layout del rack.
