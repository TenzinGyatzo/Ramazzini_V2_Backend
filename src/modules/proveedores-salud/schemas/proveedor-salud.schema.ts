import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

const perfiles = [
  'Médico único de empresa',
  'Médico independiente que brinda servicios a empresas',
  'Empresa de salud ocupacional',
  'Equipo Médico Interno de la Empresa',
  'Otro',
]

interface Logotipo {
  data: string;
  contentType: string;
}

@Schema()
export class ProveedorSalud extends Document {
  @Prop({ required: true })
  nombre: string;
  @Prop({ required: true }) 
  RFC: string;
  @Prop({ required: true, enum: perfiles })
  perfilProveedorSalud: string;
  @Prop({
    type: {
      data: { type: String },
      contentType: { type: String },
    },
  })
  logotipoEmpresa: Logotipo;
  @Prop()
  estado: string;
  @Prop()
  municipio: string;
  @Prop()
  codigoPostal: string;
  @Prop()
  direccion: string;
  @Prop()
  telefono: string;
  @Prop()
  correoElectronico: string;
  @Prop()
  sitioWeb: string;

  // **Información de suscripción y límites**
  @Prop({ default: 'INDIVIDUAL' })
  referenciaPlan: string; // Plan base: INDIVIDUAL, PROFESIONAL, EMPRESARIAL

  @Prop({ default: 1 })
  maxUsuariosPermitidos: number; // Inicialmente 1 para el Plan Individual

  @Prop({ default: 10 })
  maxEmpresasPermitidas: number; // Inicialmente 10 para el Plan Individual

  @Prop({ default: 'pending' }) 
  estadoSuscripcion: string; // 'pending', 'authorized'

  @Prop({ default: new Date() }) 
  fechaInicioTrial: Date; // Fecha de inicio de los 15 días de prueba

  @Prop({ default: false }) 
  periodoDePruebaFinalizado: boolean; // Indica si han pasado los 15 días de prueba

  // **Add-ons dinámicos**
  @Prop({
    type: [
      {
        tipo: { type: String }, // 'usuario_adicional', 'empresas_extra'
        cantidad: { type: Number, default: 0 }, // Cantidad de add-ons adquiridos
      },
    ],
    default: [],
  })
  addOns: { tipo: string; cantidad: number }[];

  // **Vinculación con MercadoPago**
  @Prop()
  mercadoPagoSubscriptionId: string; // ID de la suscripción en MercadoPago

  @Prop()
  payerEmail: string; // Opcional: email del usuario principal vinculado a la suscripción
}

export const ProveedorSaludSchema = SchemaFactory.createForClass(ProveedorSalud);