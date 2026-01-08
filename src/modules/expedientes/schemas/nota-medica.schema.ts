import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from '../../trabajadores/schemas/trabajador.schema';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentoEstado } from '../enums/documento-estado.enum';

const tipoNota = ['Inicial', 'Seguimiento', 'Alta'];

@Schema()
export class NotaMedica extends Document {
  @Prop({ enum: tipoNota })
  tipoNota: string;

  @Prop({ required: true })
  fechaNotaMedica: Date;

  @Prop({ required: true })
  motivoConsulta: string;

  @Prop()
  antecedentes: string;

  @Prop()
  exploracionFisica: string;

  @Prop()
  tensionArterialSistolica: number;

  @Prop()
  tensionArterialDiastolica: number;

  @Prop()
  frecuenciaCardiaca: number;

  @Prop()
  frecuenciaRespiratoria: number;

  @Prop()
  temperatura: number;

  @Prop()
  saturacionOxigeno: number;

  @Prop()
  diagnostico: string; // Free-text diagnosis (kept for backward compatibility)

  // NOM-024: CIE-10 Diagnosis Codes
  // Formato: "CODE - DESCRIPTION" o solo "CODE"
  @Prop({
    required: false,
    // Acepta formato "A30 - LEPRA [ENFERMEDAD DE HANSEN]" o solo "A30"
  })
  codigoCIE10Principal?: string;

  @Prop({
    type: [String],
    required: false,
    // Formato: ["A30 - LEPRA [ENFERMEDAD DE HANSEN]"] o ["A30"]
  })
  codigosCIE10Complementarios?: string[];

  // NOM-024 GIIS-B015: Campos adicionales para diagnóstico
  @Prop({ required: false })
  relacionTemporal?: number; // 0=Primera Vez, 1=Subsecuente

  @Prop({ required: false })
  primeraVezDiagnostico2?: boolean;

  @Prop({
    required: false,
    // Formato: "A30 - LEPRA [ENFERMEDAD DE HANSEN]" o solo "A30"
  })
  codigoCIEDiagnostico2?: string; // Segundo diagnóstico

  @Prop({ required: false })
  diagnosticoTexto?: string; // Texto libre complementario al diagnóstico 2

  @Prop({ required: false })
  confirmacionDiagnostica?: boolean; // Flag para crónicos/cáncer <18

  @Prop({
    required: false,
    // Formato: "V01 - ACCIDENTE DE TRÁNSITO" o solo "V01"
  })
  codigoCIECausaExterna?: string; // Para Cap. XIX/XX

  @Prop({ required: false })
  causaExterna?: string; // Texto libre para causa externa

  @Prop({ type: [String] })
  tratamiento: string[];

  @Prop({ type: [String] })
  recomendaciones: string;

  @Prop()
  observaciones: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Trabajador',
    required: true,
  })
  idTrabajador: Trabajador;

  @Prop({ required: true })
  rutaPDF: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;

  // Document State Management (NOM-024)
  @Prop({
    enum: DocumentoEstado,
    required: true,
    default: DocumentoEstado.BORRADOR,
  })
  estado: DocumentoEstado;

  @Prop({ required: false })
  fechaFinalizacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  finalizadoPor?: User;

  @Prop({ required: false })
  fechaAnulacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  anuladoPor?: User;

  @Prop({ required: false })
  razonAnulacion?: string;
}

export const NotaMedicaSchema = SchemaFactory.createForClass(NotaMedica).set(
  'timestamps',
  true,
);
