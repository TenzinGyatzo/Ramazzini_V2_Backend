# Phase 2: GIIS — Validación externa y entrega regulatoria — Context

**Gathered:** 2026-02-04  
**Status:** Ready for planning  
**Fuente:** Reglas operativas explícitas e implícitas de guías GIIS-B013 (Lesiones), GIIS-B015 (Consulta Externa), GIIS-B019 (Detecciones).

---

## Phase Boundary

Que los archivos GIIS generados por el SIRES pasen validadores externos y estén listos para carga regulatoria (SINBA u otros). Subfases: **2A** validación profunda por campo, **2B** cifrado y empaquetado, **2C** operación y auditoría. Alcance fijado por ROADMAP.md; este documento fija CÓMO implementar dentro de ese límite.

---

## Resumen de decisiones

| Área | Decisión | Razón / Fuente |
|------|----------|-----------------|
| **Errores de validación (2A)** | Skip row en generación + modo pre-validación (solo reporte) + Reporte de Excluidos con el ZIP | El validador DGIS rechaza archivo completo por un renglón mal formado; preferible N registros válidos que 0. |
| **Criterio listo para regulatorio** | Estado explícito "validado"; solo habilitar cifrado si sin errores bloqueantes; advertencias permiten continuar con confirmación | Cifrado = sellado para entrega; no cifrar archivos con estructura inválida. |
| **Alcance 2B** | Selección por Guía + CLUES + Mes; entrega = descarga de ZIP para **carga manual** en portal (no API automática) | Guías refieren a "Módulo de Carga Masiva" en gobi.salud.gob.mx (SINBA v2.0). |
| **Naming 2B** | **Estricto:** `[TIPO]-[ENTIDAD][INST]-[AA][MM].[EXT]` (ej. `LES-DFSSA-2201.ZIP`) | Definido explícitamente en guías. |
| **Auditoría 2C** | Log: Quién, Cuándo, Qué (periodo, CLUES, guía, nombre archivo), **Hash SHA-256**, resumen validación. Versionado interno (v1, v2); nombre externo fijo. | Trazabilidad y protección de datos; integridad del archivo. |
| **Reintentos** | Cada generación = **nuevo batch**; no sobrescribir. Mismo nombre oficial al descargar; versiones internas distintas. | Reporte mensual; es común regenerar tras rechazo/corrección. |
| **Retención** | Configurable por negocio. ZIPs/TXT pueden depurarse tras X meses; información fuente según NOM-004 (5 años). | Archivos son vehículos de transmisión; obligación de resguardo sobre expediente fuente. |

---

## 1. Comportamiento ante errores de validación (2A)

### Enfoque: híbrido (reporte previo + skip row)

- **Modo "Pre-validación" (solo reporte):** El usuario (administrativo/médico) puede ejecutar una validación del periodo (ej. "Validar Enero 2024") **sin generar el TXT**. Salida: lista de errores por registro (ej. "Paciente Juan Pérez: Falta CURP", "Nota 123: Diagnóstico incompatible con sexo").
- **Generación del TXT (skip row):** Al generar el archivo final, **omitir** los registros que no cumplan reglas "hard" (CLUES inválida, dato obligatorio faltante sin default, valor fuera de catálogo, etc.). Las guías indican "En caso contrario, no se debe permitir el registro"; es preferible incluir solo registros válidos que hacer fallar todo el archivo.
- **Origen de las reglas:** En los schemas GIIS (CDT, CEX, LES) cada campo tiene un texto `validationRaw` con la regla en español. Esas reglas en texto deben **convertirse en lógica ejecutable** en Phase 2A: el validador implementa el equivalente en código (required, longitud, catálogo, formato, rangos, reglas cruzadas, etc.) usando validationRaw como especificación.
- **Feedback:** Entregar el ZIP final **y** un **Reporte de Excluidos**: qué folios no se incluyeron y por qué.

### Quién ve el reporte y formato

- **Roles:** Visible para **Principal**, **Administrador** o encargado de estadística.
- **Formato:** **Pantalla (grid)** + opción de **descarga (Excel/CSV)** para correcciones offline.

---

## 2. Criterio "listo para regulatorio" (2A → 2B)

### Estado explícito "Validado al 100% (estructural)"

- El paso a **2B (Cifrado)** solo se habilita si el TXT generado pasó la validación estructural interna **sin errores críticos**.

### Errores vs advertencias

- **Errores (bloqueantes):** Estructura rota, falta de dato obligatorio (Required = true), valor fuera de catálogo. **No permiten cifrar.**
- **Advertencias (no bloqueantes):** Reglas de negocio suaves (ej. porcentaje de CURPs genéricas por encima de tolerancia de la guía). **Permiten cifrar** con confirmación explícita del usuario: ej. *"Atención: Tienes 20% de CURPs genéricas, el archivo podría ser rechazado por DGIS, ¿Deseas continuar?"*.

---

## 3. Alcance del cifrado, empaquetado y entrega (2B)

### Alcance por guía / CLUES / mes

