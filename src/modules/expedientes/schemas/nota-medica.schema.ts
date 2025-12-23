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

  @Prop({ required: true })
  diagnostico: string; // Free-text diagnosis (kept for backward compatibility)

  // NOM-024: CIE-10 Diagnosis Codes
  @Prop({
    required: false,
    match: /^$|^[A-Z][0-9]{2}(\.[0-9]{1,2})?$/, // CIE-10 format: A00.0 or A00
  })
  codigoCIE10Principal?: string;

  @Prop({
    type: [String],
    required: false,
  })
  codigosCIE10Secundarios?: string[];

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
