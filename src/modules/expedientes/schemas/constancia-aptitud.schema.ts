import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Schema()
export class ConstanciaAptitud extends Document {
    @Prop({ required: true })
    fechaConstanciaAptitud: Date;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ required: true })
    rutaPDF: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const ConstanciaAptitudSchema = SchemaFactory.createForClass(ConstanciaAptitud).set('timestamps', true);