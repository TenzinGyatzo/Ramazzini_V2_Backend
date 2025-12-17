# Plan de Implementación NOM-024-SSA3-2012 - Fase 1: Estandarización de Datos
## Resumen Ejecutivo

**Proyecto:** SIRES de Salud Ocupacional  
**Objetivo:** Cumplimiento de Fase 1 - Interoperabilidad Semántica  
**Fecha de Análisis:** Octubre 2025

---

## ESTADO ACTUAL DEL SISTEMA

### 1. Modelo de Datos de Trabajadores (ACTUAL)

**Archivo:** `backend/src/modules/trabajadores/schemas/trabajador.schema.ts`

#### Campos Existentes:
- `primerApellido` (string, requerido)
- `segundoApellido` (string, opcional)
- `nombre` (string, requerido)
- `fechaNacimiento` (Date, requerido)
- `sexo` (enum: "Masculino", "Femenino", requerido)
- `escolaridad` (enum, requerido)
- `puesto` (string, requerido)
- `fechaIngreso` (Date, requerido)
- `telefono` (string, opcional, regex validación)
- `estadoCivil` (enum, requerido)
- `numeroEmpleado` (string, opcional, 1-7 dígitos)
- `nss` (string, opcional, 11 dígitos)
- `agentesRiesgoActuales` (array de strings)
- `estadoLaboral` (enum: "Activo", "Inactivo")
- `idCentroTrabajo` (ObjectId ref)
- `createdBy` / `updatedBy` (ObjectId ref)

#### Campos Geográficos Existentes (Centros de Trabajo):
- `estado` (string libre, opcional)
- `municipio` (string libre, opcional)
- `codigoPostal` (string, opcional)
- `direccionCentro` (string, opcional)

---

## BRECHAS IDENTIFICADAS PARA CUMPLIR NOM-024

### 1.1. DATOS MÍNIMOS DE IDENTIFICACIÓN (Tabla 1 / GIIS)

#### ❌ FALTANTES CRÍTICOS:

1. **CURP (Clave Única de Registro de Población)**
   - Estado: **NO EXISTE** en el esquema
   - Requerimiento: Campo obligatorio, identificación única, 18 caracteres alfanuméricos mayúsculas
   - Impacto: ALTO - Es el identificador único obligatorio de la NOM

2. **Validación de CURP contra RENAPO**
   - Estado: **NO IMPLEMENTADA**
   - Requerimiento: Validación en línea o algoritmo de verificación
   - Impacto: ALTO - Garantiza autenticidad del dato

3. **Formato de Nombres y Apellidos**
   - Estado: **PARCIALMENTE CUMPLE** (permite minúsculas y sin validación de caracteres)
   - Requerimiento: Solo mayúsculas (A-Z incluyendo Ñ), sin abreviaturas, sin caracteres especiales
   - Impacto: MEDIO - Requiere validación y normalización

4. **Formato de Fecha de Nacimiento para Intercambio**
   - Estado: **NO CUMPLE** (almacena como Date, sin formato [aaaammdd])
   - Requerimiento: Formato numérico [aaaammdd] (8 posiciones) para reportes DGIS
   - Impacto: MEDIO - Requiere transformación en capa de servicio

5. **Datos Geográficos Normalizados**
   - **EDONAC** (Entidad de Nacimiento): **NO EXISTE**
   - **EDO** (Entidad de Residencia): **NO NORMALIZADO** (texto libre)
   - **MUN** (Municipio de Residencia): **NO NORMALIZADO** (texto libre)
   - **LOC** (Localidad de Residencia): **NO EXISTE**
   - Requerimiento: Claves numéricas según catálogo INEGI
   - Impacto: ALTO - Fundamental para interoperabilidad

### 1.2. USO DE CATÁLOGOS FUNDAMENTALES

#### ❌ FALTANTES CRÍTICOS:

1. **CLUES (Clave Única de Establecimientos de Salud)**
   - Estado: **NO IMPLEMENTADO**
   - Requerimiento: Identificar el PSS que otorga la atención
   - Ubicación requerida: Tabla de Proveedores de Salud
   - Impacto: ALTO

2. **CIE-10 (Clasificación Internacional de Enfermedades)**
   - Estado: **NO IMPLEMENTADO** (diagnósticos en texto libre)
   - Ejemplos actuales:
     - `NotaMedica.diagnostico` (string libre)
     - `Audiometria.diagnosticoAudiometria` (string libre)
   - Requerimiento: Catálogo estructurado con códigos CIE-10
   - Impacto: CRÍTICO - Uso obligatorio según NOM

