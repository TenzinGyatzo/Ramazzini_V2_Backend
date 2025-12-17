Esta es la especificación técnica extraída del documento **GIIS-B019-04-09** (versión 4.9, Nov 2024) para el módulo de **Detecciones** del Subsistema de Prestación de Servicios (SIS).

### 1. Alcance Funcional

**Dominio del Negocio:**
Registro, validación y reporte de tamizajes y detecciones preventivas (enfermedades crónicas, cáncer, adicciones, violencia, salud mental, geriatría e ITS) realizadas en unidades de salud.

**Aplicabilidad:**
*   **Establecimientos:** Todas las unidades médicas (fijas o móviles) que realicen acciones de detección preventiva, independientemente de su tipología.
*   **Disparador (Trigger):** Realización de un tamizaje o prueba de detección durante la atención en consulta externa o en campo.
*   **Interoperabilidad:** Generación de archivos planos para integración con el Subsistema SIS (SINBA).

---

### 2. Variables Obligatorias (Estructura de Datos)

El sistema requiere capturar todos los campos. Si una detección no se realiza o no aplica por edad/sexo, se debe registrar el valor por defecto (generalmente `-1` o `0`) según la regla de negocio específica.

| ID | Nombre Normativo | Tipo de Dato | Catálogo / Formato | Lógica / Observaciones Técnicas |
|:---|:---|:---|:---|:---|
| 1 | `clues` | String(11) | Cat: ESTABLECIMIENTO | Debe estar "EN OPERACIÓN". Validar vs catálogo SIS. |
| 3 | `curpPrestador` | String(18) | RENAPO | Validar algoritmo. Edad 18-90 años. Admite genéricos si extranjero. |
| 7 | `tipoPersonal` | Numérico | Cat: TIPO_PERSONAL | **Campo Crítico**: Define qué detecciones son válidas. Si es "30-Trabajador Social", la mayoría de detecciones clínicas se deshabilitan. |
| 8 | `programaSMyMG` | Bool (0/1) | N/A | Obligatorio solo si Institución es SSA o IMB (IMSS-Bienestar). Valor fijo por contrato. |
| 9 | `curpPaciente` | String(18) | RENAPO | Diferente a `curpPrestador`. Máximo 15% de genéricos por carga. |
| 13 | `fechaNacimiento` | Fecha | `dd/mm/aaaa` | Base para calcular edad. Máx 120 años. |
| 17 | `sexoBiologico` | Numérico | 1=H, 2=M, 3=Inter | Pivote para validaciones de Cáncer y Violencia. |
| 20-21| `migrante`, `pais` | Numérico | Cat: PAIS | Si `migrante`=2 (Internacional), `paisProcedencia` es obligatorio. |
| 23 | `derechohabiencia` | String | Cat: AFILIACION | **Multivalor**. Separador `&`. Ej: `2&3`. |
| 25 | `servicioAtencion` | Numérico | Cat: SERVICIOS_DET | Validar edad según servicio (ej. Pediatría <18, Geriatría >=60). |
| 26-28| `peso`, `talla`, `cintura`| Numérico | `###.###` | Rangos estrictos. Peso 1-400kg. Cintura 20-300cm. Si null, usar `999` o `0`. |
| 29-30| `sistolica`, `diastolica`| Numérico | Entero | `sistolica` >= `diastolica`. |
| 35 | `glucemia` | Numérico | Entero (20-999) | Si > 0, `tipoMedicion` (Ayuno) es obligatorio. |
| 39-41| `depresion`, `ansiedad` | Numérico | 0=Pos, 1=Neg, -1=NA | Condicional: Edad >= 10 años. Excluye Trabajador Social. |
| 42-57| **Bloque Geriatría** | Numérico | Múltiples variables | Condicional: Edad >= 60 años (Memoria, Caídas, Marcha, ABVD, Cuidador). Excluye Trab. Social. |
| 59-62| **Bloque Crónicos** | Numérico | 0=Pos, 1=Neg, -1=NA | Condicional: Edad >= 20 años (Diabetes, HTA, Obesidad, Dislipidemia). |
| 63-72| **Bloque Adicciones** | Numérico | 0=Pos, 1=Neg, -1=NA | Alcohol, Tabaco, Cocaína, etc. Excluye Trab. Social. |
| 73-78| **Bloque ITS** | Numérico | 1-10 (Resultado) | VIH, Sífilis, Gonorrea, HepB, Herpes, Chlamydia. Excluye Trab. Social. |
| 79-81| **Bloque CaCu/VPH** | Numérico | 0/1 | Mujeres/Intersexuales. Edad 25-64 (CaCu), 35-64 (VPH). |
| 82 | `cancerMama` | Numérico | 0/1 | Excluye Trab. Social. |
| 84 | `violenciaMujer15` | Numérico | 0/1 | Solo Mujeres >= 15 años. |
| 86-87| `hiperplasiaProstatica`| Numérico | 0/1 | Solo Hombres >= 40 años. |
| 89-91| **Espirometría** | Numérico | VEF1/CVF, LIN | Solo si CLUES tiene espirómetro (Catálogo específico) y edad >= 19. |

