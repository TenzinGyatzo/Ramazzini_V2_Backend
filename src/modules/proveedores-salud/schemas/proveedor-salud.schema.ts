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
  @Prop({ default: '#343A40' })
  colorInforme: string;
  @Prop({ default: false })
  semaforizacionActivada: boolean;
  @Prop()
  termsAccepted: boolean;
  @Prop()
  acceptedAt: string;
  @Prop()
  termsVersion: string;

  // **Información de periodo de prueba y límites**
  @Prop({ default: new Date() }) 
  fechaInicioTrial: Date; // Fecha de inicio de los 15 días de prueba

  @Prop({ default: false }) 
  periodoDePruebaFinalizado: boolean; // Indica si han pasado los 15 días de prueba

  @Prop({ default: 25 })
  maxHistoriasPermitidasAlMes: number; // Inicialmente 15 para periodo de prueba

  // @Prop({ default: 1 })
  // maxUsuariosPermitidos: number; // Inicialmente 1 para periodo de prueba

  // @Prop({ default: 5 })
  // maxEmpresasPermitidas: number; // Inicialmente 5 para periodo de prueba

  // @Prop({ default: 25})
  // maxTrabajadoresPermitidos: number; // Inicialmente 50 para periodo de prueba

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

  @Prop()
  suscripcionActiva: string; // id de la suscripcion con estado 'authorized'

  @Prop() 
  estadoSuscripcion: string; // 'inactive', 'authorized', 'cancelled'

  @Prop()
  finDeSuscripcion: Date; // Fecha hasta la cual el usuario mantiene acceso tras cancelar
}

export const ProveedorSaludSchema = SchemaFactory.createForClass(ProveedorSalud);
