import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateConstanciaAptitudDto {
  @ApiProperty({
    description: 'Fecha de la constancia de aptitud',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsDate({ message: 'La fecha de la constancia debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha de la constancia no puede estar vacía' })
  fechaConstanciaAptitud: Date;

  @ApiProperty({
    description: 'El ID del trabajador',
    example: '671fe9cc00fcb5611b10686e',
  })
  @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
  @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
  idTrabajador: string;

  @ApiProperty({
    description: 'Ruta hacía el PDF de la constancia',
    example:
      'expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf',
  })
  @IsString({ message: 'La ruta del PDF de la constancia debe ser un string' })
  @IsNotEmpty({
    message: 'La ruta del PDF de la constancia no puede estar vacía',
  })
  rutaPDF: string;

  @ApiProperty({
    description: 'El ID del usuario que creó este registro',
    example: '60d9f70fc39b3c1b8f0d6c0b',
  })
  @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
  @IsNotEmpty({ message: 'El ID de "createdBy" no puede estar vacío' })
  createdBy: string;

  @ApiProperty({
    description: 'El ID del usuario que actualizó este registro',
    example: '60d9f70fc39b3c1b8f0d6c0c',
  })
  @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
  @IsNotEmpty({ message: 'El ID de "updatedBy" no puede estar vacío' })
  updatedBy: string;
}
