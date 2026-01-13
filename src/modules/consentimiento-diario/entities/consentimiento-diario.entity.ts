import { Document } from 'mongoose';

export class ConsentimientoDiario extends Document {
  _id: string;
  proveedorSaludId: string;
  trabajadorId: string;
  acceptedByUserId: string;
  dateKey: string;
  acceptedAt: Date;
  consentMethod: 'VERBAL' | 'AUTOGRAFO';
  source: 'UI';
  consentTextLiteral: string;
  consentTextVersion: string;
  createdAt: Date;
  updatedAt: Date;
}
