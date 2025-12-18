import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentoEstado } from '../enums/documento-estado.enum';

/**
 * GIIS-B013 Lesion/Injury Schema
 * 
 * Represents injury and violence reporting per GIIS-B013 specification.
 * Only enabled for MX providers (proveedorSalud.pais === 'MX').
 */
@Schema()
export class Lesion extends Document {
  // Identificación del Establecimiento
  @Prop({ 
    required: true,
    match: /^[A-Z0-9]{11}$/,
  })
  clues: string; // CLUES del establecimiento (11 caracteres)

  @Prop({ 
    required: true,
    match: /^[0-9]{8}$/,
  })
  folio: string; // Identificador interno único por CLUES+fechaAtencion (8 dígitos)

  // Identificación del Paciente
  @Prop({ 
    required: true,
    match: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
  })
  curpPaciente: string; // CURP del paciente (18 caracteres)

  @Prop({ required: true })
  fechaNacimiento: Date; // Fecha de nacimiento

  @Prop({ 
    required: true,
    enum: [1, 2, 3], // 1=Hombre, 2=Mujer, 3=Intersexual
  })
  sexo: number; // Sexo según GIIS

  // Información del Evento
  @Prop({ required: true })
  fechaEvento: Date; // Fecha del evento/lesión

  @Prop()
  horaEvento?: string; // Hora del evento (HH:mm)

  @Prop({ 
    required: true,
    // Note: Official DGIS catalog (SITIO_OCURRENCIA) not publicly available
    // Validated only for type (integer) and basic bounds (>= 1)
  })
  sitioOcurrencia: number; // Lugar donde ocurrió el evento

  @Prop({ 
    required: true,
    enum: [1, 2, 3, 4], // 1=Accidental, 2=Violencia Familiar, 3=Violencia No Familiar, 4=Autoinfligido
  })
  intencionalidad: number; // Intención del evento

  // Condicional: Obligatorio si intencionalidad = 1, 4 o Violencia Física/Sexual
  @Prop({ 
    required: false,
    // Note: Official DGIS catalog (AGENTE_LESION) not publicly available
    // Validated only for type (integer) and basic bounds (>= 1)
  })
  agenteLesion?: number; // Objeto/mecanismo de lesión

  // Condicional: Obligatorio si intencionalidad = 2 o 3 (Violencia)
  @Prop({ 
    type: [Number],
    required: false,
    // Catálogo interno: 6-10
  })
  tipoViolencia?: number[]; // Tipología de violencia (multivalor)

  // Información de Atención
  @Prop({ required: true })
  fechaAtencion: Date; // Fecha de registro clínico

  @Prop()
  horaAtencion?: string; // Hora de atención (HH:mm)

  @Prop({ 
    type: [Number],
    required: true,
    // Catálogo interno: 1-9, máximo 5 valores
  })
  tipoAtencion: number[]; // Tipos de tratamiento otorgado (multivalor, max 5)

  @Prop({ 
    required: true,
    // Note: Official DGIS catalog (AREA_ANATOMICA) not publicly available
    // Validated only for type (integer) and basic bounds (>= 1)
  })
  areaAnatomica: number; // Zona corporal más grave (15 = múltiples áreas)

  @Prop({ 
    required: true,
    // Note: Official DGIS catalog (CONSECUENCIA) not publicly available
    // Validated only for type (integer) and basic bounds (>= 1)
  })
  consecuenciaGravedad: number; // Resultado físico de la lesión

  // Diagnósticos CIE-10
  @Prop({ 
    required: true,
    match: /^[A-Z][0-9]{2}(\.[0-9]{1,2})?$/, // CIE-10 format
  })
  codigoCIEAfeccionPrincipal: string; // Diagnóstico principal (Capítulos V, XIX, obstétricos)

  @Prop({ 
    required: true,
    match: /^V[0-9]{2}|^W[0-9]{2}|^X[0-9]{2}|^Y[0-9]{2}$/, // CIE-10 Chapter XX (V01-Y98)
  })
  codigoCIECausaExterna: string; // Código CIE-10 causa externa (Chapter XX: V01-Y98)

  @Prop({ 
    type: [String],
    required: false,
  })
  afeccionesTratadas?: string[]; // Comorbilidades/diagnósticos secundarios (formato: Num#Desc#CIE)

  // Profesional Responsable
  @Prop({ 
    required: true,
    enum: [1, 2, 3], // 1=Médico, 2=Psicólogo, 3=Trabajador Social
  })
  responsableAtencion: number; // Rol del profesional

  @Prop({ 
    required: true,
    match: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
  })
  curpResponsable: string; // CURP del profesional de salud

  // Referencias
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
  idTrabajador: Trabajador; // Referencia al trabajador/paciente

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;

  // Document State Management (NOM-024) - Task 6
  @Prop({ 
    type: String,
    enum: Object.values(DocumentoEstado),
    default: DocumentoEstado.BORRADOR,
    required: true,
  })
  estado: DocumentoEstado;

  @Prop({ type: Date, required: false })
  fechaFinalizacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  finalizadoPor?: User;
}

export const LesionSchema = SchemaFactory.createForClass(Lesion);

// Compound index for folio uniqueness per CLUES + fechaAtencion
LesionSchema.index({ clues: 1, fechaAtencion: 1, folio: 1 }, { unique: true });

// Index for Trabajador lookup
LesionSchema.index({ idTrabajador: 1 });

// Index for date range queries
LesionSchema.index({ fechaAtencion: 1 });
LesionSchema.index({ fechaEvento: 1 });

LesionSchema.set('timestamps', true);

