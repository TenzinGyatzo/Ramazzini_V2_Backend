/**
 * NotaMedica (Consulta externa / GIIS-B015 CEX) Test Fixtures
 */

import { Types } from 'mongoose';
import { DocumentoEstado } from '../../src/modules/expedientes/enums/documento-estado.enum';

/**
 * Valid NotaMedica for CEX export (consulta externa)
 */
export const validNotaMedicaCex = {
  _id: new Types.ObjectId(),
  tipoNota: 'Inicial',
  fechaNotaMedica: new Date('2025-01-15'),
  motivoConsulta: 'Control',
  tensionArterialSistolica: 120,
  tensionArterialDiastolica: 80,
  frecuenciaCardiaca: 72,
  frecuenciaRespiratoria: 18,
  temperatura: 36.5,
  saturacionOxigeno: 98,
  codigoCIE10Principal: 'Z00 - EXAMEN GENERAL DE INVESTIGACION',
  codigosCIE10Complementarios: [],
  relacionTemporal: 0,
  primeraVezDiagnostico2: false,
  confirmacionDiagnostica: false,
  idTrabajador: new Types.ObjectId(),
  rutaPDF: '/path/to/pdf',
  estado: DocumentoEstado.BORRADOR,
  createdBy: new Types.ObjectId(),
  updatedBy: new Types.ObjectId(),
};
