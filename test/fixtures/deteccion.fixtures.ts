/**
 * Deteccion (GIIS-B019) Test Fixtures
 *
 * Sample data for testing Deteccion entity with NOM-024 compliance (Task 15).
 */

import { Types } from 'mongoose';
import { DocumentoEstado } from '../../src/modules/expedientes/enums/documento-estado.enum';

/**
 * Valid Deteccion record for adult (age 35)
 */
export const validDeteccionAdult = {
  _id: new Types.ObjectId(),
  fechaDeteccion: new Date('2024-06-15'),
  idTrabajador: new Types.ObjectId(),
  clues: 'DFSSA001234',
  curpPrestador: 'ROPC850102HDFDRL08',
  // Service identifiers
  tipoPersonal: 1, // Catalog code (best-effort)
  servicioAtencion: 5, // Catalog code (best-effort)
  primeraVezAnio: true,
  // Vitals
  peso: 75,
  talla: 175,
  cintura: 90,
  tensionArterialSistolica: 120,
  tensionArterialDiastolica: 80,
  glucemia: 95,
  tipoMedicionGlucemia: 1, // Ayuno
  // Chronic diseases (age >= 20)
  riesgoDiabetes: 0,
  riesgoHipertension: 0,
  obesidad: 0,
  dislipidemia: 0,
  // Addictions
  consumoAlcohol: 0,
  consumoTabaco: 0,
  consumoDrogas: 0,
  // Document state
  estado: DocumentoEstado.BORRADOR,
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
};

/**
 * Valid Deteccion for geriatric patient (age 65)
 */
export const validDeteccionGeriatric = {
  _id: new Types.ObjectId(),
  fechaDeteccion: new Date('2024-06-15'),
  idTrabajador: new Types.ObjectId(),
  clues: 'DFSSA001234',
  curpPrestador: 'ROPC850102HDFDRL08',
  tipoPersonal: 1,
  servicioAtencion: 5,
  // Vitals
  peso: 68,
  talla: 165,
  tensionArterialSistolica: 135,
  tensionArterialDiastolica: 85,
  // Geriatrics block (age >= 60)
  deterioroMemoria: 1,
  riesgoCaidas: 1,
  alteracionMarcha: 0,
  dependenciaABVD: 0,
  necesitaCuidador: 0,
  // Chronic diseases
  riesgoDiabetes: 1,
  riesgoHipertension: 1,
  estado: DocumentoEstado.BORRADOR,
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
};

/**
 * Valid Deteccion for female with cancer screening (age 45)
 */
export const validDeteccionFemaleCancer = {
  _id: new Types.ObjectId(),
  fechaDeteccion: new Date('2024-06-15'),
  idTrabajador: new Types.ObjectId(),
  clues: 'DFSSA001234',
  curpPrestador: 'GOLM900515MDFNZR02',
  tipoPersonal: 2,
  servicioAtencion: 10,
  // Vitals
  peso: 65,
  talla: 160,
  // Cancer screening (female 25-64)
  cancerCervicouterino: 0,
  vph: 0,
  cancerMama: 0,
  // Violence detection (female >= 15)
  violenciaMujer: 0,
  estado: DocumentoEstado.BORRADOR,
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
};

/**
 * Deteccion with invalid vitals (out of range)
 */
export const deteccionInvalidVitals = {
  ...validDeteccionAdult,
  _id: new Types.ObjectId(),
  peso: 500, // Out of range (max 400)
  tensionArterialSistolica: 50, // Out of range (min 60)
  tensionArterialDiastolica: 200, // Out of range (max 150)
};

/**
 * Deteccion with age-based validation error (geriatric fields for young patient)
 */
export const deteccionAgeValidationError = {
  ...validDeteccionAdult,
  _id: new Types.ObjectId(),
  // These fields require age >= 60
  deterioroMemoria: 1,
  riesgoCaidas: 1,
};

/**
 * Finalized Deteccion (immutable)
 */
export const finalizedDeteccion = {
  ...validDeteccionAdult,
  _id: new Types.ObjectId(),
  estado: DocumentoEstado.FINALIZADO,
  fechaFinalizacion: new Date('2024-06-16'),
  finalizadoPor: new Types.ObjectId(),
};

/**
 * Deteccion with blood pressure inconsistency
 */
export const deteccionBPInconsistent = {
  ...validDeteccionAdult,
  _id: new Types.ObjectId(),
  tensionArterialSistolica: 80, // Lower than diastolic
  tensionArterialDiastolica: 100, // Higher than systolic
};
