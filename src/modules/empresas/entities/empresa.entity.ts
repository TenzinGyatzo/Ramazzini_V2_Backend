import { Document } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { ProveedoresSalud } from 'src/modules/proveedores-salud/entities/proveedores-salud.entity';

export class Empresa extends Document {
  _id: string;
  nombreComercial: string;
  razonSocial: string;
  RFC: string;
  giroDeEmpresa: string;
  logotipo: {
    data: string;
    contentType: string;
  };
  createdBy: User | string;
  updatedBy: User | string;
  idProveedorSalud: ProveedoresSalud | string;
}
