# PARTE 1: AUDITORÍA DE DATOS ACTUAL
## NOM-024-SSA3-2012 - Fase 1: Estandarización de Datos

---

## OBJETIVO

Revisar exhaustivamente las tablas de pacientes/trabajadores y atenciones médicas para identificar:
- Información actualmente almacenada
- Campos faltantes según NOM-024
- Formatos no conformes
- Necesidades de validación

---

## 1. AUDITORÍA DEL MODELO DE TRABAJADORES

### 1.1. Tabla/Colección: `trabajadores`

**Archivo:** `backend/src/modules/trabajadores/schemas/trabajador.schema.ts`

| Campo Actual | Tipo | Requerido | Cumple NOM | Observaciones |
|-------------|------|-----------|-----------|---------------|
| `primerApellido` | String | Sí | ⚠️ Parcial | Falta validación mayúsculas y caracteres permitidos (A-Z, Ñ) |
| `segundoApellido` | String | No | ⚠️ Parcial | Mismo problema de validación. Debería ser requerido según mejores prácticas GIIS |
| `nombre` | String | Sí | ⚠️ Parcial | Falta validación mayúsculas. No permite captura de múltiples nombres separados |
| `fechaNacimiento` | Date | Sí | ⚠️ Parcial | Formato interno correcto, pero falta transformación a [aaaammdd] para reportes |
| `sexo` | Enum | Sí | ⚠️ Parcial | Valores "Masculino"/"Femenino". GIIS usa códigos: 1=Hombre, 2=Mujer, 3=Intersexual |
| `curp` | - | - | ❌ NO | **CAMPO FALTANTE CRÍTICO** |
| `entidadNacimiento` | - | - | ❌ NO | **CAMPO FALTANTE** (EDONAC - clave INEGI) |
| `entidadResidencia` | - | - | ❌ NO | **CAMPO FALTANTE** (EDO - clave INEGI) |
| `municipioResidencia` | - | - | ❌ NO | **CAMPO FALTANTE** (MUN - clave INEGI) |
| `localidadResidencia` | - | - | ❌ NO | **CAMPO FALTANTE** (LOC - clave INEGI) |
| `nss` | String (11) | No | ✅ SÍ | Opcional según contexto. Formato correcto |
| `numeroEmpleado` | String (1-7) | No | ✅ SÍ | Opcional, formato validado |

#### Hallazgos Críticos:
1. **CURP:** Ausente. Es el identificador único obligatorio.
2. **Datos Geográficos:** No hay campos para claves INEGI (entidad, municipio, localidad).
3. **Normalización de Nombres:** No hay validación de mayúsculas ni caracteres permitidos.
4. **Sexo:** Usa texto descriptivo en lugar de códigos numéricos GIIS.

---

## 2. AUDITORÍA DEL MODELO DE CENTROS DE TRABAJO

### 2.1. Tabla/Colección: `centrostrabajo`

**Archivo:** `backend/src/modules/centros-trabajo/schemas/centro-trabajo.schema.ts`

| Campo Actual | Tipo | Requerido | Cumple NOM | Observaciones |
|-------------|------|-----------|-----------|---------------|
| `nombreCentro` | String | Sí | ✅ SÍ | Correcto |
| `direccionCentro` | String | No | ✅ SÍ | Texto libre correcto |
| `codigoPostal` | String | No | ✅ SÍ | Correcto |
| `estado` | String | No | ❌ NO | **Texto libre. Debe ser clave INEGI de 2 dígitos** |
| `municipio` | String | No | ❌ NO | **Texto libre. Debe ser clave INEGI de 3 dígitos** |
| `localidad` | - | - | ❌ NO | **CAMPO FALTANTE** (clave INEGI 4 dígitos) |

#### Hallazgos Críticos:
1. **Estado y Municipio:** Captura texto libre, no claves normalizadas.
2. **Localidad:** No existe el campo.

---

## 3. AUDITORÍA DEL MODELO DE PROVEEDORES DE SALUD

### 3.1. Tabla/Colección: `proveedoressalud`

**Archivo:** `backend/src/modules/proveedores-salud/schemas/proveedor-salud.schema.ts`

| Campo Actual | Tipo | Requerido | Cumple NOM | Observaciones |
|-------------|------|-----------|-----------|---------------|
| `nombre` | String | Sí | ✅ SÍ | Nombre del PSS |
| `pais` | String | Sí | ✅ SÍ | Correcto |
| `estado` | String | No | ❌ NO | **Texto libre. Debe ser clave INEGI** |
| `municipio` | String | No | ❌ NO | **Texto libre. Debe ser clave INEGI** |
| `direccion` | String | No | ✅ SÍ | Correcto |
| `codigoPostal` | String | No | ✅ SÍ | Correcto |
| `clues` | - | - | ❌ NO | **CAMPO FALTANTE CRÍTICO** |

