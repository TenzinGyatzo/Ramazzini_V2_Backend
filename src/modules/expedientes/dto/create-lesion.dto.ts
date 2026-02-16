import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  IsArray,
  ArrayMaxSize,
  ValidateIf,
} from 'class-validator';

/**
 * Create Lesion DTO
 * GIIS-B013 Lesion/Injury reporting
 * Only enabled for MX providers
 */
export class CreateLesionDto {
  // Folio - unicidad por ProveedorSalud + fechaAtencion (CLUES se obtiene del ProveedorSalud del trabajador)
  @IsString({ message: 'Folio debe ser un string' })
  @IsNotEmpty({ message: 'Folio es requerido' })
  @Matches(/^[0-9]{8}$/, {
    message: 'Folio debe tener exactamente 8 dígitos numéricos',
  })
  folio: string;

  // Identificación del Paciente
  @IsString({ message: 'CURP del paciente debe ser un string' })
  @IsNotEmpty({ message: 'CURP del paciente es requerido' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'CURP del paciente debe tener formato RENAPO válido',
  })
  curpPaciente: string;

  @IsDate({ message: 'Fecha de nacimiento debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'Fecha de nacimiento es requerida' })
  fechaNacimiento: Date;

  @IsNumber({}, { message: 'Sexo debe ser un número' })
  @IsEnum([1, 2, 3], {
    message: 'Sexo debe ser 1 (Hombre), 2 (Mujer) o 3 (Intersexual)',
  })
  @IsNotEmpty({ message: 'Sexo es requerido' })
  sexo: number;

  // Información del Evento
  @IsDate({ message: 'Fecha del evento debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'Fecha del evento es requerida' })
  fechaEvento: Date;

  @IsOptional()
  @IsString({ message: 'Hora del evento debe ser un string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Hora del evento debe estar en formato HH:mm',
  })
  horaEvento?: string;

  @IsOptional()
  @IsEnum([1, 2], { message: 'diaFestivo debe ser 1 (SI) o 2 (NO)' })
  diaFestivo?: number;

  @IsNumber({}, { message: 'Sitio de ocurrencia debe ser un número entero' })
  @IsNotEmpty({ message: 'Sitio de ocurrencia es requerido' })
  // Note: Official DGIS catalog not publicly available - validate only type and basic bounds
  sitioOcurrencia: number;

  @IsNumber({}, { message: 'Intencionalidad debe ser un número' })
  @IsEnum([1, 2, 3, 4], {
    message:
      'Intencionalidad debe ser 1 (Accidental), 2 (Violencia Familiar), 3 (Violencia No Familiar) o 4 (Autoinfligido)',
  })
  @IsNotEmpty({ message: 'Intencionalidad es requerida' })
  intencionalidad: number;

  // Condicional: Obligatorio si intencionalidad = 1, 4 o Violencia Física/Sexual
  @ValidateIf((o) => {
    // Si es accidental (1) o autoinfligido (4), es obligatorio
    if (o.intencionalidad === 1 || o.intencionalidad === 4) {
      return true;
    }
    // Si es violencia (2 o 3), solo obligatorio si hay tipoViolencia física/sexual
    if (o.intencionalidad === 2 || o.intencionalidad === 3) {
      // Asumimos que si tiene tipoViolencia, debe tener agenteLesion
      // La validación específica se hará en el servicio
      return o.tipoViolencia && o.tipoViolencia.length > 0;
    }
    return false;
  })
  @IsNumber({}, { message: 'Agente de lesión debe ser un número entero' })
  @IsNotEmpty({ message: 'Agente de lesión es requerido cuando aplica' })
  // Note: Official DGIS catalog not publicly available - validate only type and basic bounds
  agenteLesion?: number;

  // Condicional: Obligatorio si intencionalidad = 2 o 3 (Violencia)
  @ValidateIf((o) => o.intencionalidad === 2 || o.intencionalidad === 3)
  @IsArray({ message: 'Tipo de violencia debe ser un array' })
  @IsNumber(
    {},
    { each: true, message: 'Cada tipo de violencia debe ser un número' },
  )
  @IsNotEmpty({ message: 'Tipo de violencia es requerido para violencia' })
  tipoViolencia?: number[];

  // Lugar de ocurrencia (opcionales)
  @IsOptional()
  @IsString()
  entidadOcurrencia?: string;

  @IsOptional()
  @IsString()
  municipioOcurrencia?: string;

  @IsOptional()
  @IsString()
  localidadOcurrencia?: string;

  @IsOptional()
  @IsString()
  otraLocalidad?: string;

  @IsOptional()
  @IsString()
  codigoPostal?: string;

  @IsOptional()
  @IsNumber()
  tipoVialidad?: number;

  @IsOptional()
  @IsString()
  nombreVialidad?: string;

  @IsOptional()
  @IsString()
  numeroExterior?: string;

  @IsOptional()
  @IsNumber()
  tipoAsentamiento?: number;

  @IsOptional()
  @IsString()
  nombreAsentamiento?: string;

  // Atención prehospitalaria
  @IsOptional()
  @IsEnum([1, 2], {
    message: 'atencionPreHospitalaria debe ser 1 (SI) o 2 (NO)',
  })
  atencionPreHospitalaria?: number;

  @ValidateIf((o) => o.atencionPreHospitalaria === 1)
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'tiempoTrasladoUH debe estar en formato HH:mm',
  })
  tiempoTrasladoUH?: string;

  @IsOptional()
  @IsString()
  sospechaBajoEfectosDe?: string;

  // Características del evento
  @IsOptional()
  @IsEnum([1, 2], {
    message: 'eventoRepetido debe ser 1 (Única vez) o 2 (Repetido)',
  })
  eventoRepetido?: number;

  @IsOptional()
  @IsString()
  especifique?: string;

  @ValidateIf((o) => o.agenteLesion === 20)
  @IsOptional()
  @IsEnum([1, 2, 3, 4], {
    message:
      'lesionadoVehiculoMotor debe ser 1 (Conductor), 2 (Ocupante), 3 (Peatón) o 4 (SE IGNORA)',
  })
  lesionadoVehiculoMotor?: number;

  @ValidateIf(
    (o) => o.lesionadoVehiculoMotor === 1 || o.lesionadoVehiculoMotor === 2,
  )
  @IsOptional()
  @IsEnum([1, 2, 9], {
    message: 'usoEquipoSeguridad debe ser 1 (SI), 2 (NO) o 9 (SE IGNORA)',
  })
  usoEquipoSeguridad?: number;

  @ValidateIf((o) => o.usoEquipoSeguridad === 1)
  @IsOptional()
  @IsEnum([1, 2, 3, 4], {
    message:
      'equipoUtilizado debe ser 1 (Cinturón), 2 (Casco), 3 (Silla infantil) o 4 (Otro)',
  })
  equipoUtilizado?: number;

  @ValidateIf((o) => o.equipoUtilizado === 4)
  @IsOptional()
  @IsString()
  especifiqueEquipo?: string;

  @ValidateIf((o) => o.intencionalidad === 2 || o.intencionalidad === 3)
  @IsOptional()
  @IsEnum([1, 2, 3], {
    message:
      'numeroAgresores debe ser 1 (Único), 2 (Más de uno) o 3 (No especificado)',
  })
  numeroAgresores?: number;

  @ValidateIf(
    (o) =>
      (o.intencionalidad === 2 || o.intencionalidad === 3) &&
      o.numeroAgresores === 1,
  )
  @IsOptional()
  @IsNumber()
  parentescoAfectado?: number;

  @ValidateIf(
    (o) =>
      (o.intencionalidad === 2 || o.intencionalidad === 3) &&
      o.numeroAgresores === 1,
  )
  @IsOptional()
  @IsNumber()
  sexoAgresor?: number;

  @ValidateIf(
    (o) =>
      (o.intencionalidad === 2 || o.intencionalidad === 3) &&
      o.numeroAgresores === 1,
  )
  @IsOptional()
  @IsNumber()
  edadAgresor?: number;

  @ValidateIf((o) => o.intencionalidad === 2 || o.intencionalidad === 3)
  @IsOptional()
  @IsString()
  agresorBajoEfectos?: string;

  // Información de Atención
  @IsDate({ message: 'Fecha de atención debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'Fecha de atención es requerida' })
  fechaAtencion: Date;

  @IsOptional()
  @IsString({ message: 'Hora de atención debe ser un string' })
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Hora de atención debe estar en formato HH:mm',
  })
  horaAtencion?: string;

  @IsArray({ message: 'Tipo de atención debe ser un array' })
  @IsNumber(
    {},
    { each: true, message: 'Cada tipo de atención debe ser un número' },
  )
  @ArrayMaxSize(5, { message: 'Tipo de atención puede tener máximo 5 valores' })
  @IsNotEmpty({ message: 'Tipo de atención es requerido' })
  tipoAtencion: number[];

  @IsOptional()
  @IsEnum([1, 2, 3, 4, 5], {
    message:
      'servicioAtencion debe ser 1 (Consulta Externa), 2 (Hospitalización), 3 (Urgencias), 4 (Servicio Violencia) o 5 (Otro)',
  })
  servicioAtencion?: number;

  @ValidateIf((o) => o.servicioAtencion === 5)
  @IsOptional()
  @IsString()
  especifiqueServicio?: string;

  @IsNumber({}, { message: 'Área anatómica debe ser un número entero' })
  @IsNotEmpty({ message: 'Área anatómica es requerida' })
  // Note: Official DGIS catalog not publicly available - validate only type and basic bounds
  areaAnatomica: number;

  @IsNumber({}, { message: 'Consecuencia/gravedad debe ser un número entero' })
  @IsNotEmpty({ message: 'Consecuencia/gravedad es requerida' })
  // Note: Official DGIS catalog not publicly available - validate only type and basic bounds
  consecuenciaGravedad: number;

  // Diagnósticos CIE-10
  @IsString({ message: 'Código CIE-10 afección principal debe ser un string' })
  @IsNotEmpty({ message: 'Código CIE-10 afección principal es requerido' })
  @Matches(/^[A-Z][0-9]{2}(\.[0-9]{1,2})?$/, {
    message:
      'Código CIE-10 afección principal debe tener formato válido (ej: A00.0)',
  })
  codigoCIEAfeccionPrincipal: string;

  @IsString({ message: 'Código CIE-10 causa externa debe ser un string' })
  @IsNotEmpty({ message: 'Código CIE-10 causa externa es requerido' })
  @Matches(/^V[0-9]{2}|^W[0-9]{2}|^X[0-9]{2}|^Y[0-9]{2}$/, {
    message: 'Código CIE-10 causa externa debe ser del Capítulo XX (V01-Y98)',
  })
  codigoCIECausaExterna: string;

  @IsOptional()
  @IsArray({ message: 'Afecciones tratadas debe ser un array' })
  @IsString({ each: true, message: 'Cada afección tratada debe ser un string' })
  afeccionesTratadas?: string[];

  @IsOptional()
  @IsString()
  especifiqueArea?: string;

  @IsOptional()
  @IsString()
  especifiqueConsecuencia?: string;

  @IsOptional()
  @IsString()
  descripcionAfeccionPrincipal?: string;

  @IsOptional()
  @IsString()
  descripcionAfeccion?: string;

  @IsOptional()
  @IsString()
  afeccionPrincipalReseleccionada?: string;

  @IsOptional()
  @IsString()
  causaExterna?: string;

  @IsOptional()
  @IsEnum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], {
    message:
      'despuesAtencion debe ser 1-11 (Domicilio, Traslado, Serv. Violencia, etc.)',
  })
  despuesAtencion?: number;

