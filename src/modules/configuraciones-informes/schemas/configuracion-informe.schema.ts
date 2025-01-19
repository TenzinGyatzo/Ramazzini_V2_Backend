import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';

interface Logotipo {
  data: string;
  contentType: string;
}

@Schema()
export class ConfiguracionInforme extends Document {
  @Prop({ required: true })
  nombreMedicoFirmante: string;
  @Prop()
  sexoMedicoFirmante?: string;
  @Prop()
  numeroCedulaProfesional?: string;
  @Prop()
  especialistaSaludTrabajo?: boolean;
  @Prop()
  numeroCedulaEspecialista?: string;
  @Prop()
  nombreCredencialAdicional?: string;
  @Prop()
  numeroCredencialAdicional?: string;
  @Prop({
    type: {
      data: { type: String },
      contentType: { type: String },
    },
  })
  firma?: Object;
  @Prop({
    type: {
      data: { type: String },
      contentType: { type: String },
    },
  })
  firmaConAntefirma?: Object;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  idUser: User;
}

export const ConfiguracionInformeSchema =
  SchemaFactory.createForClass(ConfiguracionInforme);
