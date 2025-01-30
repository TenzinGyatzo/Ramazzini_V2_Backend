import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Matches, ValidateNested, IsEnum, IsMongoId } from 'class-validator';

const basesOperaciones = ["Pruebas", "Los Mochis"];

class LogotipoDto {
    @ApiProperty({
      description: 'Nombre del Logotipo',
      example: 'baketopLogo.png;,'
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
  })
  @IsString({ message: 'La razón social debe ser un string' })
  @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
  razonSocial: string;

  @ApiProperty({
    description: 'RFC de la empresa',
    example: 'BTK123456Y32',
  })
  @IsString({ message: 'El RFC debe ser un string' })
  @IsNotEmpty({ message: 'El RFC no puede estar vacío' })
  @Matches(/^[A-ZÑ&]{3,4}\d{2}\d{2}\d{2}[A-Z\d]{3}$/, {
    message: 'El RFC debe de tener un formato válido',
  })
  RFC: string;

  @ApiProperty({
    description: 'Giro de la empresa',
    example: 'Pastelería',
  })
  @IsString({ message: 'El giro de la empresa debe ser un string' })
  giroDeEmpresa: string;

  @ApiProperty({
    description: 'Logotipo de la empresa',
    type: LogotipoDto,
  })
  @ValidateNested()
  @Type(() => LogotipoDto)
  logotipoEmpresa?: LogotipoDto;

  @ApiProperty({
    description: 'Base de operaciones de la empresa',
    enum: basesOperaciones,
    example: 'Los Mochis',
  })
  @IsString({ message: 'La base de operaciones debe ser un string' })
  @IsNotEmpty({ message: 'La base de operaciones no puede estar vacía' })
  @IsEnum(basesOperaciones, { message: 'La base de operaciones no es válida' })
  baseOperaciones: string;

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
