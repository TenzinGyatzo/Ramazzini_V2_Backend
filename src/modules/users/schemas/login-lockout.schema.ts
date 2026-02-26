import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LoginLockoutDocument = LoginLockout & Document;

@Schema({ collection: 'login_lockouts' })
export class LoginLockout {
  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  email: string;

  @Prop({ default: 0 })
  failedAttempts: number;

  @Prop({ required: false })
  lockedUntil?: Date;
}

export const LoginLockoutSchema = SchemaFactory.createForClass(LoginLockout);

// TTL: MongoDB elimina el documento cuando lockedUntil ha pasado (para limpieza)
LoginLockoutSchema.index(
  { lockedUntil: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { lockedUntil: { $exists: true, $ne: null } },
  },
);
