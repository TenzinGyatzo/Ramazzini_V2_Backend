import { Document } from "mongoose";
import { User } from "src/modules/users/entities/user.entity";

export class MedicoFirmante extends Document {
    _id: string;
    nombre: string;
    tituloProfesional?: string;
    numeroCedulaProfesional?: string;
    especialistaSaludTrabajo?: string;
    numeroCedulaEspecialista?: string;
    nombreCredencialAdicional?: string;
    numeroCredencialAdicional?: string;
    firma?: {
        data: string;
        contentType: string
    };
    firmaConAntefirma?: {
        data: string;
        contentType: string
    };
    idUser: User | string;
}
