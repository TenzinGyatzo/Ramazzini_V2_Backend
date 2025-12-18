import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Pago extends Document {
  @Prop({ required: true })
  payment_id: string;

  @Prop({ required: true })
  preapproval_id: string;

  @Prop({ required: true })
  proveedorSaludId: string;

  @Prop()
  type: string; // 'recurring' | ''

  @Prop()
  status: string; // 'processed' | 'recycling' | ''

  @Prop()
  date_created: Date;

  @Prop()
  last_modified: Date;

  @Prop()
  transaction_amount: number;

  @Prop()
  currency_id: string;

  @Prop()
  reason: string;

  @Prop()
  external_reference: string;

  @Prop({
    type: {
      id: String,
      status: String,
      status_detail: String,
    },
  })
  payment: {
    id: string;
    status: string; // 'approved' | '' | ''
    status_detail: string;
  };

  @Prop()
  retry_attempt: number;

  @Prop()
  next_retry_date: Date;

  @Prop()
  payment_method_id: string;
}

export const PagoSchema = SchemaFactory.createForClass(Pago);
