Aquí tienes la especificación técnica extraída del documento **GIIS-B013-02-03**, estructurada para el desarrollo del módulo de Lesiones y Causas de Violencia dentro de un SIRES.

### 1. Alcance Funcional

**Dominio del Negocio:**
El sistema debe gestionar la captura, validación y reporte de datos relacionados con la atención médica, psicológica, psiquiátrica o social otorgada a pacientes afectados por **lesiones** (accidentales o intencionales) y **causas de violencia**.

**Aplicabilidad:**
*   **Establecimientos:** Unidades Médicas de primer, segundo y tercer nivel del Sector Público. Específicamente unidades de consulta externa de primer nivel que atiendan casos de violencia/lesiones y cualquier hospital que otorgue dicha atención.
*   **Disparador (Trigger):** Ocurre cuando un paciente recibe atención por daños a la salud derivados de una causa externa (lesión o violencia).
*   **Interoperabilidad:** Generación de archivos planos para integración con el Subsistema de Lesiones y Causas de Violencia de la DGIS.

---

### 2. Variables Obligatorias (Estructura de Datos)

A continuación, se listan las variables críticas para la validación de la estructura. La obligatoriedad (OBL) se define como normativa en el archivo de intercambio, aunque muchas son condicionales a la lógica de negocio.

| ID | Nombre Normativo | Descripción | Tipo | Catálogo / Formato | OBL | Observaciones Técnicas |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `clues` | Identificador de la Unidad Médica | Texto(11) | Cat: ESTABLECIMIENTO | Sí | Clave única (CLUES). Debe existir en catálogo vigente. |
| 2 | `folio` | Identificador interno de atención | Texto(8) | N/A | Sí | Único por CLUES y fecha. Caracteres 0-9. |
| 3 | `curpPaciente` | Identificador único de persona | Texto(18) | RENAPO | Sí | Regex: `[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d`. Validación checksum. |
| 7 | `fechaNacimiento` | Fecha de nacimiento | Texto(10) | `dd/mm/aaaa` | Sí | `fechaNacimiento` <= `fechaAtencion`. Edad < 100 años. |
| 12 | `sexo` | Sexo del paciente | Numérico | Cat: SEXO | Sí | 1=Hombre, 2=Mujer, 3=Intersexual. Validar vs CURP. |
| 24 | `fechaEvento` | Fecha de la lesión/violencia | Texto(10) | `dd/mm/aaaa` | Sí | `fechaNacimiento` <= `fechaEvento` <= `fechaAtencion`. |
| 27 | `sitioOcurrencia` | Lugar donde pasó el evento | Numérico | Cat: SITIO_OCURRENCIA | Sí |. |
| 41 | `intencionalidad` | Intención del evento (Accidente/Violencia) | Numérico | 1=Accidental, 2=V.Familiar, 3=V.No Familiar, 4=Autoinfligido | Sí | Define flujo de captura (Accidente vs Violencia). |
| 43 | `agenteLesion` | Objeto/mecanismo de lesión | Numérico | Cat: AGENTE_LESION | Cond | Obligatorio si Intencionalidad = 1, 4 o Violencia Física/Sexual. |
| 49 | `tipoViolencia` | Tipología de la violencia | Texto(10) | Cat: Interno (6-10) | Cond | **Multivalor**. Separador `&`. Obligatorio si Intencionalidad = 2 o 3. |
| 55 | `fechaAtencion` | Fecha de registro clínico | Texto(10) | `dd/mm/aaaa` | Sí | No mayor a fecha actual. |
| 59 | `tipoAtencion` | Tratamiento otorgado | Texto(10) | Cat: Interno (1-9) | Sí | **Multivalor**. Separador `&`. Máximo 5 valores. |
| 60 | `areaAnatomica` | Zona corporal más grave | Numérico | Cat: AREA_ANATOMICA | Sí | Si son múltiples, usar código 15. |
| 62 | `consecuenciaGravedad` | Resultado físico de la lesión | Numérico | Cat: CONSECUENCIA | Sí | Validar sexo/edad si es Aborto/Embarazo. |
| 65 | `codigoCIEAfeccionPrincipal` | Diagnóstico principal (CIE-10) | Texto(4) | Cat: DIAGNOSTICO | Sí | Solo Capítulos V, XIX y códigos obstétricos específicos. No Rúbricas tipo 'B'. |
| 66-68 | `afeccionesTratadas` | Comorbilidades / Diagnósticos secundarios | Array | Estructura Compuesta | No | Formato: `Num#Desc#CIE`. Separador de items: `&`. |
| 71 | `codigoCIECausaExterna` | Código CIE-10 del evento | Texto(4) | Cat: DIAGNOSTICO (Cap XX) | Sí | Rango V01 – Y98. |
| 76 | `responsableAtencion` | Rol del profesional | Numérico | 1=Médico, 2=Psicólogo, 3=Trab. Social | Sí | Validación cruzada con `tipoAtencion`. |
| 78 | `curpResponsable` | ID del profesional de salud | Texto(18) | RENAPO | Sí | Debe ser diferente a `curpPaciente`. |

