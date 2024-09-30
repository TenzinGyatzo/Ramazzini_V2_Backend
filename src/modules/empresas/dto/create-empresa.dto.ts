import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Matches, ValidateNested, IsEnum, IsMongoId } from 'class-validator';

const basesOperaciones = ["Pruebas", "Los Mochis"];

class LogotipoDto {
    @IsString({ message: 'El "data" del logotipo debe ser un string' })
    @IsNotEmpty({ message: 'El "data" del logotipo no puede estar vacío' })
    data: string;
  
    @IsString({ message: 'El "contentType" del logotipo debe ser un string' })
    @IsNotEmpty({ message: 'El "contentType" del logotipo no puede estar vacío' })
    contentType: string;
  }

export class CreateEmpresaDto {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre comercial no puede estar vacío' })
  nombreComercial: string;

  @IsString({ message: 'La razón social debe ser un string' })
  @IsNotEmpty({ message: 'La razón social no puede estar vacía' })
  razonSocial: string;

  @IsString({ message: 'El RFC debe ser un string' })
  @IsNotEmpty({ message: 'El RFC no puede estar vacío' })
  @Matches(/^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{2}[A0-9])$/, {
    message: 'El RFC debe de tener un formato válido',
  })
  RFC: string;

  @IsString({ message: 'El giro de la empresa debe ser un string' })
  giroDeEmpresa: string;

  @ValidateNested()
  @Type(() => LogotipoDto)
  logotipoEmpresa: LogotipoDto;

  @IsString({ message: 'La base de operaciones debe ser un string' })
  @IsNotEmpty({ message: 'La base de operaciones no puede estar vacía' })
  @IsEnum(basesOperaciones, { message: 'La base de operaciones no es válida' })
  baseOperaciones: string;

  @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
  createdBy: string;

  @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
  updatedBy: string;
}
