import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Schema()
export class NotaMedica extends Document {
    @Prop({ required: true })
    fechaNotaMedica: Date

    @Prop({ required: true })
    motivoConsulta: string

    @Prop()
    antecedentes: string

    @Prop({ required: true })
    exploracionFisica: string

    @Prop({ required: true })
    tensionArterialSistolica: number;
  
    @Prop({ required: true })
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
    diagnostico: string

    @Prop({ required: true })
    tratamiento: string

    @Prop()
    recomendaciones: string

    @Prop()
    observaciones: string

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ required: true })
    rutaPDF: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const NotaMedicaSchema = SchemaFactory.createForClass(NotaMedica).set('timestamps', true);