import { Document } from 'mongoose';
import { Empresa } from 'src/modules/empresas/entities/empresa.entity';
import { User } from 'src/modules/users/entities/user.entity';

export class CentroTrabajo extends Document {
  _id: string;
  nombreCentro: string;
  direccionCentro: string;
  codigoPostal: string;
  estado: string;
  municipio: string;
  idEmpresa: Empresa | string;
  createdBy: User | string;
  updatedBy: User | string;
}
