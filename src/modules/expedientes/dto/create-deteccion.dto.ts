import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Matches,
  Min,
  Max,
} from 'class-validator';

/**
 * Create Detección DTO
 * GIIS-B019 Screening/Detection reporting
 *
 * Note: Official DGIS catalogs (TIPO_PERSONAL, SERVICIOS_DET, AFILIACION, PAIS)
 * are NOT publicly available. Best-effort validation is applied.
 *
 * - MX providers: Core fields required, strict ranges enforced
 * - Non-MX providers: All fields optional, basic format validation only
 */
export class CreateDeteccionDto {
  // ==================== A) Core / Linkage Fields ====================

  @IsDate({ message: 'Fecha de detección debe ser una fecha válida' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'Fecha de detección es requerida' })
  fechaDeteccion: Date;

  @IsMongoId({ message: 'El ID del trabajador debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID del trabajador es requerido' })
  idTrabajador: string;

  @IsOptional()
  @IsString({ message: 'CLUES debe ser un string' })
  @Matches(/^[A-Z0-9]{11}$/, {
    message: 'CLUES debe tener exactamente 11 caracteres alfanuméricos',
  })
  clues?: string;

  @IsOptional()
  @IsString({ message: 'CURP del prestador debe ser un string' })
  @Matches(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/, {
    message: 'CURP del prestador debe tener formato RENAPO válido',
  })
  curpPrestador?: string;

  // ==================== B) Screening / Service Identifiers ====================

  @IsOptional()
  @IsNumber({}, { message: 'Tipo de personal debe ser un número' })
  @Min(1, { message: 'Tipo de personal debe ser >= 1' })
  tipoPersonal?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Servicio de atención debe ser un número' })
  @Min(1, { message: 'Servicio de atención debe ser >= 1' })
  servicioAtencion?: number;

  @IsOptional()
  @IsBoolean({ message: 'Primera vez en año debe ser booleano' })
  primeraVezAnio?: boolean;

  // ==================== C) Measurements / Vitals ====================

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Peso debe ser un número' })
  @Min(1, { message: 'Peso debe ser >= 1 kg' })
  @Max(400, { message: 'Peso debe ser <= 400 kg' })
  peso?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Talla debe ser un número' })
  @Min(20, { message: 'Talla debe ser >= 20 cm' })
  @Max(300, { message: 'Talla debe ser <= 300 cm' })
  talla?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Cintura debe ser un número' })
  @Min(20, { message: 'Cintura debe ser >= 20 cm' })
  @Max(300, { message: 'Cintura debe ser <= 300 cm' })
  cintura?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tensión arterial sistólica debe ser un número' })
  @Min(30, { message: 'Tensión arterial sistólica debe ser >= 30' })
  @Max(250, { message: 'Tensión arterial sistólica debe ser <= 250' })
  tensionArterialSistolica?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tensión arterial diastólica debe ser un número' })
  @Min(20, { message: 'Tensión arterial diastólica debe ser >= 20' })
  @Max(150, { message: 'Tensión arterial diastólica debe ser <= 150' })
  tensionArterialDiastolica?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Glucemia debe ser un número' })
  @Min(20, { message: 'Glucemia debe ser >= 20' })
  @Max(999, { message: 'Glucemia debe ser <= 999' })
  glucemia?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Tipo de medición de glucemia debe ser un número' })
  @IsEnum([1, 2], {
    message: 'Tipo de medición debe ser 1 (Ayuno) o 2 (Casual)',
  })
  tipoMedicionGlucemia?: number;

  // ==================== D) Results Blocks ====================

  // Mental Health Block (age >= 10)
  @IsOptional()
  @IsNumber({}, { message: 'Depresión debe ser un número' })
  @IsEnum([0, 1, -1], {
    message: 'Depresión debe ser 0 (Positivo), 1 (Negativo) o -1 (NA)',
  })
  depresion?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Ansiedad debe ser un número' })
  @IsEnum([0, 1, -1], {
    message: 'Ansiedad debe ser 0 (Positivo), 1 (Negativo) o -1 (NA)',
  })
  ansiedad?: number;

