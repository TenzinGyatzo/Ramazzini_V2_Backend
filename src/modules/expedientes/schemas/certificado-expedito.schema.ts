import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Trabajador } from 'src/modules/trabajadores/entities/trabajador.entity';
import { User } from 'src/modules/users/entities/user.entity';

const gradosSalud = [
    'Óptimo',
    'Bueno',
    'Regular',
    'Malo'
  ]

const tipoAptitud = [
    "Apto Sin Restricciones",
    "Apto Con Precaución",
    "Apto Con Restricciones",
    "No Apto",
    "Evaluación No Completada",
  ];

@Schema()
export class CertificadoExpedito extends Document {
    @Prop({ required: true })
    fechaCertificadoExpedito: Date

    @Prop({ required: true })
    cuerpoCertificado: string
    
    @Prop()
    impedimentosFisicos: string

    // Somatometría
    @Prop()
    peso: number;

    @Prop()
    altura: number;

    @Prop()
    indiceMasaCorporal: number;

    // Signos Vitales
    @Prop()
    tensionArterialSistolica: number;

    @Prop()
    tensionArterialDiastolica: number;

    @Prop()
    frecuenciaCardiaca: number;

    @Prop()
    frecuenciaRespiratoria: number;

    @Prop()
    temperaturaCorporal: number;

    // Conclusión
    @Prop({ enum: gradosSalud })
    gradoSalud: string;

    @Prop({ enum: tipoAptitud })
    aptitudPuesto: string;

    @Prop()
    descripcionSobreAptitud: string;

    @Prop() // Aquí puede agregar la info sobre la vacunacion vs COVID
    observaciones: string; 

    // Identificación
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Trabajador', required: true })
    idTrabajador: Trabajador;

    @Prop({ required: true })
    rutaPDF: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    createdBy: User;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    updatedBy: User;
}

export const CertificadoExpeditoSchema = SchemaFactory.createForClass(CertificadoExpedito).set('timestamps', true);