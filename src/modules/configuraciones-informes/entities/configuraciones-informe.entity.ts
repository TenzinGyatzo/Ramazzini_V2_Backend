import { Document } from "mongoose";
import { User } from "src/modules/users/entities/user.entity";

export class ConfiguracionInforme extends Document {
    _id: string;
    sexoMedicoFirmante: string;
    nombreMedicoFirmante: string;
    numeroCedulaProfesional: string;
    especialistaSaludTrabajo: boolean;
    numeroCedulaEspecialista: string;
    nombreCredencialAdicional: string;
    numeroCredencialAdicional: string;
    firma: {
        data: string;
        contentType: string
    };
    idUser: User | string;
}
