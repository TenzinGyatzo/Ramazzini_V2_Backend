import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';

@Schema()
export class ConfiguracionInforme extends Document {
    @Prop({ required: true })
    sexoMedicoFirmante: string
    @Prop({ required: true })
    nombreMedicoFirmante: string
    @Prop({ required: true })
    numeroCedulaProfesional: string
    @Prop({ required: true })
    especialistaSaludTrabajo: boolean
    @Prop({ required: true })
    numeroCedulaEspecialista: string
    @Prop({ required: true })
    nombreCredencialAdicional: string
    @Prop({ required: true })
    numeroCredencialAdicional: string
    @Prop({ required: true })
    firma: Object
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    idUser: User
}