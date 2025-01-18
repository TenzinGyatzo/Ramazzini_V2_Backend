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
  @Prop({ required: true })
  razonSocial: string;
  @Prop({ required: true })
  RFC: string;
  @Prop({
    type: {
      data: { type: String },
      contentType: { type: String },
    },
  })
  logotipoEmpresa: Logotipo;
  @Prop({ required: true })
  direccion: string;
  @Prop({ required: true })
  ciudad: string;
  @Prop({ required: true })
  municipio: string;
  @Prop({ required: true })
  estado: string;
  @Prop({ required: true })
  codigoPostal: string;
  @Prop({ required: true })
  telefono: string;
  @Prop({ required: true })
  correoElectronico: string;
  @Prop()
  sitioWeb: string;
}