---

### 3. Reglas de Validación Relevantes para Software

**A. Formato de Archivo e Intercambio:**
*   **Codificación:** Texto plano ANSI.
*   **Estructura de registro:** Un registro por línea. Campos separados por pipe `|`.
*   **Listas y Arrays:**
    *   Variables múltiples (ej. Tipos de violencia): Separador `&` (ej. `6&7`).
    *   Variables compuestas (ej. Afecciones tratadas): Separador interno `#` y separador de items `&` (ej. `1#Desc1#CIE1&2#Desc2#CIE2`).
    *   Campos vacíos: Se representan como `||`.
*   **Cifrado:** Algoritmo 3DES, extensión final `.CIF` y comprimido en `.ZIP`.

**B. Reglas de Negocio Críticas (Backend Logic):**
1.  **Validación Temporal:**
    `Fecha Nacimiento` <= `Fecha Evento` <= `Fecha Atención` <= `Fecha Actual`.
    *   *Hora:* Si `FechaEvento` == `FechaAtencion`, entonces `HoraEvento` < `HoraAtencion`.
2.  **Validación Demográfica:**
    *   Si `curpPaciente` es genérica (`XXXX999999XXXXXX99`), se omiten validaciones cruzadas de nombre/sexo/entidad (Límite 40% de registros en carga masiva).
    *   Validación CIE-10 vs Sexo/Edad definida en catálogo DIAGNOSTICO (columnas LSEX, LINF, LSUP).
3.  **Lógica de Lesiones vs. Violencia:**
    *   Si `intencionalidad` es "Violencia Familiar" (2) o "No Familiar" (3):
        *   `tipoViolencia` es obligatorio.
        *   `numeroAgresores` y datos del agresor son obligatorios.
    *   Si `intencionalidad` es "Accidental" (1):
        *   `agenteLesion` es obligatorio.
        *   Datos de vehículo de motor solo aplican si `agenteLesion` = 20.
4.  **Consistencia de Diagnósticos:**
    *   El diagnóstico principal (`codigoCIEAfeccionPrincipal`) debe tener la bandera `AF_PRIN = SI` en el catálogo.
    *   Si `consecuenciaGravedad` es Defunción (19) o CIE-10 es O95/O96, el destino `despuesAtencion` debe ser Defunción (5).

---

### 4. Entidades de Software Implícitas

Para el modelado de base de datos (ERD) o clases del dominio, se identifican las siguientes entidades:

1.  **UnidadMédica (Establecimiento)**
    *   Atributos: CLUES, Entidad, Jurisdicción.
2.  **Paciente**
    *   Atributos: CURP, Nombres, Fecha Nacimiento, Sexo, Etnicidad (Indígena/Afromexicano), Escolaridad, Discapacidad.
3.  **Evento (Incidente)**
    *   Atributos: Fecha/Hora, Ubicación Geográfica (Estado, Municipio, Localidad, CP), Sitio (Casa, calle, etc.), Intencionalidad, Agente causal.
    *   *Sub-entidad:* **AccidenteTransito** (Rol, Equipo seguridad).
    *   *Sub-entidad:* **Violencia** (Tipos, Agresor, Parentesco).
4.  **AtenciónMédica (Encuentro)**
    *   Atributos: Folio, Fecha/Hora, Servicio (Urgencias, Consulta), Tipo Intervención, Área Anatómica, Consecuencia, Destino, Aviso MP.
    *   *Sub-entidad:* **Diagnóstico** (Afección Principal, Causa Externa, Comorbilidades).
5.  **ProfesionalSalud**
    *   Atributos: CURP, Nombre, Cédula, Rol (Médico/Psicólogo).