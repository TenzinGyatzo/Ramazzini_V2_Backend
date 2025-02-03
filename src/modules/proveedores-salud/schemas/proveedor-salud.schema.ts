import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

const perfiles = [
  'Médico único de empresa',
  'Médico independiente que brinda servicios a empresas',
  'Empresa de salud ocupacional',
  'Equipo Médico Interno de la Empresa',
  'Otro',
]

interface Logotipo {
  data: string;
  contentType: string;
}

@Schema()
export class ProveedorSalud extends Document {
  @Prop({ required: true })
  nombre: string;
  @Prop({ required: true }) 
  RFC: string;
  @Prop({ required: true, enum: perfiles })
  perfilProveedorSalud: string;
  @Prop({
    type: {
      data: { type: String },
      contentType: { type: String },
    },
  })
  logotipoEmpresa: Logotipo;
  @Prop()
  estado: string;
  @Prop()
  municipio: string;
  @Prop()
  codigoPostal: string;
  @Prop()
  direccion: string;
  @Prop()
  telefono: string;
  @Prop()
  correoElectronico: string;
  @Prop()
  sitioWeb: string;
}

export const ProveedorSaludSchema = SchemaFactory.createForClass(ProveedorSalud);