# PARTE 2: MODIFICACIONES A LA BASE DE DATOS (BACKEND)
## NOM-024-SSA3-2012 - Fase 1: Estandarización de Datos

---

## OBJETIVO

Proponer cambios específicos en el esquema de datos (nuevos campos, tipos de datos, índices, constraints) para cumplir con los requisitos de la Fase 1 de la NOM-024.

---

## 1. MODIFICACIONES AL ESQUEMA DE TRABAJADORES

### 1.1. Nuevos Campos Requeridos

**Archivo a modificar:** `backend/src/modules/trabajadores/schemas/trabajador.schema.ts`

```typescript
// CAMPOS NUEVOS A AGREGAR:

@Prop({ 
  required: true,  // Obligatorio según NOM-024
  unique: true,    // Identificador único
  match: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,  // Validación formato CURP
  uppercase: true,
  length: 18
})
curp: string;

@Prop({ 
  required: true,  // Entidad de nacimiento (clave INEGI 2 dígitos)
  match: /^\d{2}$/,
  ref: 'CatalogoEntidades'  // Referencia a catálogo
})
entidadNacimiento: string;

@Prop({ 
  required: true,  // Entidad de residencia (clave INEGI 2 dígitos)
  match: /^\d{2}$/,
  ref: 'CatalogoEntidades'
})
entidadResidencia: string;

@Prop({ 
  required: true,  // Municipio de residencia (clave INEGI 3 dígitos)
  match: /^\d{3}$/,
  ref: 'CatalogoMunicipios'
})
municipioResidencia: string;

@Prop({ 
  required: true,  // Localidad de residencia (clave INEGI 4 dígitos)
  match: /^\d{4}$/,
  ref: 'CatalogoLocalidades'
})
localidadResidencia: string;

@Prop()
domicilioResidencia: string;  // Domicilio completo (opcional)

@Prop({ 
  required: true,
  enum: ['1', '2', '3'],  // 1=Hombre, 2=Mujer, 3=Intersexual (según GIIS)
})
sexoCodigo: string;

// Campo para validación CURP
@Prop({ default: false })
curpValidadaRENAPO: boolean;

@Prop()
fechaValidacionCURP: Date;
```

### 1.2. Modificaciones a Campos Existentes

```typescript
// MODIFICAR CAMPOS ACTUALES:

@Prop({ 
  required: true,
  uppercase: true,          // NUEVO: Forzar mayúsculas
  match: /^[A-ZÑÁÉÍÓÚ\s]+$/ // NUEVO: Solo letras mayúsculas y Ñ
})
primerApellido: string;

@Prop({ 
  required: false,           // No es required segun la NOM-024
  uppercase: true,
  match: /^[A-ZÑÁÉÍÓÚ\s]+$/
})
segundoApellido: string;

@Prop({ 
  required: true,
  uppercase: true,
  match: /^[A-ZÑÁÉÍÓÚ\s]+$/
})
nombre: string;

// Mantener fechaNacimiento como Date para uso interno
// Agregar método virtual para formato NOM
@Prop({ required: true })
fechaNacimiento: Date;

// NOTA: El sexo actual "Masculino"/"Femenino" se mantiene para compatibilidad
// pero se agrega sexoCodigo como campo normalizado
```

### 1.3. Índices y Constraints

```typescript
// AGREGAR AL FINAL DEL SCHEMA:

TrabajadorSchema.index({ curp: 1 }, { unique: true });
TrabajadorSchema.index({ entidadResidencia: 1, municipioResidencia: 1 });
TrabajadorSchema.index({ createdAt: -1 });

// Método virtual para fecha en formato NOM [aaaammdd]
TrabajadorSchema.virtual('fechaNacimientoNOM').get(function() {
  if (!this.fechaNacimiento) return null;
  const fecha = new Date(this.fechaNacimiento);
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;  // Formato: aaaammdd
});
```

### 1.4. Estrategia de Migración

**Consideraciones:**
- El campo `curp` será obligatorio, pero los registros existentes NO lo tienen
- Opciones:

**Opción A (Recomendada): Fase de Transición**
```typescript
@Prop({ 
  required: false,  // Temporal: opcional durante migración
  unique: true,
  sparse: true      // Índice sparse: permite múltiples null
})
curp: string;
```

**Opción B: Migración Forzada**
- Requerir captura manual de CURP para todos los trabajadores existentes
- Implementar pantalla de "Completar Datos" en frontend

**Decisión Recomendada:** Opción A con fecha límite de migración (ej: 6 meses)

