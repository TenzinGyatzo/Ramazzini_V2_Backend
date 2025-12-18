import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  Matches,
  ValidateNested,
  IsOptional,
  IsMongoId,
} from 'class-validator';

class LogotipoDto {
  @ApiProperty({
    description: 'Nombre del Logotipo',
    example: 'baketopLogo.png;,',
  })
  @IsString({ message: 'El "data" del logotipo debe ser un string' })
  @IsNotEmpty({ message: 'El "data" del logotipo no puede estar vacío' })
  data: string;

  @ApiProperty({
    description: 'Tipo de Contenido del Logotipo',
    example: 'image/png',
  })
  @IsString({ message: 'El "contentType" del logotipo debe ser un string' })
  @IsNotEmpty({ message: 'El "contentType" del logotipo no puede estar vacío' })
  contentType: string;
}

export class CreateEmpresaDto {
  @ApiProperty({
    description: 'Nombre comercial de la empresa',
    example: 'Bake Top',
  })
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre comercial no puede estar vacío' })
  nombreComercial: string;

  @ApiProperty({
    description: 'Razón social de la empresa',
    example: 'Bakery Topolobampo S.A. de C.V.',
    required: false,
  })
  @IsString({ message: 'La razón social debe ser un string' })
  @IsOptional()
  razonSocial?: string;

  @ApiProperty({
    description:
      'RFC/Registro Patronal de la empresa (opcional, alfanumérico con separadores)',
    example: 'BTK123456Y32 o REG-123456',
    required: false,
  })
  @IsString({ message: 'El RFC debe ser un string' })
  @IsOptional()
  @Matches(/^$|^[A-ZÑÁÉÍÓÚ&]{2,8}[\s\-\._]?[A-Z0-9ÑÁÉÍÓÚ\s\-\._]{4,20}$/i, {
    message:
      'El identificador de empresa debe tener entre 6 y 28 caracteres alfanuméricos con separadores',
  })
  RFC?: string;

  @ApiProperty({
    description: 'Giro de la empresa',
    example: 'Pastelería',
  })
  @IsString({ message: 'El giro de la empresa debe ser un string' })
  @IsOptional()
  giroDeEmpresa: string;

  @ApiProperty({
    description: 'Logotipo de la empresa',
    type: LogotipoDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => LogotipoDto)
  @IsOptional()
  logotipoEmpresa?: LogotipoDto;

  @ApiProperty({
    description: 'El ID del usuario que creó este registro',
    example: '60d9f70fc39b3c1b8f0d6c0b',
  })
  @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
  @IsNotEmpty({ message: 'El ID de "createdBy" no puede estar vacío' })
  createdBy: string;

  @ApiProperty({
    description: 'El ID del usuario que actualizó este registro',
    example: '60d9f70fc39b3c1b8f0d6c0b',
  })
  @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
  @IsNotEmpty({ message: 'El ID de "updatedBy" no puede estar vacío' })
  updatedBy: string;

  @IsMongoId({ message: 'El ID de "idProveedorSalud" no es válido' })
  @IsNotEmpty({ message: 'El ID de "idProveedorSalud" no puede estar vacío' })
  idProveedorSalud: string;
}
