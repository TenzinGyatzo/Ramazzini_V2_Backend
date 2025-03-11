import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { ProveedoresSalud } from 'src/modules/proveedores-salud/entities/proveedores-salud.entity';

interface Logotipo {
  data: string;
  contentType: string;
  }

@Schema()
export class Empresa extends Document {
  @Prop({ required: true })
  nombreComercial: string;

  @Prop()
  razonSocial: string;

  @Prop({ unique: true })
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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProveedoresSalud', required: true })
  idProveedorSalud: ProveedoresSalud
}

export const EmpresaSchema = SchemaFactory.createForClass(Empresa).set('timestamps', true);