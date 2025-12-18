/**
 * ProveedorSalud Test Fixtures
 *
 * Sample data for testing healthcare provider entities with NOM-024 compliance.
 */

import { Types } from 'mongoose';

/**
 * Valid MX Provider with CLUES (Task 5)
 */
export const validMXProvider = {
  _id: new Types.ObjectId(),
  razonSocial: 'CLINICA MEDICA SAN ANGEL',
  rfc: 'CMS850101XXX',
  pais: 'MX',
  // NOM-024 field (Task 5)
  clues: 'DFSSA001234',
  estado: 'Ciudad de México',
  municipio: 'Álvaro Obregón',
  direccion: 'Av. Insurgentes Sur 1234',
  codigoPostal: '01000',
  telefono: '5555551234',
  email: 'contacto@clinicasanangel.com.mx',
  activo: true,
};

/**
 * Valid non-MX Provider (US)
 */
export const validUSProvider = {
  _id: new Types.ObjectId(),
  razonSocial: 'US Health Clinic',
  rfc: '',
  pais: 'US',
  estado: 'California',
  municipio: 'Los Angeles',
  direccion: '1234 Main Street',
  codigoPostal: '90001',
  telefono: '+1-555-123-4567',
  email: 'contact@ushealthclinic.com',
  activo: true,
};

/**
 * MX Provider without CLUES (should trigger warning/error)
 */
export const mxProviderNoCLUES = {
  _id: new Types.ObjectId(),
  razonSocial: 'CLINICA SIN CLUES',
  rfc: 'CSC850101XXX',
  pais: 'MX',
  clues: '', // Missing CLUES
  estado: 'Ciudad de México',
  activo: true,
};

/**
 * MX Provider with invalid CLUES format
 */
export const mxProviderInvalidCLUES = {
  _id: new Types.ObjectId(),
  razonSocial: 'CLINICA CLUES INVALIDO',
  rfc: 'CCI850101XXX',
  pais: 'MX',
  clues: 'INVALID', // Invalid format (should be 11 chars)
  estado: 'Ciudad de México',
  activo: true,
};

/**
 * Get provider by country
 */
export function getProviderByCountry(country: string) {
  return country === 'MX' ? validMXProvider : validUSProvider;
}
