import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

const resultado = ["Positivo", "Negativo"];

@Schema()
export class Antidoping extends Document {
    @Prop({ required: true })
    fechaAntidoping: Date;

    @Prop({ required: true, enum: resultado })
    marihuana: string;

    @Prop({ required: true, enum: resultado })
    cocaina: string;

    @Prop({ required: true, enum: resultado })
    anfetaminas: string;

    @Prop({ required: true, enum: resultado })
    metanfetaminas: string;

    @Prop({ required: true, enum: resultado })
    opiaceos: string;

    @Prop({ enum: resultado })
    benzodiacepinas: string;

    @Prop({ enum: resultado })
    fenciclidina: string;

    @Prop({ enum: resultado })
    metadona: string;

    @Prop({ enum: resultado })
    barbituricos: string;

    @Prop({ enum: resultado })
    antidepresivosTriciclicos: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ required: true })
    rutaPDF: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const AntidopingSchema = SchemaFactory.createForClass(Antidoping).set('timestamps', true);