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
  // Identificación del Establecimiento
  @IsString({ message: 'CLUES debe ser un string' })
  @IsNotEmpty({ message: 'CLUES es requerido' })
  @Matches(/^[A-Z0-9]{11}$/, {
    message: 'CLUES debe tener exactamente 11 caracteres alfanuméricos',
  })
  clues: string;

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
  @IsEnum([1, 2, 3], { message: 'Sexo debe ser 1 (Hombre), 2 (Mujer) o 3 (Intersexual)' })
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

  @IsNumber({}, { message: 'Sitio de ocurrencia debe ser un número entero' })
  @IsNotEmpty({ message: 'Sitio de ocurrencia es requerido' })
  // Note: Official DGIS catalog not publicly available - validate only type and basic bounds
  sitioOcurrencia: number;

  @IsNumber({}, { message: 'Intencionalidad debe ser un número' })
  @IsEnum([1, 2, 3, 4], {
    message: 'Intencionalidad debe ser 1 (Accidental), 2 (Violencia Familiar), 3 (Violencia No Familiar) o 4 (Autoinfligido)',
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
  @IsNumber({}, { each: true, message: 'Cada tipo de violencia debe ser un número' })
  @IsNotEmpty({ message: 'Tipo de violencia es requerido para violencia' })
  tipoViolencia?: number[];

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
  @IsNumber({}, { each: true, message: 'Cada tipo de atención debe ser un número' })
  @ArrayMaxSize(5, { message: 'Tipo de atención puede tener máximo 5 valores' })
  @IsNotEmpty({ message: 'Tipo de atención es requerido' })
  tipoAtencion: number[];

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
    message: 'Código CIE-10 afección principal debe tener formato válido (ej: A00.0)',
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

  // Profesional Responsable
  @IsNumber({}, { message: 'Responsable de atención debe ser un número' })
  @IsEnum([1, 2, 3], {
    message: 'Responsable de atención debe ser 1 (Médico), 2 (Psicólogo) o 3 (Trabajador Social)',
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

