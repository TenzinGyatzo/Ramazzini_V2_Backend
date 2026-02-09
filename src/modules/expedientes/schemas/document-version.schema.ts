/**
 * Phase 4 AuditTrail — D2: full-document versioning for resguardado.
 * One snapshot per version; reconstruction = read one document.
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ collection: 'documentversions', timestamps: false })
export class DocumentVersion extends Document {
  @Prop({ required: true })
  documentType: string;

  @Prop({ type: Types.ObjectId, required: true })
  documentId: Types.ObjectId;

  @Prop({ required: true })
  version: number;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  snapshot: Record<string, unknown>; // full document snapshot

  @Prop({ type: Types.ObjectId, required: true })
  proveedorSaludId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DocumentVersionSchema =
  SchemaFactory.createForClass(DocumentVersion);
DocumentVersionSchema.index(
  { proveedorSaludId: 1, documentType: 1, documentId: 1, version: 1 },
  { unique: true },
);
