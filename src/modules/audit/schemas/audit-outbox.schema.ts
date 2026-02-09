/**
 * Phase 4 AuditTrail — D8 Clase 2 soft-fail.
 * Events that failed to write to AuditEvent are stored here for retry/alert.
 * Drain worker not in scope for v1; minimal: write and list for alerts.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'auditoutbox', timestamps: true })
export class AuditOutbox extends Document {
  @Prop({ type: Types.ObjectId, default: null })
  proveedorSaludId: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  actorId: string | null;

  @Prop({ type: { username: String, email: String, role: String }, required: false, default: null })
  actorSnapshot: { username?: string; email?: string; role?: string } | null;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  actionType: string;

  @Prop({ type: Object, default: null })
  payload: Record<string, unknown> | null;

  @Prop({ required: true })
  eventClass: string;

  @Prop({ default: null })
  processedAt: Date | null;

  @Prop({ default: null })
  errorMessage: string | null;
}

export const AuditOutboxSchema = SchemaFactory.createForClass(AuditOutbox);
AuditOutboxSchema.index({ processedAt: 1, createdAt: 1 });
