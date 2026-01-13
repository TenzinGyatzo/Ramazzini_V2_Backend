import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from '../../trabajadores/schemas/trabajador.schema';
import { User } from 'src/modules/users/entities/user.entity';
import { DocumentoEstado } from '../enums/documento-estado.enum';

const siONo = ['Si', 'No'];

const agudezaVisualInterpretaciones = [
  'Visión excepcional',
  'Visión normal',
  'Visión ligeramente reducida',
  'Visión moderadamente reducida',
  'Visión significativamente reducida',
  'Visión muy reducida',
];

const ishiharaInterpretaciones = ['Normal', 'Daltonismo'];

@Schema()
export class ExamenVista extends Document {
  @Prop({ required: true })
  fechaExamenVista: Date;

  // Agudeza Visual

  // Sin corrección vista lejana
  @Prop({ required: true })
  ojoIzquierdoLejanaSinCorreccion: number;

  @Prop({ required: true })
  ojoDerechoLejanaSinCorreccion: number;

  @Prop({ required: true, enum: agudezaVisualInterpretaciones })
  sinCorreccionLejanaInterpretacion: string;

  @Prop({ required: true, enum: siONo })
  requiereLentesUsoGeneral: string;

  // Sin corrección vista cercana
  @Prop({ required: true })
  ojoIzquierdoCercanaSinCorreccion: number;

  @Prop({ required: true })
  ojoDerechoCercanaSinCorreccion: number;

  @Prop({ required: true, enum: agudezaVisualInterpretaciones })
  sinCorreccionCercanaInterpretacion: string;

  @Prop({ required: true, enum: siONo })
  requiereLentesParaLectura: string;

  // Con corrección vista lejana
  @Prop()
  ojoIzquierdoLejanaConCorreccion: number;

  @Prop()
  ojoDerechoLejanaConCorreccion: number;

  @Prop({ enum: agudezaVisualInterpretaciones })
  conCorreccionLejanaInterpretacion: string;

  // Con corrección vista cercana
  @Prop()
  ojoIzquierdoCercanaConCorreccion: number;

  @Prop()
  ojoDerechoCercanaConCorreccion: number;

  @Prop({ enum: agudezaVisualInterpretaciones })
  conCorreccionCercanaInterpretacion: string;

  // Ishihara
  @Prop({ required: true })
  placasCorrectas: number;

  @Prop({ required: true })
  porcentajeIshihara: number;

  @Prop({ required: true, enum: ishiharaInterpretaciones })
  interpretacionIshihara: string;

  // Pruebas de función ocular
  @Prop()
  testEstereopsis: string;

  @Prop()
  testCampoVisual: string;

  @Prop()
  coverTest: string;

  // Receta Final
  @Prop()
  esferaOjoIzquierdo: string;

  @Prop()
  cilindroOjoIzquierdo: string;

  @Prop()
  adicionOjoIzquierdo: string;

  @Prop()
  esferaOjoDerecho: string;

  @Prop()
  cilindroOjoDerecho: string;

  @Prop()
  adicionOjoDerecho: string;

  // Diagnóstico y recomendaciones
  @Prop()
  diagnosticoRecomendaciones: string;

  // Trabajador, ruta al archivo e info de creador y actualizador
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Trabajador',
    required: true,
  })
  idTrabajador: Trabajador;

  @Prop({ required: true })
  rutaPDF: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  updatedBy: User;

  // Consentimiento Diario (NOM-024)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ConsentimientoDiario',
    required: false,
  })
  consentimientoDiarioId?: MongooseSchema.Types.ObjectId;

  // Document State Management (NOM-024)
  @Prop({
    enum: DocumentoEstado,
    required: true,
    default: DocumentoEstado.BORRADOR,
  })
  estado: DocumentoEstado;

  @Prop({ required: false })
  fechaFinalizacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  finalizadoPor?: User;

  @Prop({ required: false })
  fechaAnulacion?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: false })
  anuladoPor?: User;

  @Prop({ required: false })
  razonAnulacion?: string;
}

export const ExamenVistaSchema = SchemaFactory.createForClass(ExamenVista).set(
  'timestamps',
  true,
);
