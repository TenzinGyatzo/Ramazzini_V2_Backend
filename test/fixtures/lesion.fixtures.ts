/**
 * Lesion (GIIS-B013) Test Fixtures
 *
 * Sample data for testing Lesion entity with NOM-024 compliance (Task 13).
 */

import { Types } from 'mongoose';
import { DocumentoEstado } from '../../src/modules/expedientes/enums/documento-estado.enum';

/**
 * Valid Lesion record (MX, accidental)
 */
export const validLesionAccidental = {
  _id: new Types.ObjectId(),
  // Establishment
  clues: 'DFSSA001234',
  folio: '00000001',
  // Patient
  curpPaciente: 'PEGJ850102HDFRNN08',
  fechaNacimiento: new Date('1985-01-02'),
  sexo: 1, // Hombre
  // Event
  fechaEvento: new Date('2024-03-01'),
  horaEvento: '14:30',
  sitioOcurrencia: 1, // Catalog code (best-effort)
  intencionalidad: 1, // Accidental
  agenteLesion: 5, // Required for accidental
  // Care
  fechaAtencion: new Date('2024-03-01'),
  horaAtencion: '15:00',
  tipoAtencion: [1, 2], // Treatment types
  areaAnatomica: 3, // Catalog code (best-effort)
  consecuenciaGravedad: 2, // Catalog code (best-effort)
  // CIE-10
  codigoCIEAfeccionPrincipal: 'S01.0', // Scalp wound
  codigoCIECausaExterna: 'W01', // Fall
  // Responsible
  responsableAtencion: 1, // Médico
  curpResponsable: 'ROPC850102HDFDRL08',
  // References
  idTrabajador: new Types.ObjectId(),
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
  // Document state
  estado: DocumentoEstado.BORRADOR,
};

/**
 * Valid Lesion record (MX, family violence)
 */
export const validLesionViolenciaFamiliar = {
  _id: new Types.ObjectId(),
  clues: 'DFSSA001234',
  folio: '00000002',
  curpPaciente: 'GOLM900515MDFNZR02',
  fechaNacimiento: new Date('1990-05-15'),
  sexo: 2, // Mujer
  fechaEvento: new Date('2024-03-10'),
  horaEvento: '20:00',
  sitioOcurrencia: 2,
  intencionalidad: 2, // Violencia Familiar
  tipoViolencia: [6, 7], // Required for violence
  fechaAtencion: new Date('2024-03-10'),
  horaAtencion: '21:30',
  tipoAtencion: [1, 3, 5],
  areaAnatomica: 5,
  consecuenciaGravedad: 3,
  codigoCIEAfeccionPrincipal: 'T74.1', // Physical abuse
  codigoCIECausaExterna: 'Y04', // Assault by bodily force
  responsableAtencion: 3, // Trabajador Social
  curpResponsable: 'SAMR880720HDFNRB05',
  idTrabajador: new Types.ObjectId(),
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
  estado: DocumentoEstado.BORRADOR,
};

/**
 * Finalized Lesion (immutable)
 */
export const finalizedLesion = {
  ...validLesionAccidental,
  _id: new Types.ObjectId(),
  folio: '00000003',
  estado: DocumentoEstado.FINALIZADO,
  fechaFinalizacion: new Date('2024-03-02'),
  finalizadoPor: new Types.ObjectId(),
};

/**
 * Lesion with invalid CIE-10 codes
 */
export const lesionInvalidCIE10 = {
  ...validLesionAccidental,
  _id: new Types.ObjectId(),
  folio: '00000004',
  codigoCIEAfeccionPrincipal: 'INVALID',
  codigoCIECausaExterna: 'NOTCIE',
};

/**
 * Lesion with temporal inconsistency (attention before event)
 */
export const lesionTemporalError = {
  ...validLesionAccidental,
  _id: new Types.ObjectId(),
  folio: '00000005',
  fechaEvento: new Date('2024-03-15'),
  fechaAtencion: new Date('2024-03-10'), // Before event
};

/**
 * Lesion missing conditional field (violence without tipoViolencia)
 */
export const lesionMissingConditional = {
  ...validLesionAccidental,
  _id: new Types.ObjectId(),
  folio: '00000006',
  intencionalidad: 2, // Violencia Familiar
  agenteLesion: undefined,
  tipoViolencia: undefined, // Missing required field
};
