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

  // **Información de periodo de prueba y límites**
  @Prop({ default: new Date() }) 
  fechaInicioTrial: Date; // Fecha de inicio de los 15 días de prueba

  @Prop({ default: false }) 
  periodoDePruebaFinalizado: boolean; // Indica si han pasado los 15 días de prueba

  @Prop({ default: 1 })
  maxUsuariosPermitidos: number; // Inicialmente 1 para el Plan Individual

  @Prop({ default: 10 })
  maxEmpresasPermitidas: number; // Inicialmente 10 para el Plan Individual

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


  // **Información de la suscripcion**
  @Prop()
  mercadoPagoSubscriptionId: string; // ID de la suscripción en MercadoPago

  @Prop() 
  subscriptionStatus: string; // 'pending', 'authorized', 'cancelled'

  @Prop()
  reason: string; // Plan base: Ramazzini: Plan Básico, Ramazzini: Plan Profesional, Ramazzini: Plan Empresarial

  @Prop()
  payerEmail: string; // Opcional: email del usuario principal vinculado a la suscripción

  @Prop()
  transactionAmount: number; // Opcional: monto de la transacción

  
  // **Información del pago**
  @Prop()
  mercadoPagoPaymentId: string; // ID del pago en MercadoPago

  @Prop()
  paymentStatus: string; // 'processed', 'recycling' ¿Debería manejar mejor los estados de payment? (approved, rejected)

  @Prop()
  retryAttempt: number; // Número de intentos de pago

  @Prop()
  nextRetryDate: Date; // Fecha del próximo intento de pago

  @Prop()
  paymentMethodId: string; // ID del método de pago
}

export const ProveedorSaludSchema = SchemaFactory.createForClass(ProveedorSalud);