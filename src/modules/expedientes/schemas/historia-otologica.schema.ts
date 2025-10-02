import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

const siONo = ["Si", "No"];

const proteccionAuditivaOpciones = ["Siempre", "A veces", "Nunca"];

const otoscopiaOpciones = ["Permeable", "No permeable"];

const tiempoExposicionOpciones = [
  "Menos de 1 año",
  "1 - 5 años", 
  "6 - 10 años",
  "11 - 15 años",
  "16 - 20 años",
  "Más de 20 años"
];

const resultadoCuestionarioOpciones = ["Procedente", "Procedente con precaución", "No procedente"];

@Schema()
export class HistoriaOtologica extends Document {
    @Prop({ required: true })
    fechaHistoriaOtologica: Date

    // Síntomas recientes (últimos 2 meses)
    @Prop({ enum: siONo })
    dolorOido: string

    @Prop({ enum: siONo })
    supuracionOido: string

    @Prop({ enum: siONo })
    mareoVertigo: string

    @Prop({ enum: siONo })
    zumbidoTinnitus: string

    @Prop({ enum: siONo })
    perdidaAudicion: string

    @Prop({ enum: siONo })
    oidoTapadoPlenitud: string

    // Antecedentes personales
    @Prop({ enum: siONo })
    otitisFrecuentesInfancia: string

    @Prop({ enum: siONo })
    cirugiasOido: string

    @Prop({ enum: siONo })
    traumatismoCranealBarotrauma: string

    @Prop({ enum: siONo })
    usoAudifonos: string

    @Prop({ enum: siONo })
    historiaFamiliarHipoacusia: string

    @Prop({ enum: siONo })
    meningitisInfeccionGraveInfancia: string

    @Prop({ enum: siONo })
    diabetes: string

    @Prop({ enum: siONo })
    enfermedadRenal: string

    @Prop({ enum: siONo })
    medicamentosOtotoxicos: string

    // Exposición a ruido
    @Prop({ enum: siONo })
    trabajoAmbientesRuidosos: string

    @Prop({ enum: tiempoExposicionOpciones })
    tiempoExposicionLaboral: string

    @Prop({ enum: proteccionAuditivaOpciones })
    usoProteccionAuditiva: string

    @Prop({ enum: siONo })
    musicaFuerteAudifonos: string

    @Prop({ enum: siONo })
    armasFuegoPasatiemposRuidosos: string

    @Prop({ enum: siONo })
    servicioMilitar: string

    // Otros
    @Prop({ enum: siONo })
    alergias: string

    @Prop({ enum: siONo })
    resfriadoDiaPrueba: string

    // Otoscopia
    @Prop({ enum: otoscopiaOpciones })
    otoscopiaOidoDerecho: string

    @Prop({ enum: otoscopiaOpciones })
    otoscopiaOidoIzquierdo: string

    // Resultado de cuestionario
    @Prop( { enum: resultadoCuestionarioOpciones })
    resultadoCuestionario: string

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

export const HistoriaOtologicaSchema = SchemaFactory.createForClass(HistoriaOtologica).set('timestamps', true);