  @ValidateIf((o) => o.despuesAtencion === 11)
  @IsOptional()
  @IsString()
  especifiqueDestino?: string;

  @IsOptional()
  @IsEnum([1, 2], { message: 'ministerioPublico debe ser 1 (SI) o 2 (NO)' })
  ministerioPublico?: number;

  @ValidateIf((o) => o.despuesAtencion === 5 && o.ministerioPublico === 2)
  @IsOptional()
  @IsString()
  folioCertificadoDefuncion?: string;

  @IsOptional()
  @IsDate({ message: 'Fecha del reporte debe ser una fecha' })
  @Type(() => Date)
  fechaReporteLesion?: Date; // Fecha en que se capturó el formulario del reporte

  // Profesional Responsable
  @IsNumber({}, { message: 'Responsable de atención debe ser un número' })
  @IsEnum([1, 2, 3], {
    message:
      'Responsable de atención debe ser 1 (Médico), 2 (Psicólogo) o 3 (Trabajador Social)',
  })
  @IsNotEmpty({ message: 'Responsable de atención es requerido' })
  responsableAtencion: number;

  @IsString({ message: 'CURP del responsable debe ser un string' })
  @IsNotEmpty({ message: 'CURP del responsable es requerido' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'CURP del responsable debe tener formato RENAPO válido',
  })
  curpResponsable: string;

  // Referencias
  @IsMongoId({ message: 'El ID del trabajador debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID del trabajador es requerido' })
  idTrabajador: string;

  @IsMongoId({ message: 'El ID de "createdBy" debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID de "createdBy" es requerido' })
  createdBy: string;

  @IsMongoId({ message: 'El ID de "updatedBy" debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID de "updatedBy" es requerido' })
  updatedBy: string;
}
