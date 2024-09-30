import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';

const basesOperaciones = ["Pruebas", "Los Mochis"];

interface Logotipo {
    data: string;
    contentType: string;
  }

@Schema()
export class Empresa extends Document {
  @Prop({ required: true })
  nombreComercial: string;

  @Prop({ required: true })
  razonSocial: string;

  @Prop({ required: true })
  RFC: string;

  @Prop()
  giroDeEmpresa: string;

  @Prop({
    type: {
      data: {type: String},
      contentType: {type: String}
    } 
  })
  logotipoEmpresa: Logotipo

  @Prop({ required: true, enum: basesOperaciones, default: "Pruebas"})
  baseOperaciones: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa).set('timestamps', true);