3. **Catálogos Geográficos INEGI**
   - Estado: **NO IMPLEMENTADO**
   - Requerimiento: Entidades, Municipios, Localidades con claves oficiales
   - Impacto: ALTO

4. **Otros Catálogos (Material, Medicamentos, Vía de Administración)**
   - Estado: **NO IMPLEMENTADO** (tratamiento en texto libre)
   - Ejemplo: `NotaMedica.tratamiento` (array de strings)
   - Impacto: MEDIO

### 1.3. ESTRUCTURA Y GARANTÍA DE INTEGRIDAD

#### ✅ FORTALEZAS ACTUALES:

1. **Timestamping Automático**
   - Todos los esquemas usan `.set('timestamps', true)`
   - Genera `createdAt` y `updatedAt` automáticamente

2. **Trazabilidad de Usuario**
   - Campos `createdBy` y `updatedBy` en todos los documentos
   - Referencias a tabla de usuarios

3. **Generación de PDFs Inmutables**
   - Todos los documentos médicos tienen `rutaPDF`
   - Los PDFs se generan una vez y se almacenan

#### ⚠️ DEBILIDADES IDENTIFICADAS:

1. **Edición de Documentos Médicos**
   - Los esquemas permiten UPDATE sin restricciones
   - No hay mecanismo de versionado
   - No hay registro de cambios (audit log)
   - Requerimiento: Documentos **inalterables** una vez finalizados

2. **Falta de Estado de Documento**
   - No existe campo de estado (ej: "borrador", "finalizado", "firmado")
   - Requerimiento: Diferenciar documentos en proceso vs finalizados

3. **Sin Firma Electrónica Avanzada**
   - No hay implementación de FIEL/e.firma
   - Impacto: CRÍTICO para fases posteriores (Autenticidad)

---

## ESTRUCTURA DEL PLAN DE IMPLEMENTACIÓN

El plan se divide en 5 etapas lógicas detalladas en documentos separados:

1. **[PARTE 1] Auditoría de Datos Actual**  
   → `PLAN_NOM024_FASE1_PARTE1_AUDITORIA.md`

2. **[PARTE 2] Modificaciones a la Base de Datos**  
   → `PLAN_NOM024_FASE1_PARTE2_BD.md`

3. **[PARTE 3] Integración de Catálogos**  
   → `PLAN_NOM024_FASE1_PARTE3_CATALOGOS.md`

4. **[PARTE 4] Lógica de Validación y Estructuración**  
   → `PLAN_NOM024_FASE1_PARTE4_VALIDACION.md`

5. **[PARTE 5] Ajustes en el Frontend**  
   → `PLAN_NOM024_FASE1_PARTE5_FRONTEND.md`

---

## PRIORIZACIÓN DE IMPLEMENTACIÓN

### 🔴 PRIORIDAD CRÍTICA (Bloqueante para Cumplimiento):
1. Implementación de campo CURP con validación
2. Integración de catálogo CIE-10
3. Implementación de CLUES
4. Normalización de datos geográficos (INEGI)
5. Mecanismo de inalterabilidad de documentos

### 🟡 PRIORIDAD ALTA (Requerido para Interoperabilidad):
1. Validación y normalización de nombres/apellidos
2. Formato de fecha de nacimiento [aaaammdd]
3. Datos geográficos de nacimiento y residencia
4. Estado de documento (borrador/finalizado)

### 🟢 PRIORIDAD MEDIA (Mejora de Calidad):
1. Catálogos de medicamentos
2. Versionado de documentos
3. Audit log completo

---

## ESTIMACIÓN DE ESFUERZO

| Etapa | Complejidad | Tiempo Estimado | Dependencias |
|-------|-------------|-----------------|--------------|
| Parte 1: Auditoría | Baja | 1-2 días | Ninguna |
| Parte 2: BD | Media-Alta | 3-5 días | Parte 1 |
| Parte 3: Catálogos | Alta | 5-10 días | Parte 2 |
| Parte 4: Validación | Alta | 5-7 días | Partes 2 y 3 |
| Parte 5: Frontend | Media | 3-5 días | Parte 4 |
| **TOTAL** | **Alta** | **17-29 días** | Secuencial |

---

## PRÓXIMOS PASOS

1. Revisar este resumen ejecutivo con el equipo
2. Leer documentos detallados de cada parte
3. Validar el enfoque propuesto
4. Iniciar con Parte 1: Auditoría de Datos
5. Iterar según hallazgos

---

**Nota Importante:** Este plan NO incluye la implementación de fases posteriores de la NOM-024 (Autenticidad, Confidencialidad, Disponibilidad, Conservación). Se enfoca exclusivamente en la **Fase 1: Estandarización de Datos e Interoperabilidad Semántica**.