- El usuario debe poder **elegir** qué guías exportar (por guía, por CLUES, por mes). No siempre se requiere todo (ej. sin casos de Lesiones en el mes, sí Consulta Externa).
- **Flujo:** Seleccionar periodo → Seleccionar guía (LES / CEX / CDT) → Generar.

### Definición de "entrega"

- **Carga manual en portal web.** Las guías refieren al "Módulo de Carga Masiva" en gobi.salud.gob.mx, sección "Cargas SINBA v2.0". No se describe API REST/SOAP para transmisión automática en estos documentos.
- **Entrega termina** cuando el usuario **descarga el .ZIP cifrado** a su equipo para subirlo manualmente al portal.

### Naming oficial de archivos

- **Obligatorio**, definido en guías (GIIS-B019, sección Nomenclatura de archivos). Implementar en esta fase.
- **Formato:** `[TIPO]-[ENTIDAD][INST]-[AA][MM].[EXT]`
  - **TIPO:** 3 caracteres (CDT, CEX, LES).
  - **ENTIDAD:** posiciones 5-6 del nombre (2 caracteres). **INST:** posiciones 7-9 (3 caracteres). Siguen la nomenclatura CLUES.
  - **AA:** año 2 dígitos. **MM:** mes 2 dígitos.
  - **Mismo nombre base** en las tres etapas: .TXT → .CIF → .ZIP (solo cambia la extensión).
- **Derivación de [ENTIDAD][INST]:** Si el establecimiento tiene CLUES del catálogo DGIS (11 caracteres), usar los **primeros 5 caracteres** del CLUES (formato DGIS: 2 entidad + 3 institución + 6 número). Si es modo privado sin CLUES (**9998**), usar **99SMP** (SERVICIOS MEDICOS PRIVADOS).
- **Ejemplo:** `LES-DFSSA-2201.ZIP` (Lesiones, DF + SSA, año 22, enero).

### CLUES en establecimientos privados (Anexo 3 NOM-024)

- **Registro de información:** El Anexo 3 (paquete informativo DGIS para certificación) permite a establecimientos **privados sin CLUES** usar 9998 / SMP / SERVICIOS MEDICOS PRIVADOS (tipología 99, estatus EN OPERACION) para **registro** (captura, almacenamiento, generación de archivos). El sistema debe seguir permitiendo generar y nombrar archivos con 9998 → 99SMP.
- **Reporte de información:** El mismo Anexo indica que *"para el reporte de información forzosamente debe contar con una CLUES válida"*. Por tanto: (1) no bloquear la descarga del ZIP cuando el proveedor use 9998; (2) mostrar **advertencia** en el flujo de entrega regulatoria cuando CLUES sea 9998 (el archivo podría ser rechazado por la DGIS; debe gestionar la obtención de CLUES válida para reportar); (3) en auditoría (2C), registrar si el batch se generó con CLUES 9998 vs CLUES válida. Ver detalle en `02-RESEARCH.md`.

---

## 4. Evidencia, versionado y retención (2C)

### Evidencia para auditoría

Registrar en cada generación:

- Usuario generador  
- Fecha/hora  
- Periodo reportado (mes/año)  
- CLUES  
- Tipo de guía (LES/CEX/CDT)  
- Nombre del archivo generado  
- **Hash del archivo (SHA-256)** — para probar integridad  
- Resumen de validación (ej. "150 registros procesados, 2 excluidos")

Las guías enfatizan seguridad y protección de datos; es esencial saber **quién** extrajo la información.

### Reintentos y versionado

- Cada generación = **nuevo batch**. No sobrescribir el log ni el evento anterior.
- Si el usuario genera `CEX-DFPRV-2410.ZIP` hoy y mañana lo regenera, el sistema guarda **ambos** eventos.
- **Nomenclatura externa:** El nombre del archivo al descargar es siempre el **nombre oficial** (la DGIS espera ese nombre para ese mes). **Internamente** el sistema maneja versiones (ej. v1, v2) para distinguir regeneraciones.

### Retención y limpieza

- **Configurable** por negocio. La obligación normativa de resguardo aplica a la **información fuente** (expediente clínico; NOM-004, 5 años). Los archivos .TXT/.ZIP son vehículos de transmisión.
- **Recomendación:** Permitir depurar (borrar) los archivos generados (ZIPs) después de X meses para ahorrar espacio, manteniendo la base de datos fuente intacta.

---

## Fuera de alcance (Phase 2)

- **Integración automática con SINBA (API/subida máquina a máquina):** No descrita en las guías citadas; no forma parte de esta fase. Entrega = descarga para carga manual.
- **Cambio de reglas de validación o diccionarios:** Definición de reglas sí; cambio normativo futuro se gestiona como evolución (otra fase o cambio de configuración).

---

## Próximos pasos

- **Investigación:** Hecha. Ver `02-RESEARCH.md` (formato [ENTIDAD][INST] = primeros 5 del CLUES o 99SMP; nomenclatura según guía B019).
- **Planificación:** `/gsd-plan-phase 2` para desglosar en planes 2A, 2B, 2C (validación, cifrado/empaquetado, operación y auditoría).

---

*Last updated: 2026-02-04*
