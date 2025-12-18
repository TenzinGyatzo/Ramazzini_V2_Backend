import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Matches,
  IsArray,
} from 'class-validator';

const tipoNota = ['Inicial', 'Seguimiento', 'Alta'];

export class CreateNotaMedicaDto {
  @IsNotEmpty({ message: 'El motivo del examen no puede estar vacío' })
  @IsEnum(tipoNota, {
    message:
      'El motivo del examen debe ser alguno de los siguientes: ' + tipoNota,
  })
  tipoNota: string;

  @IsDate({ message: 'La fecha de la nota médica debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de la nota médica no puede estar vacía' })
  fechaNotaMedica: Date;

  @IsString({ message: 'El motivo de consulta debe ser un string' })
  @IsNotEmpty({ message: 'El motivo de consulta no puede estar vacío' })
  motivoConsulta: string;

  @IsOptional()
  @IsString({ message: 'Los antecedentes deben ser un string' })
  antecedentes: string;

  @IsOptional()
  @IsString({ message: 'La exploración física debe ser un string' })
  exploracionFisica: string;

  // Signos Vitales
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(60)
  @Max(200)
  tensionArterialSistolica: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(40)
  @Max(150)
  tensionArterialDiastolica: number;

  @IsOptional()
  @Min(40)
  @Max(150)
  @IsNumber({ maxDecimalPlaces: 0 })
  frecuenciaCardiaca: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(12)
  @Max(45)
  frecuenciaRespiratoria: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(35)
  @Max(41)
  temperatura: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(80)
  @Max(100)
  saturacionOxigeno: number;

  @IsOptional()
  @IsString({ message: 'El diagnóstico debe ser un string' })
  diagnostico: string; // Free-text diagnosis (backward compatibility)

  // NOM-024: CIE-10 Diagnosis Codes
  @IsOptional()
  @IsString({ message: 'El código CIE-10 principal debe ser un string' })
  @Matches(/^$|^[A-Z][0-9]{2}(\.[0-9]{1,2})?$/, {
    message:
      'El código CIE-10 principal debe tener el formato A00.0 o A00 (letra seguida de 2-3 dígitos opcionalmente con punto y 1-2 dígitos)',
  })
  codigoCIE10Principal?: string;

  @IsOptional()
  @IsArray({ message: 'Los códigos CIE-10 secundarios deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada código CIE-10 secundario debe ser un string',
  })
  @Matches(/^[A-Z][0-9]{2}(\.[0-9]{1,2})?$/, {
    each: true,
    message: 'Cada código CIE-10 secundario debe tener el formato A00.0 o A00',
  })
  codigosCIE10Secundarios?: string[];

  @IsOptional()
  @IsString({ each: true, message: 'Cada tratamiento debe ser un string' })
  tratamiento: string[];

  @IsOptional()
  @IsString({ each: true, message: 'Cada recomendación debe ser un string' })
  recomendaciones: string[];

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser un string' })
  observaciones: string;

  @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
  @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
  idTrabajador: string;

  @IsString({ message: 'La ruta del PDF del informe debe ser un string' })
  @IsNotEmpty({ message: 'La ruta del PDF del informe no puede estar vacía' })
  rutaPDF: string;

  @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
  @IsNotEmpty({ message: 'El ID de "createdBy" no puede estar vacío' })
  createdBy: string;

  @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
  @IsNotEmpty({ message: 'El ID de "updatedBy" no puede estar vacío' })
  updatedBy: string;
}
