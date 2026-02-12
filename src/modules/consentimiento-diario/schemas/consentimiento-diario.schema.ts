import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Trabajador } from '../../trabajadores/schemas/trabajador.schema';
import { User } from 'src/modules/users/entities/user.entity';
import { ProveedoresSalud } from '../../proveedores-salud/entities/proveedores-salud.entity';

const consentMethods = ['VERBAL', 'AUTOGRAFO'];
const sources = ['UI'];

@Schema()
export class ConsentimientoDiario extends Document {
  // Referencias (requeridas)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'ProveedoresSalud',
    required: true,
    index: true,
  })
  proveedorSaludId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Trabajador',
    required: true,
    index: true,
  })
  trabajadorId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  acceptedByUserId: Types.ObjectId;

  // Clave única diaria (calculada por backend, formato YYYY-MM-DD)
  @Prop({ required: true, index: true })
  dateKey: string; // Ejemplo: "2024-03-15"

  // Metadatos del consentimiento
  @Prop({ required: true })
  acceptedAt: Date; // Timestamp del servidor (server-side)

  @Prop({ required: true, enum: consentMethods })
  consentMethod: string;

  @Prop({ required: true, enum: sources })
  source: string; // Por ahora solo UI, extensible en el futuro

  // Texto del consentimiento
  @Prop({ required: true })
  consentTextLiteral: string; // Texto exacto mostrado al usuario

  @Prop({ required: true })
  consentTextVersion: string; // Versión del texto (ej: "1.0.0")
}

export const ConsentimientoDiarioSchema = SchemaFactory.createForClass(
  ConsentimientoDiario,
).set('timestamps', true);

// Índice único compuesto para garantizar unicidad diaria
ConsentimientoDiarioSchema.index(
  { proveedorSaludId: 1, trabajadorId: 1, dateKey: 1 },
  { unique: true },
);

// Índice para búsqueda por proveedor y fecha
ConsentimientoDiarioSchema.index({ proveedorSaludId: 1, dateKey: 1 });

// Índice para búsqueda por trabajador (descendente para obtener más reciente primero)
ConsentimientoDiarioSchema.index({ trabajadorId: 1, dateKey: -1 });
