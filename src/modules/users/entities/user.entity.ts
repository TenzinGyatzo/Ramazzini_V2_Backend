import { Document } from "mongoose";

export class User extends Document {
    username: string;
    email: string;
    phone: string;
    country: string;
    password: string;
    role: string;
    token: string;
    idProveedorSalud: string;
    checkPassword: (inputPassword: string) => Promise<boolean>;
}