#### Hallazgos Críticos:
1. **CLUES:** Ausente. Es obligatorio para identificar al establecimiento que otorga atención.
2. **Datos Geográficos:** Mismo problema que centros de trabajo.

---

## 4. AUDITORÍA DE DOCUMENTOS MÉDICOS

### 4.1. Notas Médicas (`notasmedicas`)

**Archivo:** `backend/src/modules/expedientes/schemas/nota-medica.schema.ts`

| Campo Actual | Tipo | Requerido | Cumple NOM | Observaciones |
|-------------|------|-----------|-----------|---------------|
| `tipoNota` | Enum | No | ✅ SÍ | Inicial/Seguimiento/Alta |
| `fechaNotaMedica` | Date | Sí | ✅ SÍ | Correcto |
| `motivoConsulta` | String | Sí | ⚠️ Parcial | Texto libre. Podría mejorarse con catálogo CIE-10 |
| `diagnostico` | String | Sí | ❌ NO | **Texto libre. DEBE usar códigos CIE-10** |
| `tratamiento` | Array[String] | No | ❌ NO | **Texto libre. Debería usar catálogo de medicamentos** |
| `tensionArterialSistolica` | Number | No | ✅ SÍ | Correcto |
| `tensionArterialDiastolica` | Number | No | ✅ SÍ | Correcto |
| `temperatura` | Number | No | ✅ SÍ | Correcto |
| `createdBy` / `updatedBy` | ObjectId | Sí | ✅ SÍ | Trazabilidad presente |
| `rutaPDF` | String | Sí | ✅ SÍ | PDF generado |
| `estado` | - | - | ❌ NO | **CAMPO FALTANTE** (borrador/finalizado) |

#### Hallazgos Críticos:
1. **Diagnóstico:** Texto libre sin códigos CIE-10.
2. **Tratamiento:** No usa catálogos estructurados.
3. **Estado de Documento:** No diferencia entre borrador y finalizado.
4. **Inalterabilidad:** No hay mecanismo que prevenga ediciones post-finalización.

### 4.2. Historia Clínica (`historiasclinicas`)

**Archivo:** `backend/src/modules/expedientes/schemas/historia-clinica.schema.ts`

| Campo Actual | Tipo | Requerido | Cumple NOM | Observaciones |
|-------------|------|-----------|-----------|---------------|
| `motivoExamen` | Enum | No | ✅ SÍ | Ingreso/Inicial/Periódico |
| `fechaHistoriaClinica` | Date | Sí | ✅ SÍ | Correcto |
| `nefropatias`, `diabeticos`, etc. | Enum (SI/NO) | No | ✅ SÍ | Antecedentes correctos |
| `nefropatiasEspecificar`, etc. | String | No | ⚠️ Parcial | Texto libre. Podría mejorarse con CIE-10 |
| `createdBy` / `updatedBy` | ObjectId | Sí | ✅ SÍ | Trazabilidad presente |
| `rutaPDF` | String | Sí | ✅ SÍ | PDF generado |

#### Hallazgos:
- Estructura robusta para antecedentes
- Falta uso de CIE-10 en especificaciones de diagnósticos

### 4.3. Audiometrías (`audiometrias`)

| Campo Actual | Tipo | Requerido | Cumple NOM | Observaciones |
|-------------|------|-----------|-----------|---------------|
| `fechaAudiometria` | Date | Sí | ✅ SÍ | Correcto |
| `oidoDerecho500`, etc. | Number | No | ✅ SÍ | Mediciones correctas |
| `diagnosticoAudiometria` | String | No | ❌ NO | **Texto libre. DEBE usar CIE-10** |
| `interpretacionAudiometrica` | String | No | ✅ SÍ | Correcto para interpretación cualitativa |

---

## 5. AUDITORÍA DE MECANISMOS DE INTEGRIDAD

### 5.1. Análisis de Inalterabilidad

**Problema Identificado:**  
Los esquemas MongoDB permiten operaciones UPDATE sin restricciones.

**Ejemplo en `expedientes.service.ts`:**
```typescript
// Todos los documentos tienen métodos update sin restricciones:
async updateNotaMedica(id: string, updateNotaMedicaDto: UpdateNotaMedicaDto) {
    return await this.notaMedicaModel.findByIdAndUpdate(id, updateNotaMedicaDto, { new: true });
}
```

**Hallazgo Crítico:**
- No hay validación de estado del documento antes de permitir ediciones
- No hay registro de cambios (audit log)
- Los PDFs se regeneran en actualizaciones, pero no hay versionado

