import { Document } from "mongoose";
import { User } from "src/modules/users/entities/user.entity";

export class Empresa extends Document {
    _id: string;
    nombreComercial: string;
    razonSocial: string;
    RFC: string;
    giroDeEmpresa: string;
    baseOperaciones: string;
    logotipo:{
        data: string;
        contentType: string
    }
    createdBy: User | string;
    updatedBy: User | string;
}
