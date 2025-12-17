Esta es la especificación técnica extraída del documento **GIIS-B015-04-11** (versión 4.11, Nov 2024) para el módulo de **Consulta Externa** del Subsistema de Prestación de Servicios (SIS).

### 1. Alcance Funcional

**Dominio del Negocio:**
Gestión, validación y reporte de datos de atenciones médicas ambulatorias (no hospitalarias ni de urgencias) dentro del Sistema Nacional de Salud.

**Aplicabilidad:**
*   **Establecimientos:** Todas las unidades de salud (fijas o móviles) que presten servicio de **Consulta Externa**, independientemente de su tipología, pertenecientes al SNS (público),,.
*   **Disparador (Trigger):** Ocurre al finalizar una consulta médica, psicológica, nutricional, o de enfermería/trabajo social en un consultorio o domicilio.
*   **Interoperabilidad:** Generación de archivos planos (`.TXT` cifrados) para integración con el Subsistema SIS.

---

### 2. Variables Obligatorias (Estructura de Datos)

Se listan las variables críticas para la persistencia y validación. Aunque el documento indica que "todos los campos son obligatorios" en el archivo plano, muchos admiten valores por defecto (nulos lógicos o `-1`) según lógica condicional.

| ID | Nombre Normativo | Tipo de Dato | Catálogo / Formato | Lógica de Negocio / Observaciones |
|:---|:---|:---|:---|:---|
| 1 | `clues` | String(11) | Cat: ESTABLECIMIENTO | Identificador único de unidad. Debe estar "EN OPERACIÓN". |
| 3 | `curpPrestador` | String(18) | RENAPO | Validar algoritmo CURP. Edad 18-90 años,. |
| 7 | `tipoPersonal` | Numérico | Cat: TIPO_PERSONAL | Define reglas de validación para diagnósticos y servicios (ej. Psicólogo no diagnostica ciertos CIEs). |
| 9 | `curpPaciente` | String(18) | RENAPO | Diferente a `curpPrestador`. Admite genéricos (max 15% por carga),. |
| 13 | `fechaNacimiento` | Fecha | `dd/mm/aaaa` | `fechaNacimiento` <= `fechaConsulta`. Edad <= 120 años. |
| 16 | `sexoCURP` | Numérico | 1=H, 2=M, 3=NoBin | Validar vs. caracter 11 de la CURP. |
| 17 | `sexoBiologico` | Numérico | 1=H, 2=M, 3=Intersex | Pivote para validaciones clínicas (ej. embarazo, próstata). |
| 23 | `derechohabiencia` | String(20) | Cat: AFILIACION | **Multivalor**. Separador `&`. Ej: `2&3` (IMSS e ISSSTE). |
| 24 | `fechaConsulta` | Fecha | `dd/mm/aaaa` | No mayor a fecha actual (carga). |
| 25 | `servicioAtencion` | Numérico | Cat: SERVICIOS_ATENCION | Cruzar con `tipoPersonal` (ej. Pediatría requiere edad <18). |
| 26-28| `peso`, `talla`, `cintura`| Numérico | ###.### / ### | Rangos biofísicos estrictos (ej. Peso 1-400kg)-. |
| 29-30| `sistolica`, `diastolica`| Numérico | Entero (3) | Sistólica >= Diastólica. Obligatorios si el otro es >0-. |
| 35 | `glucemia` | Numérico | Entero (3) | Rango 20-999 mg/dl. |
| 40 | `primeraVezAnio` | Numérico | Bool (0/1) | Flag de cobertura. 1 = Primera vez del paciente en la unidad en el año fiscal. |
| 43 | `codigoCIEDiagnostico1`| String(4) | Cat: DIAGNOSTICO_SIS | CIE-10. Validar restricción Sexo/Edad del catálogo (Cols: LSEX, LINF, LSUP)-. |
| 42 | `relacionTemporal` | Numérico | 0=1ra Vez, 1=Subsec | Refiere a la Primera Vez *del padecimieto* en la unidad, no del paciente. |
| 44 | `confirmacionDiagnostica1`| Numérico | Bool (0/1) | Solo para crónicos (DM, HTA) o Cáncer <18 años. Requiere perfil médico facultado. |
| 52 | `atencionPregestacionalRT`| Numérico | 0=1ra, 1=Sub, -1=NA | Condicional: Mujer, 9-59 años. |
| 54 | `relacionTemporalEmbarazo`| Numérico | 0=1ra, 1=Sub, -1=NA | Condicional: Mujer, 9-59 años. Habilita bloque de variables de embarazo (55-67). |
| 78 | `pruebaEDI` | Numérico | 1=Inicial, 2=Sub | Condicional: Edad < 6 años. |
| 103| `telemedicina` | Numérico | Bool (0/1) | Indica si hubo interconsulta remota. |

