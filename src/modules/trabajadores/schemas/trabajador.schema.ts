import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CentroTrabajo } from "src/modules/centros-trabajo/entities/centros-trabajo.entity";
import { User } from "src/modules/users/entities/user.entity";

const sexos = ["Masculino", "Femenino"];

const nivelesEscolaridad = [
  "Primaria",
  "Secundaria",
  "Preparatoria",
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Nula",
];

const estadosCiviles = [
  "Soltero/a",
  "Casado/a",
  "Unión libre",
  "Separado/a",
  "Divorciado/a",
  "Viudo/a",
];

@Schema()
export class Trabajador extends Document {

    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    fechaNacimiento: Date;

    @Prop({ required: true, enum: sexos })
    sexo: string;

    @Prop({ required: true, enum: nivelesEscolaridad })
    escolaridad: string;

    @Prop({ required: true })
    puesto: string;

    @Prop({ required: true })
    fechaIngreso: Date;

    @Prop({ required: true })
    telefono: string;

    @Prop({ required: true, enum: estadosCiviles })
    estadoCivil: string;

    @Prop({ required: true })
    hijos: number;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'CentroTrabajo', required: true })
    idCentroTrabajo: CentroTrabajo;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const TrabajadorSchema = SchemaFactory.createForClass(Trabajador).set('timestamps', true);