import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

interface Logotipo {
  data: string;
  contentType: string;
}

@Schema()
export class ProveedorSalud extends Document {
  @Prop({ required: true })
  nombreComercial: string;
  @Prop()
  razonSocial: string;
  @Prop()
  RFC: string;
  @Prop({
    type: {
      data: { type: String },
      contentType: { type: String },
    },
  })
  logotipoEmpresa: Logotipo;
  @Prop()
  direccion: string;
  @Prop()
  ciudad: string;
  @Prop()
  municipio: string;
  @Prop()
  estado: string;
  @Prop()
  codigoPostal: string;
  @Prop()
  telefono: string;
  @Prop()
  correoElectronico: string;
  @Prop()
  sitioWeb: string;
}

export const ProveedorSaludSchema = SchemaFactory.createForClass(ProveedorSalud);