---

### 3. Reglas de Validación Relevantes para Software

**A. Formato de Intercambio (Output):**
*   **Estructura:** Archivo de texto plano (`.TXT`), codificación ANSI. Un registro por línea.
*   **Separadores:** Pipe `|` para campos. Ampersand `&` para valores múltiples dentro de un campo.
*   **Cifrado:** Algoritmo **3DES**. Compresión ZIP. Nomenclatura: `CDT-[Entidad][Institucion]-[Año][Mes].ZIP`.

**B. Restricciones de Negocio (Backend Logic):**
1.  **Regla de Exclusión "Trabajador Social":**
    *   Si `tipoPersonal` == 30, la mayoría de las detecciones clínicas (Depresión, ITS, Crónicos, Cáncer, Espirometría) **no deben permitirse** y deben reportarse con valor `-1`.
2.  **Validación Temporal:**
    *   `fechaNacimiento` <= `fechaDeteccion` <= Fecha Actual (Carga).
3.  **Lógica de Cobertura (Primera Vez):**
    *   Variable `primeraVezAnio`: Validar si existe un registro previo del paciente en la *misma* unidad (`clues`) durante el año fiscal actual. 1=Sí (primera vez), 0=No (subsecuente).
4.  **Casos Especiales de Edad/Sexo:**
    *   **Servicios Amigables:** Requiere Edad 10-19 años + CLUES en catálogo `DIRECTORIO SERVICIOS AMIGABLES`.
    *   **Prostata:** Solo Hombres (1). Edad >= 40 años.
    *   **VPH:** Solo Mujeres (2). Edad 35-64 años.
    *   **S. Turner:** Solo Mujeres (2) o Intersexual (3).

---

### 4. Entidades de Software Implícitas

Para el diseño del modelo de datos:

1.  **UnidadMedica**
    *   Atributos: CLUES, Institución, Capacidad (tiene espirómetro, servicio amigable).
2.  **PrestadorServicios**
    *   Atributos: CURP, TipoPersonal (Médico, Enf, TrabSocial), Contrato (SMyMG).
3.  **Paciente**
    *   Atributos: CURP, Nacimiento, Sexo (Bio/CURP/Genero), Identidad (Indígena/Afro), Vulnerabilidad (Migrante, Discapacidad).
4.  **EventoDeteccion (Master)**
    *   Atributos: Fecha, ServicioAtencion, SignosVitales (Objeto Valor: Peso, Talla, TA, Glucosa).
5.  **ResultadosTamizaje (Detail/Polymorphic)**
    *   *SaludMental* (Depresión, Ansiedad).
    *   *Geriatria* (Funcionalidad, Caídas, Cuidador).
    *   *Cronicos* (Riesgos metabólicos).
    *   *Adicciones* (Sustancias).
    *   *SaludSexual* (ITS, Cáncer Reproductivo, Violencia).
    *   *SaludRespiratoria* (TB, Espirometría).