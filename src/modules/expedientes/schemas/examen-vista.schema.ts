import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

const siONo = ["Si", "No"];

const agudezaVisualInterpretaciones = [
  "Visión excepcional",
  "Visión normal",
  "Visión ligeramente reducida",
  "Visión moderadamente reducida",
  "Visión significativamente reducida",
  "Visión muy reducida",
];

const ishiharaInterpretaciones = ["Normal", "Daltonismo"];

@Schema()
export class ExamenVista extends Document {
    @Prop({ required: true })
    fechaExamenVista: Date

    // Agudeza Visual

    // Sin corrección vista lejana
    @Prop({ required: true })
    ojoIzquierdoLejanaSinCorreccion: number

    @Prop({ required: true })
    ojoDerechoLejanaSinCorreccion: number

    @Prop({ required: true, enum: agudezaVisualInterpretaciones })
    sinCorreccionLejanaInterpretacion: string

    @Prop({ required: true, enum: siONo })
    requiereLentesUsoGeneral: string

    // Sin corrección vista cercana
    @Prop({ required: true })
    ojoIzquierdoCercanaSinCorreccion: number

    @Prop({ required: true })
    ojoDerechoCercanaSinCorreccion: number

    @Prop({ required: true, enum: agudezaVisualInterpretaciones })
    sinCorreccionCercanaInterpretacion: string

    @Prop({ required: true, enum: siONo })
    requiereLentesParaLectura: string

    // Con corrección vista lejana
    @Prop()
    ojoIzquierdoLejanaConCorreccion: number

    @Prop()
    ojoDerechoLejanaConCorreccion: number

    @Prop({ enum: agudezaVisualInterpretaciones })
    conCorreccionLejanaInterpretacion: string

    // Con corrección vista cercana
    @Prop()
    ojoIzquierdoCercanaConCorreccion: number

    @Prop()
    ojoDerechoCercanaConCorreccion: number

    @Prop({ enum: agudezaVisualInterpretaciones })
    conCorreccionCercanaInterpretacion: string

    // Ishihara
    @Prop({ required: true })
    placasCorrectas: number

    @Prop({ required: true })
    porcentajeIshihara: number

    @Prop({ required: true, enum: ishiharaInterpretaciones })
    interpretacionIshihara: string

    // Trabajador, ruta al archivo e info de creador y actualizador
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ required: true })
    rutaPDF: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const ExamenVistaSchema = SchemaFactory.createForClass(ExamenVista).set('timestamps', true);