---

## 2. MODIFICACIONES AL ESQUEMA DE CENTROS DE TRABAJO

**Archivo a modificar:** `backend/src/modules/centros-trabajo/schemas/centro-trabajo.schema.ts`

```typescript
// REEMPLAZAR CAMPOS ACTUALES:

@Prop({ 
  required: true,
  match: /^\d{2}$/,
  ref: 'CatalogoEntidades'
})
entidad: string;  // REEMPLAZA 'estado' (ahora es clave INEGI)

@Prop({ 
  required: true,
  match: /^\d{3}$/,
  ref: 'CatalogoMunicipios'
})
municipio: string;  // REEMPLAZA texto libre (ahora es clave INEGI)

@Prop({ 
  required: false,
  match: /^\d{4}$/,
  ref: 'CatalogoLocalidades'
})
localidad: string;  // NUEVO CAMPO

// Mantener estos como texto libre:
@Prop({ required: false })
direccionCentro: string;

@Prop({ required: false, match: /^\d{5}$/ })
codigoPostal: string;
```

---

## 3. MODIFICACIONES AL ESQUEMA DE PROVEEDORES DE SALUD

**Archivo a modificar:** `backend/src/modules/proveedores-salud/schemas/proveedor-salud.schema.ts`

```typescript
// NUEVO CAMPO CRÍTICO:

@Prop({ 
  required: true,           // Obligatorio según NOM-024
  unique: true,
  match: /^[A-Z]{2}[A-Z]{3}\d{6}[A-Z0-9]{2}$/,  // Formato CLUES
  uppercase: true,
  length: 13
})
clues: string;  // Clave Única de Establecimientos de Salud

@Prop({ default: false })
cluesValidada: boolean;  // Indica si se validó contra catálogo oficial

@Prop()
fechaValidacionCLUES: Date;

// REEMPLAZAR CAMPOS GEOGRÁFICOS:

@Prop({ 
  required: true,
  match: /^\d{2}$/,
  ref: 'CatalogoEntidades'
})
entidad: string;  // REEMPLAZA 'estado'

@Prop({ 
  required: true,
  match: /^\d{3}$/,
  ref: 'CatalogoMunicipios'
})
municipio: string;  // REEMPLAZA texto libre

@Prop({ 
  match: /^\d{4}$/,
  ref: 'CatalogoLocalidades'
})
localidad: string;  // NUEVO
```

---

## 4. NUEVOS ESQUEMAS DE CATÁLOGOS

### 4.1. Catálogo de Entidades Federativas (INEGI)

**Archivo nuevo:** `backend/src/modules/catalogos/schemas/catalogo-entidades.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class CatalogoEntidad extends Document {
  @Prop({ required: true, unique: true, match: /^\d{2}$/ })
  clave: string;  // 01-32

  @Prop({ required: true, uppercase: true })
  nombre: string;  // "AGUASCALIENTES", "BAJA CALIFORNIA", etc.

  @Prop({ required: true, uppercase: true })
  nombreAbreviado: string;  // "AGS", "BC", etc.

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: Date, default: Date.now })
  fechaActualizacion: Date;
}

export const CatalogoEntidadSchema = SchemaFactory.createForClass(CatalogoEntidad);
```

### 4.2. Catálogo de Municipios (INEGI)

**Archivo nuevo:** `backend/src/modules/catalogos/schemas/catalogo-municipios.schema.ts`

```typescript
@Schema()
export class CatalogoMunicipio extends Document {
  @Prop({ required: true })
  claveEntidad: string;  // 01-32

  @Prop({ required: true, match: /^\d{3}$/ })
  claveMunicipio: string;  // 001-999

  @Prop({ required: true, uppercase: true })
  nombre: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: Date, default: Date.now })
  fechaActualizacion: Date;
}

export const CatalogoMunicipioSchema = SchemaFactory.createForClass(CatalogoMunicipio);

// Índice compuesto
CatalogoMunicipioSchema.index({ claveEntidad: 1, claveMunicipio: 1 }, { unique: true });
```

### 4.3. Catálogo de Localidades (INEGI)

```typescript
@Schema()
export class CatalogoLocalidad extends Document {
  @Prop({ required: true })
  claveEntidad: string;

  @Prop({ required: true })
  claveMunicipio: string;

  @Prop({ required: true, match: /^\d{4}$/ })
  claveLocalidad: string;

  @Prop({ required: true, uppercase: true })
  nombre: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatalogoLocalidadSchema = SchemaFactory.createForClass(CatalogoLocalidad);

CatalogoLocalidadSchema.index({ 
  claveEntidad: 1, 
  claveMunicipio: 1, 
  claveLocalidad: 1 
}, { unique: true });
```

