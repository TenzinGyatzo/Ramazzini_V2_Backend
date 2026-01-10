/**
 * Regulatory Error Codes
 * 
 * Códigos estándar para errores relacionados con políticas regulatorias.
 * Estos códigos permiten al frontend mapear errores a mensajes UX apropiados según el régimen.
 * 
 * @see docs/regulatory-policy.md para más información sobre el sistema regulatorio
 */

export enum RegulatoryErrorCode {
  /**
   * Feature deshabilitada por régimen regulatorio
   * Ejemplos: GIIS export, nota aclaratoria
   */
  REGIMEN_FEATURE_DISABLED = 'REGIMEN_FEATURE_DISABLED',

  /**
   * Documento inmutable según política regulatoria
   * Ocurre cuando se intenta editar/eliminar un documento finalizado o anulado en régimen SIRES
   */
  REGIMEN_DOCUMENT_IMMUTABLE = 'REGIMEN_DOCUMENT_IMMUTABLE',

  /**
   * Campo requerido por régimen regulatorio
   * Ejemplos: CURP, campos geográficos, CIE-10 principal
   */
  REGIMEN_FIELD_REQUIRED = 'REGIMEN_FIELD_REQUIRED',
}

/**
 * Tipo para detalles opcionales de errores regulatorios
 */
export interface RegulatoryErrorDetails {
  /**
   * Nombre de la feature que está deshabilitada
   * Ejemplos: 'giisExport', 'notaAclaratoria'
   */
  feature?: string;

  /**
   * Estado del documento cuando es inmutable
   * Ejemplos: 'FINALIZADO', 'ANULADO'
   */
  documentState?: string;

  /**
   * Nombre del campo que es requerido
   * Ejemplos: 'curp', 'cie10Principal', 'entidadNacimiento'
   */
  fieldName?: string;

  /**
   * Tipo de documento afectado (opcional)
   * Ejemplos: 'notaMedica', 'historiaClinica', 'lesion'
   */
  documentType?: string;
}