  // Geriatrics Block (age >= 60)
  @IsOptional()
  @IsNumber({}, { message: 'Deterioro de memoria debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Deterioro de memoria debe ser 0, 1 o -1' })
  deterioroMemoria?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Riesgo de caídas debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Riesgo de caídas debe ser 0, 1 o -1' })
  riesgoCaidas?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Alteración de marcha debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Alteración de marcha debe ser 0, 1 o -1' })
  alteracionMarcha?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Dependencia ABVD debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Dependencia ABVD debe ser 0, 1 o -1' })
  dependenciaABVD?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Necesita cuidador debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Necesita cuidador debe ser 0, 1 o -1' })
  necesitaCuidador?: number;

  // Chronic Diseases Block (age >= 20)
  @IsOptional()
  @IsNumber({}, { message: 'Riesgo de diabetes debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Riesgo de diabetes debe ser 0, 1 o -1' })
  riesgoDiabetes?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Riesgo de hipertensión debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Riesgo de hipertensión debe ser 0, 1 o -1' })
  riesgoHipertension?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Obesidad debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Obesidad debe ser 0, 1 o -1' })
  obesidad?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Dislipidemia debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Dislipidemia debe ser 0, 1 o -1' })
  dislipidemia?: number;

  // Addictions Block
  @IsOptional()
  @IsNumber({}, { message: 'Consumo de alcohol debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Consumo de alcohol debe ser 0, 1 o -1' })
  consumoAlcohol?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Consumo de tabaco debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Consumo de tabaco debe ser 0, 1 o -1' })
  consumoTabaco?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Consumo de drogas debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Consumo de drogas debe ser 0, 1 o -1' })
  consumoDrogas?: number;

  // ITS Block
  @IsOptional()
  @IsNumber({}, { message: 'Resultado VIH debe ser un número' })
  @Min(1, { message: 'Resultado VIH debe ser >= 1' })
  @Max(10, { message: 'Resultado VIH debe ser <= 10' })
  resultadoVIH?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Resultado sífilis debe ser un número' })
  @Min(1, { message: 'Resultado sífilis debe ser >= 1' })
  @Max(10, { message: 'Resultado sífilis debe ser <= 10' })
  resultadoSifilis?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Resultado hepatitis B debe ser un número' })
  @Min(1, { message: 'Resultado hepatitis B debe ser >= 1' })
  @Max(10, { message: 'Resultado hepatitis B debe ser <= 10' })
  resultadoHepatitisB?: number;

  // Cancer Screening
  @IsOptional()
  @IsNumber({}, { message: 'Cáncer cervicouterino debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Cáncer cervicouterino debe ser 0, 1 o -1' })
  cancerCervicouterino?: number;

  @IsOptional()
  @IsNumber({}, { message: 'VPH debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'VPH debe ser 0, 1 o -1' })
  vph?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Cáncer de mama debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Cáncer de mama debe ser 0, 1 o -1' })
  cancerMama?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Hiperplasia prostática debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Hiperplasia prostática debe ser 0, 1 o -1' })
  hiperplasiaProstatica?: number;

  // Violence Detection
  @IsOptional()
  @IsNumber({}, { message: 'Violencia mujer debe ser un número' })
  @IsEnum([0, 1, -1], { message: 'Violencia mujer debe ser 0, 1 o -1' })
  violenciaMujer?: number;

  // ==================== E) Document Lifecycle Fields ====================

  @IsMongoId({ message: 'El ID de "createdBy" debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID de "createdBy" es requerido' })
  createdBy: string;

  @IsMongoId({ message: 'El ID de "updatedBy" debe ser un ObjectId válido' })
  @IsNotEmpty({ message: 'El ID de "updatedBy" es requerido' })
  updatedBy: string;
}