### 4.4. Catálogo CIE-10

**Archivo nuevo:** `backend/src/modules/catalogos/schemas/catalogo-cie10.schema.ts`

```typescript
@Schema()
export class CatalogoCIE10 extends Document {
  @Prop({ required: true, unique: true, uppercase: true })
  codigo: string;  // Ej: "A00", "B15", "C50.9"

  @Prop({ required: true })
  descripcion: string;  // Descripción completa del diagnóstico

  @Prop()
  categoria: string;  // Ej: "I. ENFERMEDADES INFECCIOSAS Y PARASITARIAS"

  @Prop()
  subcategoria: string;

  @Prop({ enum: ['ENFERMEDAD', 'TRAUMATISMO', 'CAUSA_EXTERNA'] })
  tipo: string;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: Date, default: Date.now })
  fechaActualizacion: Date;

  @Prop()
  notasUso: string;  // Notas de uso del código
}

export const CatalogoCIE10Schema = SchemaFactory.createForClass(CatalogoCIE10);

CatalogoCIE10Schema.index({ codigo: 1 });
CatalogoCIE10Schema.index({ descripcion: 'text' });  // Búsqueda full-text
```

### 4.5. Catálogo CLUES

```typescript
@Schema()
export class CatalogoCLUES extends Document {
  @Prop({ required: true, unique: true, uppercase: true })
  clues: string;  // 13 caracteres

  @Prop({ required: true })
  nombreEstablecimiento: string;

  @Prop({ required: true })
  claveEntidad: string;

  @Prop({ required: true })
  nombreEntidad: string;

  @Prop()
  claveMunicipio: string;

  @Prop()
  nombreMunicipio: string;

  @Prop()
  claveLocalidad: string;

  @Prop()
  nombreLocalidad: string;

  @Prop()
  domicilio: string;

  @Prop({ enum: ['PUBLICA', 'PRIVADA', 'SOCIAL'] })
  tipoInstitucion: string;

  @Prop()
  nivelAtencion: string;  // Primer, Segundo, Tercer nivel

  @Prop({ default: true })
  activo: boolean;
}

export const CatalogoCLUESSchema = SchemaFactory.createForClass(CatalogoCLUES);
```

---

## 5. MODIFICACIONES A ESQUEMAS DE DOCUMENTOS MÉDICOS

### 5.1. Agregar Estado de Documento (Todos los Esquemas)

**Aplicar a:** NotaMedica, HistoriaClinica, Audiometria, Certificado, etc.

```typescript
// AGREGAR A TODOS LOS ESQUEMAS DE DOCUMENTOS:

@Prop({ 
  required: true,
  enum: ['BORRADOR', 'FINALIZADO', 'CANCELADO'],
  default: 'BORRADOR'
})
estadoDocumento: string;

@Prop()
fechaFinalizacion: Date;

@Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
finalizadoPor: User;

@Prop()
motivoCancelacion: string;  // Si aplica

// Para control de versiones (opcional en Fase 1, requerido en fases posteriores)
@Prop({ default: 1 })
version: number;

@Prop()
documentoOriginal: string;  // ID del documento si es una versión
```

### 5.2. Modificar Campos de Diagnóstico (NotaMedica)

**Archivo:** `backend/src/modules/expedientes/schemas/nota-medica.schema.ts`

```typescript
// REEMPLAZAR:
@Prop({ required: true })
diagnostico: string;

// POR:
@Prop({ 
  required: true,
  type: [{ 
    codigoCIE10: { type: String, ref: 'CatalogoCIE10', required: true },
    descripcion: { type: String, required: true },
    tipo: { type: String, enum: ['PRINCIPAL', 'SECUNDARIO'], required: true }
  }]
})
diagnosticos: {
  codigoCIE10: string;
  descripcion: string;
  tipo: string;
}[];

// Mantener campo de texto libre para compatibilidad (temporal)
@Prop()
diagnosticoTextoLibre: string;  // Deprecado, mantener 6 meses
```

### 5.3. Modificar Audiometría

```typescript
// AGREGAR:
@Prop({ 
  type: [{ 
    codigoCIE10: { type: String, ref: 'CatalogoCIE10' },
    descripcion: { type: String }
  }]
})
diagnosticosAudiometria: {
  codigoCIE10: string;
  descripcion: string;
}[];

// Mantener compatibilidad
@Prop()
diagnosticoAudiometria: string;  // Deprecado
```

