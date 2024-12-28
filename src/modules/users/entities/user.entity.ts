import { Document } from "mongoose";

export class User extends Document {
    username: string;
    password: string;
    role: string;
    token: string;
    checkPassword: (inputPassword: string) => Promise<boolean>;
}
