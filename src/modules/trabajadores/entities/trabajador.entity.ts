import { Document } from 'mongoose';
import { CentroTrabajo } from 'src/modules/centros-trabajo/entities/centros-trabajo.entity';
import { User } from 'src/modules/users/entities/user.entity';

export class Trabajador extends Document {
    _id: string;
    nombre: string;
    fechaNacimiento: Date;
    sexo: string;
    escolaridad: string;
    puesto: string;
    fechaIngreso: Date;
    telefono: string;
    estadoCivil: string;
    hijos: number;
    estadoLaboral: string;
    centroTrabajo: CentroTrabajo | string;
    createdBy: User | string;
    updatedBy: User | string;
}
