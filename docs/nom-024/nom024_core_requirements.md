## Scope note
This document represents the technical interpretation of NOM-024-SSA3-2012
for Phase 1 (data standardization and structure) only.
Security, SGSI and traceability details are addressed in later phases.

Esta especificación técnica sintetiza los requisitos de la **NOM-024-SSA3-2012** para el diseño de arquitectura y backend de un SIRES.

### 1. Principios técnicos obligatorios para todo SIRES

Reglas transversales de arquitectura y seguridad:

*   **Estructura de Datos:** El sistema debe capturar, manejar e intercambiar información **estructurada** e integrada. No es admisible el almacenamiento exclusivo en formatos no procesables (imágenes o texto libre sin metadatos) para la información clínica o administrativa clave,.
*   **Conservación y Disponibilidad:** La arquitectura debe garantizar que los datos permanezcan íntegros, confiables y disponibles a través del tiempo, implicando estrategias de respaldo y recuperación ante desastres,.
*   **Seguridad (CIA + Trazabilidad):**
    *   **Autenticación:** Todo acceso (usuario, organización o dispositivo) debe ser autenticado. Mínimo: Usuario + Contraseña. Se recomienda MFA,.
    *   **Autorización:** Control de acceso basado en roles (RBAC).
    *   **Trazabilidad (Audit Logs):** Se debe mantener un registro de auditoría cronológico que permita reconstruir fielmente la información a estados anteriores y asociar inequívocamente cada acción a un individuo,,.
*   **Exportabilidad:** El backend debe exponer funcionalidad para exportar la información del paciente (portabilidad de datos) siguiendo las Guías de Intercambio.

### 2. Requisitos técnicos sobre información clínica

Implicaciones para el modelo de datos clínico y almacenamiento:

*   **Inmutabilidad del Registro:** La información derivada de la prestación de servicios debe registrarse como **documentos electrónicos estructurados e inalterables**,.
    *   *Implicación Backend:* Una vez cerrada/firmada una nota o evento clínico, el registro en base de datos no debe modificarse (UPDATE). Las correcciones deben manejarse como nuevos registros (append-only) o versionado que preserve el historial completo.
*   **Integridad:** Se debe garantizar que la información no ha sido alterada salvo por fuentes de confianza.
*   **Firma Electrónica:** El sistema debe soportar la implementación de **Firma Electrónica Avanzada** para los profesionales de la salud, vinculando criptográficamente al autor con el documento clínico,.

### 3. Identificación de personas (Visión NOM)

Requisitos estrictos para la tabla/entidad `Paciente`:

*   **Identificador Único:** La **CURP** (validada por RENAPO) es el atributo obligatorio de identificación única.
*   **Restricción Crítica:** El software **NO debe autogenerar la CURP**. Debe recibirla o validarla, pero nunca calcularla por sí mismo para asignarla.
*   **Atributos Mínimos Persistentes (Tabla de Pacientes):**
    El backend debe soportar y validar los siguientes campos obligatorios para intercambio-:

| Campo | Tipo / Formato | Validación / Regla |
| :--- | :--- | :--- |
| **CURP** | Alfanumérico (18) | Formato oficial RENAPO. |
| **Nombre(s)** | Alfanumérico (50) | Mayúsculas, sin abreviaturas. |
| **Primer Apellido** | Alfanumérico (50) | Mayúsculas, sin abreviaturas. |
| **Segundo Apellido** | Alfanumérico (50) | Opcional. |
| **Fecha Nacimiento** | Numérico (8) | Formato `AAAAMMDD`. |
| **Sexo** | Alfabético (1) | Catálogo: `H` (Hombre), `M` (Mujer). |
| **Entidad Nacimiento** | Alfanumérico (2) | Catálogo INEGI. `NE` (Extranjero), `00` (No disponible). |
| **Nacionalidad** | Alfanumérico (3) | Catálogo RENAPO. `NND` (No disponible). |
| **Domicilio (Geo)** | Entidad (2), Mun (3), Loc (4) | Catálogos INEGI. |
| **Folio Interno** | Alfanumérico (18) | Identificador propio de la institución (ID local). |

### 4. Uso de catálogos fundamentales

El sistema debe integrar y validar contra los siguientes catálogos maestros ("Master Data"). No se permite texto libre para estos conceptos en el intercambio,-:

1.  **Establecimientos:** Catálogo CLUES (DGIS). Clave única de 11 dígitos.
2.  **Geográficos:** Entidades, Municipios y Localidades (INEGI).
3.  **Diagnósticos:** CIE (Clasificación Internacional de Enfermedades - OMS/CEMECE).
4.  **Procedimientos:** CIE-9-MC / CPT (según versión oficial vigente CEMECE).
5.  **Medicamentos e Insumos:** Cuadro Básico y Catálogo de Insumos (Consejo de Salubridad General).
6.  **Discapacidad/Funcionamiento:** CIF (Clasificación Internacional del Funcionamiento).
7.  **Otros:** Lenguas Indígenas, Religión, Ocupación (INEGI), Nacionalidad (RENAPO).

*Implicación Técnica:* Se requiere un servicio o módulo de gestión de catálogos que permita actualizaciones periódicas sin romper la integridad referencial de los registros históricos.

### 5. Interoperabilidad técnica (Alto nivel)

*   **Estándares Base:** La arquitectura debe soportar estándares internacionales como **HL7 V3**, **HL7 CDA** (Clinical Document Architecture) y **XML**.
*   **Perfiles de Integración:** El diseño debe alinearse con perfiles de **IHE** (Integrating the Healthcare Enterprise) según determine la Secretaría.
*   **Mecanismo de Definición:** La NOM establece el *qué* (interoperar) y el *con qué* (estándares), pero delega la estructura específica del payload (JSON/XML exacto) a las **Guías de Intercambio de Información (GIIS)** emitidas por la DGIS. El backend debe ser flexible para implementar estas guías específicas por escenario (referencia y contrarreferencia, egresos, etc.),.
*   **Interfaces:** El sistema debe exponer interfaces (APIs/Web Services) que cumplan con estas guías para conectar con plataformas federales o de otros prestadores.

### 6. Entidades de software implícitas

Para el modelado del dominio, el sistema debe reconocer explícitamente:

1.  **Paciente:** Sujeto de la atención (con CURP y demográficos).
2.  **Prestador de Servicios de Salud:** La organización/institución.
3.  **Establecimiento:** Unidad física identificada por CLUES.
4.  **Profesional de la Salud:** Usuario que genera la información (requiere Cédula/Firma).
5.  **Expediente Clínico Electrónico (ECE):** Agrupador lógico de la información del paciente.
6.  **Evento/Atención:** La interacción puntual (consulta, urgencia, egreso).
7.  **Documento Estructurado:** La unidad atómica de intercambio (ej. Nota médica, Receta).
8.  **Usuario/Rol:** Para el sistema de gestión de seguridad (SGSI).

### 7. Reglas que NO son técnicas (Excluir de Fase 1)

Aspectos administrativos que no requieren código en el backend inmediato:

*   Trámites burocráticos para obtener el certificado ante la DGIS o organismos certificadores-.
*   La obligación legal de "solidaridad" entre prestadores de servicios.
*   Sanciones penales o administrativas por revelación de información (aunque el sistema debe proveer los logs para investigarlo).
*   Vigencia administrativa del certificado (2 años).
*   Convenios legales entre instituciones para compartir datos.