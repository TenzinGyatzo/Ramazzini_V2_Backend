/**
 * Professional (Firmantes) Test Fixtures
 *
 * Sample data for testing MedicoFirmante, EnfermeraFirmante, TecnicoFirmante
 * with NOM-024 CURP compliance (Task 9).
 */

import { Types } from 'mongoose';

/**
 * Valid Medico Firmante with CURP (MX)
 */
export const validMedicoMX = {
  _id: new Types.ObjectId(),
  nombre: 'DR. CARLOS RODRIGUEZ PEREZ',
  especialidad: 'Medicina General',
  cedula: '12345678',
  curp: 'ROPC850102HDFDRL08', // Task 9: Professional CURP
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Medico Firmante without CURP (non-MX)
 */
export const validMedicoNonMX = {
  _id: new Types.ObjectId(),
  nombre: 'Dr. John Smith',
  especialidad: 'General Medicine',
  cedula: 'US-12345',
  // No CURP for non-MX
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Medico with invalid CURP format
 */
export const medicoInvalidCURP = {
  _id: new Types.ObjectId(),
  nombre: 'DR. PEDRO INVALID',
  especialidad: 'Medicina General',
  cedula: '87654321',
  curp: 'INVALID_CURP',
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Valid Enfermera Firmante with CURP (MX)
 */
export const validEnfermeraMX = {
  _id: new Types.ObjectId(),
  nombre: 'ENF. MARIA GONZALEZ LOPEZ',
  cedula: 'ENF-12345',
  curp: 'GOLM900515MDFNZR02',
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Enfermera Firmante without CURP (non-MX)
 */
export const validEnfermeraNonMX = {
  _id: new Types.ObjectId(),
  nombre: 'Nurse Jane Doe',
  cedula: 'RN-54321',
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Valid Tecnico Firmante with CURP (MX)
 */
export const validTecnicoMX = {
  _id: new Types.ObjectId(),
  nombre: 'TEC. ROBERTO SANCHEZ MARTINEZ',
  especialidad: 'Radiología',
  cedula: 'TEC-67890',
  curp: 'SAMR880720HDFNRB05',
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Tecnico Firmante without CURP (non-MX)
 */
export const validTecnicoNonMX = {
  _id: new Types.ObjectId(),
  nombre: 'Tech. Bob Wilson',
  especialidad: 'Radiology',
  cedula: 'TECH-11111',
  proveedorSaludId: new Types.ObjectId().toString(),
};

/**
 * Create professional fixture with custom CURP
 */
export function createProfessionalWithCURP(
  type: 'medico' | 'enfermera' | 'tecnico',
  curp: string | undefined,
) {
  const base = {
    _id: new Types.ObjectId(),
    nombre: 'TEST PROFESSIONAL',
    cedula: 'TEST-12345',
    curp,
    proveedorSaludId: new Types.ObjectId().toString(),
  };

  if (type === 'medico') {
    return { ...base, especialidad: 'Medicina General' };
  } else if (type === 'tecnico') {
    return { ...base, especialidad: 'Radiología' };
  }

  return base;
}
