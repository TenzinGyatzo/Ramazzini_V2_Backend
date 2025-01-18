import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Matches, ValidateNested } from 'class-validator';

class LogotipoDto {
    @IsString({ message: 'El "data" del logotipo debe ser un string' })
    @IsNotEmpty({ message: 'El "data" del logotipo no puede estar vacío' })
    data: string;
  
    @IsString({ message: 'El "contentType" del logotipo debe ser un string' })
    @IsNotEmpty({ message: 'El "contentType" del logotipo no puede estar vacío' })
    contentType: string;
  }

export class CreateProveedoresSaludDto {
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

    @ValidateNested()
    @Type(() => LogotipoDto)
    logotipoEmpresa?: LogotipoDto;

    @IsString({ message: 'La direccion debe ser un string' })
    @IsNotEmpty({ message: 'La direccion no puede estar vacía' })
    direccion: string;

    @IsString({ message: 'La ciudad debe ser un string' })
    @IsNotEmpty({ message: 'La ciudad no puede estar vacía' })
    ciudad: string;

    @IsString({ message: 'La municipio debe ser un string' })
    @IsNotEmpty({ message: 'La municipio no puede estar vacía' })
    municipio: string;

    @IsString({ message: 'La estado debe ser un string' })
    @IsNotEmpty({ message: 'La estado no puede estar vacía' })
    estado: string;

    @IsString({ message: 'El Código Postal debe ser un string' })
    @IsNotEmpty({ message: 'El Código Postal no puede estar vacío' })
    @Matches(/^[0-9]{5}$/, { message: 'El Código Postal debe de tener un formato válido' })
    codigoPostal: string

    @IsString({ message: 'El teléfono debe ser un string' })
    @Matches(/^$|^[0-9]{10}$/, { message: 'El teléfono debe estar vacío o tener 10 dígitos' })
    telefono?: string; // El operador `?` también indica que es opcional en TypeScript

    @IsString({ message: 'El email debe ser un string' })
    @IsNotEmpty({ message: 'El email no puede estar vacío' })
    @Matches(/^$|^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, {
      message: 'El email debe de tener un formato válido',
    })
    correoElectronico?: string; // El operador `?` è opcional en TypeScript

    @IsString({ message: 'El sitio web debe ser un string' })
    @IsNotEmpty({ message: 'El sitio web no puede estar vacío' })
    sitioWeb?: string; // El operador `?` è opcional en TypeScript
}
