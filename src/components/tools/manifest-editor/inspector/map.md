# Domain: Inspector
Gestión de propiedades y edición detallada de entidades.

## Orquestadores
- [WorkbenchInspector.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/WorkbenchInspector.tsx): Orquestador del panel lateral derecho. Controla la visibilidad y anima la entrada/salida del inspector.
- [PropertyPanel.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/PropertyPanel.tsx): El panel de control principal. Distribuye la edición en secciones lógicas y proporciona la navegación interna del inspector.

## Secciones Técnicas
- [IdentitySection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/IdentitySection.tsx): Metadatos básicos (ID, Label, Versión).
- [ArchitectureSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/ArchitectureSection.tsx): Configuración global del chasis y slots.
- [LogicSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/LogicSection.tsx): Vinculación con parámetros WASM y ruteo de señales.
- [AestheticSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/AestheticSection.tsx): Propiedades visuales generales.
- [SpatialSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/SpatialSection.tsx): Posicionamiento y asignación a contenedores del rack.
- [EngineeringSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/EngineeringSection.tsx): Configuración técnica de bajo nivel.
- [ModulationSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/ModulationSection.tsx): Gestión de ruteos internos.
- [ResourceSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/ResourceSection.tsx): Gestión de activos multimedia.
- [ContainerSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/ContainerSection.tsx): Configuración de las sub-unidades del rack.
- [EntityListSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/EntityListSection.tsx): Listado y gestión rápida.
- [AttachmentsSection.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/AttachmentsSection.tsx): Gestión de etiquetas y accesorios visuales.

## Editores de Propiedades Específicos
- [KnobProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/KnobProperties.tsx)
- [SliderProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/SliderProperties.tsx)
- [PortProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/PortProperties.tsx)
- [LedProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/LedProperties.tsx)
- [SwitchProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/SwitchProperties.tsx)
- [DisplayProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/DisplayProperties.tsx)
- [IllustrationProperties.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/IllustrationProperties.tsx)

## Utilidades de Visualización
- [CellPreview.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/CellPreview.tsx): Miniatura interactiva de la entidad.
- [ArchPreview.tsx](file:///d:/desarrollos/ABDSynthsWeb/abd-ia_synths/src/components/tools/manifest-editor/inspector/ArchPreview.tsx): Previsualización de la arquitectura de slots.