---

### 3. Reglas de Validación Relevantes para Software

**A. Formato de Intercambio (Output):**
*   **Archivo:** Texto plano (`.TXT`) codificación ANSI.
*   **Delimitador:** Pipe `|` para separar campos.
*   **Multivalores:** Ampersand `&` para listas dentro de un campo (ej. `derechohabiencia`, `riesgos`).
*   **Nulos:** Campos vacíos o `-1` (según especificación por variable).
*   **Cifrado:** Algoritmo **3DES**. El flujo requiere comprimir `.TXT` -> `.CIF` -> `.ZIP`.

**B. Reglas de Negocio Críticas (Backend Logic):**
1.  **Validación Demográfica Cruzada:**
    *   Si `curpPaciente` es genérica (`XXXX999999...`), se omiten validaciones estrictas de nombre/entidad/sexo derivadas de la cadena CURP.
    *   Límite de tolerancia para CURPs genéricas: Máximo 15% del lote.
2.  **Validación Clínica (CIE-10):**
    *   **Sexo/Edad:** Cada código CIE debe validarse contra las columnas `LSEX`, `LINF` (límite inferior edad) y `LSUP` (límite superior edad) del catálogo `DIAGNOSTICO_SIS`.
    *   **Perfil Profesional:** Ciertos diagnósticos (ej. Medicina Tradicional o Cuidados Paliativos) requieren que el `tipoPersonal` coincida con claves específicas (ej. Homeópata, Médico Especialista).
3.  **Lógica de Programas de Salud (Condicionales):**
    *   **Embarazo:** Solo activable si `sexoBiologico` = Mujer (2) AND Edad entre 9 y 59 años. Si se activa, campos como `trimestreGestacional` y `riesgo` son obligatorios.
    *   **Gerontología:** Solo activable si Edad >= 60 años.
    *   **Niño Sano/Desarrollo:** Pruebas EDI solo para < 6 años; Battelle solo para 16 meses - 4 años,.
4.  **Consistencia de Somatometría:**
    *   Validaciones cruzadas: `sistolica` debe ser >= `diastolica`.

---

### 4. Entidades de Software Implícitas

Para el modelado de base de datos o clases del dominio:

1.  **UnidadMedica (Establecimiento)**
    *   `clues` (PK), Institución (SSA, IMSS-Bienestar), Estado Operativo.
2.  **PrestadorServicios (Profesional)**
    *   `curp`, Nombre completo, TipoPersonal (Médico, Enfermera, etc.), Programa (SMyMG).
3.  **Paciente**
    *   `curp` (PK), Datos demográficos, Identidad (Indígena/Afro/Migrante), Afiliaciones, Grupo Etario (calculado).
4.  **Consulta (Evento)**
    *   `folio` (interno), `fechaConsulta`, Servicio (Medicina Gral, Pediatría), `primeraVezAnio` (Cobertura), Telemedicina (Bool).
5.  **SignosVitales (Value Object)**
    *   Peso, Talla, IMC (calculado), TA, Glucosa, Temp, SpO2.
6.  **DiagnosticoDetalle**
    *   `cie10`, `tipo` (1ra vez/Subsecuente), `confirmacion` (Crónicos/Cáncer). Cardinalidad: 1 a 3 por consulta.
7.  **SeguimientoProgramatico (Extensiones polimórficas)**
    *   *ExtensionEmbarazo* (Trimestre, Riesgos, Plan Seguridad).
    *   *ExtensionDesarrolloInfantil* (EDI, Battelle, Nutrición).
    *   *ExtensionCronicos* (Intervenciones Salud Mental, Gerontología).