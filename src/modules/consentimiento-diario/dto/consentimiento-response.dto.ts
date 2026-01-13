export class ConsentimientoStatusResponseDto {
  hasConsent: boolean;
  dateKey: string;
  consent?: {
    acceptedAt: Date;
    acceptedByUserId: string;
    consentMethod: string;
    consentTextVersion: string;
  };
}

export class ConsentimientoCreatedResponseDto {
  _id: string;
  proveedorSaludId: string;
  trabajadorId: string;
  dateKey: string;
  acceptedAt: Date;
  acceptedByUserId: string;
  consentMethod: string;
  consentTextVersion: string;
  createdAt: Date;
}
