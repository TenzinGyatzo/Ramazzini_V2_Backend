import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define el tipo del documento que extiende los métodos personalizados
export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, trim: true, lowercase: true })
  username: string;

  @Prop({ required: true, trim: true })
  password: string;

  @Prop({ required: true, enum: ['administrador', 'medico', 'medico especialista', 'enfermero(a)', 'observer'] })
  role: string;

  @Prop({ required: true, default: () => Date.now().toString(32) + Math.random().toString(32).substring(2) })
  token: string;

  async checkPassword(inputPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware pre-save para hashear el password
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.checkPassword = async function (inputPassword: string): Promise<boolean> {
    return bcrypt.compare(inputPassword, this.password);
  };
  
