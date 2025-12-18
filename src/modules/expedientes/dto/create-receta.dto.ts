import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecetaDto {
  @IsDate({ message: 'La fecha de la receta debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de la receta no puede estar vacía' })
  fechaReceta: Date;

  @IsArray({ message: 'El tratamiento debe ser una lista' })
  @ArrayNotEmpty({
    message: 'El tratamiento debe incluir al menos un elemento',
  })
  @IsString({ each: true, message: 'Cada tratamiento debe ser un string' })
  tratamiento: string[];

  @IsOptional()
  @IsArray({ message: 'Las recomendaciones deben ser una lista' })
  @IsString({ each: true, message: 'Cada recomendación debe ser un string' })
  recomendaciones?: string[];

  @IsOptional()
  @IsString({ message: 'Las indicaciones deben ser un string' })
  indicaciones: string;

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