---

## 6. ESQUEMA DE AUDITORÍA (AUDIT LOG)

**Archivo nuevo:** `backend/src/modules/auditoria/schemas/audit-log.schema.ts`

```typescript
@Schema()
export class AuditLog extends Document {
  @Prop({ required: true })
  entidad: string;  // 'Trabajador', 'NotaMedica', etc.

  @Prop({ required: true })
  idEntidad: string;  // ID del documento afectado

  @Prop({ required: true, enum: ['CREATE', 'UPDATE', 'DELETE', 'FINALIZE'] })
  accion: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  usuario: User;

  @Prop({ type: Object })
  datosAnteriores: any;  // Snapshot antes del cambio

  @Prop({ type: Object })
  datosNuevos: any;  // Snapshot después del cambio

  @Prop()
  camposModificados: string[];  // ['diagnostico', 'tratamiento']

  @Prop({ required: true, type: Date, default: Date.now })
  fechaHora: Date;

  @Prop()
  ipOrigen: string;

  @Prop()
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ entidad: 1, idEntidad: 1 });
AuditLogSchema.index({ usuario: 1, fechaHora: -1 });
```

---

## 7. RESUMEN DE CAMBIOS POR ARCHIVO

| Archivo | Tipo de Cambio | Impacto |
|---------|----------------|---------|
| `trabajador.schema.ts` | Agregar 9 campos, modificar 3 | ALTO |
| `centro-trabajo.schema.ts` | Reemplazar 2 campos, agregar 1 | MEDIO |
| `proveedor-salud.schema.ts` | Agregar 1 campo crítico (CLUES), reemplazar 2 | ALTO |
| `nota-medica.schema.ts` | Agregar 5 campos, modificar 1 | MEDIO |
| `audiometria.schema.ts` | Agregar 2 campos | BAJO |
| `historia-clinica.schema.ts` | Agregar 5 campos | BAJO |
| **Nuevos Schemas** | Crear 6 archivos de catálogos | ALTO |
| **Audit Log** | Crear 1 archivo nuevo | MEDIO |

---

## 8. ESTRATEGIA DE IMPLEMENTACIÓN

### Fase 2.1: Catálogos Base (1 semana)
1. Crear esquemas de catálogos
2. Importar datos de INEGI (entidades, municipios, localidades)
3. Importar catálogo CIE-10
4. Importar catálogo CLUES (si disponible)

### Fase 2.2: Esquemas Principales (1 semana)
1. Modificar esquema de trabajadores (con campos opcionales temporalmente)
2. Modificar esquema de centros de trabajo
3. Modificar esquema de proveedores de salud
4. Crear índices y constraints

### Fase 2.3: Documentos Médicos (3 días)
1. Agregar campo `estadoDocumento` a todos los esquemas
2. Modificar campos de diagnóstico para usar CIE-10
3. Agregar campos de versionado

### Fase 2.4: Auditoría (2 días)
1. Crear esquema de audit log
2. Implementar middleware de auditoría

---

## 9. SCRIPTS DE MIGRACIÓN REQUERIDOS

### Script 1: Normalizar Nombres Existentes

```typescript
// Convertir todos los nombres a mayúsculas
await TrabajadorModel.updateMany(
  {},
  [
    {
      $set: {
        nombre: { $toUpper: "$nombre" },
        primerApellido: { $toUpper: "$primerApellido" },
        segundoApellido: { $toUpper: "$segundoApellido" }
      }
    }
  ]
);
```

### Script 2: Migrar Códigos de Sexo

```typescript
// Agregar sexoCodigo basado en sexo actual
await TrabajadorModel.updateMany(
  { sexo: "Masculino" },
  { $set: { sexoCodigo: "1" } }
);

await TrabajadorModel.updateMany(
  { sexo: "Femenino" },
  { $set: { sexoCodigo: "2" } }
);
```

### Script 3: Agregar Estado a Documentos Existentes

```typescript
// Marcar todos los documentos existentes como FINALIZADOS (tienen PDF)
await NotaMedicaModel.updateMany(
  { rutaPDF: { $exists: true, $ne: null } },
  { $set: { estadoDocumento: 'FINALIZADO', fechaFinalizacion: '$createdAt' } }
);
```

---

**Siguiente Paso:** Revisar [PARTE 3: Integración de Catálogos](PLAN_NOM024_FASE1_PARTE3_CATALOGOS.md)

