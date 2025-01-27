import { Document } from 'mongoose';

export class ProveedoresSalud extends Document {
  _id: string;
  nombre: string;
  RFC?: string;
  perfilProveedorSalud: string;  
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
}
