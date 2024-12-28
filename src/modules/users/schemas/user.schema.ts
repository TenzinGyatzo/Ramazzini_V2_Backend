import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
    @Prop({ required: true, trim: true, lowercase: true })
    username: string;

    @Prop({ required: true, trim: true})
    password: string;

    @Prop({ required: true, enum: ['administrador', 'medico', 'medico especialista', 'enfermero(a)', 'observer'] })
    role: string;

    @Prop({ required: true, default: Date.now().toString(32) + Math.random().toString(32).substring(2) })
    token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);