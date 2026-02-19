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
 * Alineado con lesion.schema.ts - solo campos que persiste el schema
 * idProveedorSalud y folio se asignan en el backend (autogenerado)
 */
export class CreateLesionDto {
  // ========== STEP 0: Fecha del reporte ==========
  @IsNotEmpty({ message: 'Fecha del reporte es requerida' })
  @IsDate({ message: 'Fecha del reporte debe ser una fecha' })
  @Type(() => Date)
  fechaReporteLesion: Date;

  // ========== STEP 1: ¿Cuándo ocurrió el evento? ==========
  @IsDate({ message: 'Fecha del evento debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'Fecha del evento es requerida' })
  fechaEvento: Date;

  @IsOptional()
  @IsString()
  @Matches(/^(([0-1][0-9]|2[0-3]):[0-5][0-9]|99:99)$/, {
    message:
      'Hora del evento debe estar en formato HH:mm o 99:99 si se desconoce',
  })
  horaEvento?: string;

  @IsOptional()
  @IsEnum([1, 2], { message: 'diaFestivo debe ser 1 (SI) o 2 (NO)' })
  diaFestivo?: number;

  @IsOptional()
  @IsEnum([1, 2], {
    message: 'eventoRepetido debe ser 1 (Única vez) o 2 (Repetido)',
  })
  eventoRepetido?: number;

  // ========== STEP 2: ¿Dónde ocurrió? (Lugar) ==========
  @IsNumber()
  @IsNotEmpty({ message: 'Sitio de ocurrencia es requerido' })
  sitioOcurrencia: number;

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

  // ========== STEP 3: ¿Cómo ocurrió? (Circunstancias / Intencionalidad) ==========
  @IsNumber()
  @IsEnum([1, 2, 3, 4], {
    message:
      'Intencionalidad debe ser 1 (Accidental), 2 (Violencia Familiar), 3 (Violencia No Familiar) o 4 (Autoinfligido)',
  })
  @IsNotEmpty({ message: 'Intencionalidad es requerida' })
  intencionalidad: number;

  @ValidateIf((o) => o.intencionalidad === 1 || o.intencionalidad === 4)
  @IsOptional()
  @IsNumber()
  agenteLesion?: number;

  @IsOptional()
  @IsString()
  especifique?: string;

  @ValidateIf((o) => o.intencionalidad === 2 || o.intencionalidad === 3)
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tipoViolencia?: number[];

  @IsOptional()
  @IsEnum([1, 2, 3], {
    message:
      'numeroAgresores debe ser 1 (Único), 2 (Más de uno) o 3 (No especificado)',
  })
  numeroAgresores?: number;

  @IsOptional()
  @IsNumber()
  parentescoAfectado?: number;

  @IsOptional()
  @IsNumber()
  sexoAgresor?: number;

  @IsOptional()
  @IsNumber()
  edadAgresor?: number;

  @IsOptional()
  @IsString()
  agresorBajoEfectos?: string;

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

  @IsOptional()
  @IsString()
  sospechaBajoEfectosDe?: string;

  @IsOptional()
  @IsEnum([1, 2], {
    message: 'atencionPreHospitalaria debe ser 1 (SI) o 2 (NO)',
  })
  atencionPreHospitalaria?: number;

  @ValidateIf((o) => o.atencionPreHospitalaria === 1)
  @IsOptional()
  @IsString()
  @Matches(/^(([0-3][0-9]|4[0-8]):[0-5][0-9]|99:99)$/, {
    message:
      'tiempoTrasladoUH debe estar en formato HH:mm (duración 00:00-48:59) o 99:99 si se desconoce',
  })
  tiempoTrasladoUH?: string;

  // ========== STEP 4: Atención recibida ==========
  @IsDate({ message: 'Fecha de atención debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'Fecha de atención es requerida' })
  fechaAtencion: Date;

  @IsOptional()
  @IsString()
  @Matches(/^(([0-1][0-9]|2[0-3]):[0-5][0-9]|99:99)$/, {
    message: 'horaAtencion debe estar en formato HH:mm o 99:99 si se desconoce',
  })
  horaAtencion?: string;

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

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(5, { message: 'Tipo de atención puede tener máximo 5 valores' })
  @IsNotEmpty({ message: 'Tipo de atención es requerido' })
  tipoAtencion: number[];

  // ========== STEP 5: Evaluación clínica / Diagnóstico ==========
  @IsNumber()
  @IsNotEmpty({ message: 'Área anatómica es requerida' })
  areaAnatomica: number;

  @IsOptional()
  @IsString()
  especifiqueArea?: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Consecuencia/gravedad es requerida' })
  consecuenciaGravedad: number;

  @IsOptional()
  @IsString()
  especifiqueConsecuencia?: string;

  @IsString()
  @IsNotEmpty({ message: 'Código CIE-10 afección principal es requerido' })
  @Matches(/^[A-Z][0-9]{2,3}(\.[0-9]{1,2})?$/, {
    message:
      'Código CIE-10 afección principal debe tener formato válido (ej: A00.0, S000)',
  })
  codigoCIEAfeccionPrincipal: string;

  @IsOptional()
  @IsString()
  descripcionAfeccionPrincipal?: string;

  @IsString()
  @IsNotEmpty({ message: 'Código CIE-10 causa externa es requerido' })
  @Matches(/^[VWXY][0-9]{2,3}(\.[0-9]{1,2})?$/, {
    message: 'Código CIE-10 causa externa debe ser del Capítulo XX (V01-Y98)',
  })
  codigoCIECausaExterna: string;

  @IsOptional()
  @IsString()
  causaExterna?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  afeccionesTratadas?: string[];

  @IsOptional()
  @IsString()
  descripcionAfeccion?: string;

  @IsOptional()
  @IsString()
  afeccionPrincipalReseleccionada?: string;

  // ========== STEP 6: Destino y seguimiento ==========
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

  // ========== Referencias ==========
  @IsOptional()
  @IsString()
  rutaPDF?: string; // Directorio donde se guarda el PDF (expedientes-medicos/empresa/centro/trabajador_id)

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
