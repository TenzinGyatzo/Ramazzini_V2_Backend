import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from '../../trabajadores/schemas/trabajador.schema';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentoEstado } from '../enums/documento-estado.enum';

/**
 * GIIS-B019 Detección/Tamizaje Schema
 *
 * Represents screening and detection records per GIIS-B019 specification.
 * Only enabled for MX providers (proveedorSalud.pais === 'MX').
 *
 * Note: Official DGIS catalogs (TIPO_PERSONAL, SERVICIOS_DET, AFILIACION, PAIS)
 * are NOT publicly available. Best-effort validation is applied.
 */
@Schema()
export class Deteccion extends Document {
  // ==================== A) Core / Linkage Fields ====================

  @Prop({ required: true })
  fechaDeteccion: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Trabajador',
    required: true,
  })
  idTrabajador: Trabajador;

  @Prop({
    required: false, // Required for MX, optional for non-MX
    match: /^[A-Z0-9]{11}$/,
  })
  clues?: string; // CLUES del establecimiento (11 caracteres) - snapshot

  @Prop({
    required: false, // Required for MX, optional for non-MX
    match: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
  })
  curpPrestador?: string; // CURP del prestador de servicios (18 caracteres)

  // ==================== B) Screening / Service Identifiers ====================

  @Prop({
    required: false, // Required for MX
    // Note: Official DGIS catalog (TIPO_PERSONAL) not publicly available
    // Best-effort: validate integer >= 1
  })
  tipoPersonal?: number; // Tipo de personal de salud

  @Prop({
    required: false, // Required for MX
    // Note: Official DGIS catalog (SERVICIOS_DET) not publicly available
    // Best-effort: validate integer >= 1
  })
  servicioAtencion?: number; // Servicio de atención

  @Prop({ required: false })
  primeraVezAnio?: boolean; // Primera vez en el año actual

  // ==================== C) Measurements / Vitals ====================

  @Prop({
    required: false,
    min: 1,
    max: 400,
  })
  peso?: number; // Peso en kg (1-400)

  @Prop({
    required: false,
    min: 20,
    max: 300,
  })
  talla?: number; // Talla en cm (20-300)

  @Prop({
    required: false,
    min: 20,
    max: 300,
  })
  cintura?: number; // Cintura en cm (20-300)

  @Prop({
    required: false,
    min: 30,
    max: 250,
  })
  tensionArterialSistolica?: number; // Presión sistólica (mmHg)

  @Prop({
    required: false,
    min: 20,
    max: 150,
  })
  tensionArterialDiastolica?: number; // Presión diastólica (mmHg)

  @Prop({
    required: false,
    min: 20,
    max: 999,
  })
  glucemia?: number; // Glucemia (mg/dL)

  @Prop({
    required: false,
    enum: [1, 2], // 1=Ayuno, 2=Casual
  })
  tipoMedicionGlucemia?: number; // Tipo de medición (requerido si glucemia > 0)

  // ==================== D) Results Blocks ====================

  // Mental Health Block (age >= 10, exclude Trabajador Social if tipoPersonal=30)
  @Prop({ required: false, enum: [0, 1, -1] }) // 0=Positivo, 1=Negativo, -1=NA
  depresion?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  ansiedad?: number;

  // Geriatrics Block (age >= 60, exclude Trabajador Social)
  @Prop({ required: false, enum: [0, 1, -1] })
  deterioroMemoria?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  riesgoCaidas?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  alteracionMarcha?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  dependenciaABVD?: number; // Actividades Básicas de Vida Diaria

  @Prop({ required: false, enum: [0, 1, -1] })
  necesitaCuidador?: number;

  // Chronic Diseases Block (age >= 20)
  @Prop({ required: false, enum: [0, 1, -1] })
  riesgoDiabetes?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  riesgoHipertension?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  obesidad?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  dislipidemia?: number;

  // Addictions Block (exclude Trabajador Social)
  @Prop({ required: false, enum: [0, 1, -1] })
  consumoAlcohol?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  consumoTabaco?: number;

  @Prop({ required: false, enum: [0, 1, -1] })
  consumoDrogas?: number;

  // ITS Block (exclude Trabajador Social)
  @Prop({ required: false, min: 1, max: 10 }) // Resultado 1-10
  resultadoVIH?: number;

  @Prop({ required: false, min: 1, max: 10 })
  resultadoSifilis?: number;

  @Prop({ required: false, min: 1, max: 10 })
  resultadoHepatitisB?: number;

  // Cancer Screening (sex/age specific)
  @Prop({ required: false, enum: [0, 1, -1] })
  cancerCervicouterino?: number; // Mujeres 25-64

  @Prop({ required: false, enum: [0, 1, -1] })
  vph?: number; // Mujeres 35-64

  @Prop({ required: false, enum: [0, 1, -1] })
  cancerMama?: number; // Exclude Trabajador Social

  @Prop({ required: false, enum: [0, 1, -1] })
  hiperplasiaProstatica?: number; // Hombres >= 40

  // Violence Detection
  @Prop({ required: false, enum: [0, 1, -1] })
  violenciaMujer?: number; // Mujeres >= 15

  // ==================== E) Document Lifecycle Fields ====================

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;

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

export const DeteccionSchema = SchemaFactory.createForClass(Deteccion);

// Index for Trabajador lookup
DeteccionSchema.index({ idTrabajador: 1 });

// Index for date range queries
DeteccionSchema.index({ fechaDeteccion: 1 });

// Index for CLUES-based queries
DeteccionSchema.index({ clues: 1, fechaDeteccion: 1 });

DeteccionSchema.set('timestamps', true);
