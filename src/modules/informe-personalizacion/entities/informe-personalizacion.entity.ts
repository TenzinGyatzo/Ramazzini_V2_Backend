import { Document } from "mongoose";
import { User } from "src/modules/users/entities/user.entity";
import { Empresa } from "src/modules/empresas/entities/empresa.entity";
import { CentroTrabajo } from "src/modules/centros-trabajo/entities/centros-trabajo.entity";

export interface RecomendacionItem {
  hallazgo: string;
  medidaPreventiva: string;
}

export class InformePersonalizacion extends Document {
  _id: string;
  idEmpresa: Empresa | string;
  idCentroTrabajo?: CentroTrabajo | string;
  conclusiones?: string;
  formatoRecomendaciones: 'texto' | 'tabla';
  recomendacionesTexto?: string;
  recomendacionesTabla?: RecomendacionItem[];
  createdBy: User | string;
  updatedBy: User | string;
}