### 5.2. Análisis de Timestamps y Trazabilidad

**Fortalezas:**
- ✅ Todos los esquemas usan `timestamps: true` (createdAt, updatedAt)
- ✅ Todos los documentos tienen `createdBy` y `updatedBy`

**Debilidades:**
- ❌ No hay registro de QUIÉN y CUÁNDO se hizo cada cambio específico
- ❌ No hay versionado de documentos

---

## 6. AUDITORÍA DE VALIDACIONES

### 6.1. Validaciones Backend Actuales

**Archivo:** `backend/src/modules/trabajadores/dto/create-trabajador.dto.ts`

**Validaciones Presentes:**
- ✅ Validación de tipos (IsString, IsDate, IsEnum)
- ✅ Validación de requeridos (IsNotEmpty)
- ✅ Validación de formato NSS (11 dígitos)
- ✅ Validación de formato teléfono (regex internacional)
- ✅ Validación de enumeraciones

**Validaciones Faltantes:**
- ❌ Validación de formato CURP (no existe el campo)
- ❌ Validación de caracteres permitidos en nombres (A-Z, Ñ, mayúsculas)
- ❌ Validación contra catálogos (INEGI, CIE-10)
- ❌ Validación de CURP contra RENAPO

### 6.2. Validaciones Frontend

**Hallazgo:** Las validaciones del frontend son limitadas y dependen principalmente de FormKit.

**Ejemplo en `ModalTrabajadores.vue`:**
- Campos de texto simples sin validación de caracteres
- No hay validación de CURP
- No hay selectores de catálogos geográficos

---

## 7. RESUMEN DE HALLAZGOS CRÍTICOS

### 🔴 Prioridad Crítica (Bloqueante):

1. **CURP**
   - ❌ Campo no existe en esquema
   - ❌ No hay validación
   - ❌ No hay integración con RENAPO

2. **CIE-10**
   - ❌ No hay catálogo implementado
   - ❌ Diagnósticos en texto libre en 3+ esquemas

3. **CLUES**
   - ❌ Campo no existe en ProveedoresSalud
   - ❌ No hay validación contra catálogo oficial

4. **Datos Geográficos INEGI**
   - ❌ No hay campos con claves normalizadas
   - ❌ Estado/Municipio en texto libre
   - ❌ Localidad no existe

5. **Inalterabilidad de Documentos**
   - ❌ No hay campo de estado
   - ❌ No hay restricción de edición post-finalización
   - ❌ No hay audit log de cambios

### 🟡 Prioridad Alta:

6. **Normalización de Nombres**
   - ⚠️ Sin validación de mayúsculas
   - ⚠️ Sin validación de caracteres permitidos

7. **Formato de Fecha de Nacimiento**
   - ⚠️ Falta transformación a [aaaammdd] para reportes

8. **Sexo/Género**
   - ⚠️ Usa texto descriptivo en lugar de códigos GIIS

---

## 8. ACCIONES RECOMENDADAS

### Inmediatas:
1. Documentar todos los registros actuales de trabajadores que NO tienen CURP
2. Identificar fuentes de catálogos oficiales (SSA, INEGI, RENAPO)
3. Evaluar impacto de agregar campos obligatorios en registros existentes

### Antes de Implementar:
1. Crear estrategia de migración de datos existentes
2. Definir valores por defecto o nullables para nuevos campos
3. Planificar retrocompatibilidad durante transición

### Documentación Requerida:
1. Mapeo completo de campos actuales → campos NOM-024
2. Inventario de datos faltantes por trabajador existente
3. Análisis de impacto en APIs y frontend

---

## 9. MÉTRICAS DE CUMPLIMIENTO ACTUAL

| Categoría | Cumplimiento | Observaciones |
|-----------|--------------|---------------|
| Datos Mínimos de Identificación | **20%** | Solo nombre, fecha nac., sexo parcial |
| Catálogos Fundamentales | **0%** | Ningún catálogo implementado |
| Datos Geográficos | **0%** | Texto libre, sin normalización |
| Inalterabilidad | **30%** | PDF + timestamps, pero sin estado ni audit log |
| **CUMPLIMIENTO GLOBAL** | **12.5%** | Muy bajo. Requiere trabajo significativo |

---

**Conclusión:** El sistema actual tiene una base sólida de captura de datos clínicos, pero carece de los elementos fundamentales de estandarización e interoperabilidad requeridos por la NOM-024-SSA3-2012. La implementación de CURP, CIE-10, CLUES y datos geográficos normalizados son requisitos bloqueantes para avanzar.

**Siguiente Paso:** Revisar [PARTE 2: Modificaciones a la Base de Datos](PLAN_NOM024_FASE1_PARTE2_BD.md)

