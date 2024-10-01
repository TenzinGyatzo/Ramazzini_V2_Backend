import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { Empresa } from 'src/modules/empresas/entities/empresa.entity';

const estadosDeMexico = [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Coahuila",
    "Colima",
    "Durango",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Estado de México",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas",
  ];

@Schema()
export class CentroTrabajo extends Document {
  @Prop({ required: true })
  nombreCentro: string;

  @Prop({ required: true })
  direccionCentro: string;

  @Prop({ required: true })
  codigoPostal: string;

  @Prop({ required: true, enum: estadosDeMexico })
  estado: string;

  @Prop({ required: true })
  municipio: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Empresa', required: true })
  idEmpresa: Empresa;   

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;
}

export const CentroTrabajoSchema = SchemaFactory.createForClass(CentroTrabajo).set('timestamps', true);