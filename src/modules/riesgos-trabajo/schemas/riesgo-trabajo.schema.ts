import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

const tiposDeRiesgo = ['Accidente de Trabajo', 'Accidente de Trayecto', 'Enfermedad de Trabajo'];

const siNO = ['Si', 'No'];

const tiposManejo = ['IMSS', 'Interno'];

const tipoAlta = ['Alta Interna', 'Alta ST2', 'Incapacidad Activa'];

@Schema()
export class RiesgoTrabajo extends Document {
    @Prop({required: true})
    fechaRiesgo: Date;

    @Prop()
    recaida?: string;

    @Prop({ match: /^\d{11}$/ })
    NSS?: string;

    @Prop({enum: tiposDeRiesgo })
    tipoRiesgo?: string;
    
    @Prop()
    naturalezaLesion?: string;

    @Prop()
    parteCuerpoAfectada?: string;

    @Prop({ enum: tiposManejo })
    manejo?: string;

    @Prop({ enum: tipoAlta })
    alta?: string; 

    @Prop()
    fechaAlta?: Date;

    @Prop()
    diasIncapacidad?: number;

    @Prop({ enum: siNO })
    secuelas?: string;

    @Prop({ min: 0, max: 100 })
    porcentajeIPP?: number;

    @Prop()
    notas?: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const RiesgoTrabajoSchema = SchemaFactory.createForClass(RiesgoTrabajo).set('timestamps', true);