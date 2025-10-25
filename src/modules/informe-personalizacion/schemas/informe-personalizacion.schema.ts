import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { Empresa } from 'src/modules/empresas/entities/empresa.entity';
import { CentroTrabajo } from 'src/modules/centros-trabajo/entities/centros-trabajo.entity';

export type InformePersonalizacionDocument = InformePersonalizacion & Document;

export interface RecomendacionItem {
  hallazgo: string;
  medidaPreventiva: string;
}

@Schema()
export class InformePersonalizacion extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Empresa', required: true })
  idEmpresa: Empresa;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CentroTrabajo', required: false })
  idCentroTrabajo?: CentroTrabajo;

  @Prop({ required: false })
  conclusiones?: string; // HTML content

  @Prop({ 
    type: String, 
    enum: ['texto', 'tabla'], 
    default: 'texto' 
  })
  formatoRecomendaciones: 'texto' | 'tabla';

  @Prop({ required: false })
  recomendacionesTexto?: string; // HTML content for texto format

  @Prop({ 
    type: [{ 
      hallazgo: { type: String }, 
      medidaPreventiva: { type: String } 
    }], 
    required: false 
  })
  recomendacionesTabla?: RecomendacionItem[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;
}

export const InformePersonalizacionSchema = SchemaFactory.createForClass(InformePersonalizacion).set('timestamps', true);
