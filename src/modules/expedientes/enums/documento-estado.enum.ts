/**
 * Document State Enum
 * 
 * Represents the lifecycle state of medical documents per NOM-024 requirements.
 * Documents start as BORRADOR (draft) and can be finalized or cancelled.
 */
export enum DocumentoEstado {
  BORRADOR = 'borrador',
  FINALIZADO = 'finalizado',
  ANULADO = 'anulado',
}

