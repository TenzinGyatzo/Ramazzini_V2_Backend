import { Document } from 'mongoose';

export interface AddOn {
  tipo: string; // 'usuario_adicional', 'empresas_extra', u otros
  cantidad: number;
}

export class ProveedoresSalud extends Document {
  _id: string;
  nombre: string;
  pais?: string;
  perfilProveedorSalud: string;
  clues?: string;  
  logotipoEmpresa?: {
    data: string;
    contentType: string;
  };
  estado?: string;
  municipio?: string;
  codigoPostal?: string;
  direccion?: string;
  telefono?: string;
  correoElectronico?: string;
  sitioWeb?: string;
  referenciaPlan?: string;
  maxUsuariosPermitidos?: number;
  maxEmpresasPermitidas?: number;
  maxTrabajadoresPermitidos?: number;
  estadoSuscripcion?: string;
  fechaInicioTrial?: Date;
  periodoDePruebaFinalizado?: boolean;
  addOns?: AddOn[];
  mercadoPagoSubscriptionId?: string;
  payerEmail?: string;
  colorInforme?: string;
  semaforizacionActivada?: boolean;
}
