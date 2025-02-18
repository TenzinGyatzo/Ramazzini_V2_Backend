import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Suscripcion extends Document {
    @Prop({ required: true })
    subscription_id: string;

    @Prop({ required: true })
    idProveedorSalud: string;

    @Prop()
    payer_id: string;

    @Prop()
    payer_email: string;

    @Prop()
    back_url: string;

    @Prop()
    status: string; // 'pending' | 'approved' | 'cancelled'

    @Prop()
    reason: string;

    @Prop()
    date_created: Date;

    @Prop()
    last_modified: Date;

    @Prop()
    init_point: string;

    @Prop({
        type: {
          frequency: String,
          frequency_type: String,
          transaction_amount: Number,
          currency_id: String,
          free_trial: { type: String, default: null }
        }
      })
      auto_recurring: {
        frequency: string;
        frequency_type: string;
        transaction_amount: number;
        currency_id: string;
        free_trial: string | null;
      };
      

    @Prop()
    next_payment_date: Date;

    @Prop()
    payment_method_id: string;
}

export const SuscripcionSchema = SchemaFactory.createForClass(Suscripcion);