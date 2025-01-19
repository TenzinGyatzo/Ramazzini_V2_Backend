import { Document } from "mongoose";

export class ProveedoresSalud extends Document {
    _id: string;
    nombreComercial: string;
    razonSocial?: string;
    RFC?: string;
    logotipoEmpresa?: {
        data: string;
        contentType: string
    }
    direccion?: string;
    ciudad?: string;
    municipio?: string;
    estado?: string;
    codigoPostal?: string;
    telefono?: string;
    correoElectronico?: string;
    sitioWeb?: string;
}
