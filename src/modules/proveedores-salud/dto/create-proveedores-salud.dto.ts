import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested, IsOptional, IsEnum } from 'class-validator';

const perfiles = [
  'Médico único de empresa',
  'Médico independiente que brinda servicios a empresas',
  'Empresa de salud ocupacional',
  'Equipo Médico Interno de la Empresa',
  'Otro',
]

class LogotipoDto {
    @IsString({ message: 'El "data" del logotipo debe ser un string' })
    data: string;
  
    @IsString({ message: 'El "contentType" del logotipo debe ser un string' })
    contentType: string;
  }

export class CreateProveedoresSaludDto {
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    nombre: string;
    
    @IsString({ message: 'El RFC debe ser un string' })
    @IsNotEmpty({ message: 'El RFC no puede estar vacío' })
    /* @Matches(/^([A-ZÑ&]{3,4})\d{6}([A-Z0-9]{2}[A0-9])$/, {
      message: 'El RFC debe de tener un formato válido',
    }) */
    RFC: string;

    @IsString({ message: 'El perfil del proveedor de salud debe ser un string' })
    @IsNotEmpty({ message: 'El perfil del proveedor de salud no puede estar vacío' })
    @IsEnum(perfiles, { message: 'El perfil del proveedor de salud debe ser uno de los valores predefinidos' })
    perfilProveedorSalud: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => LogotipoDto)
    logotipoEmpresa?: LogotipoDto;

    @IsOptional()
    @IsString({ message: 'La estado debe ser un string' })
    estado?: string;
    
    @IsOptional()
    @IsString({ message: 'La municipio debe ser un string' })
    municipio?: string;
    
    @IsOptional()
    @IsString({ message: 'El Código Postal debe ser un string' })
    // @Matches(/^[0-9]{5}$/, { message: 'El Código Postal debe de tener un formato válido o estar vacío' })
    codigoPostal?: string

    @IsOptional()
    @IsString({ message: 'La direccion debe ser un string' })
    direccion?: string;
    
    @IsOptional()
    @IsString({ message: 'El teléfono debe ser un string' })
    // @Matches(/^$|^[0-9]{10}$/, { message: 'El teléfono debe estar vacío o tener 10 dígitos' })
    telefono?: string; // El operador `?` también indica que es opcional en TypeScript

    @IsOptional()
    @IsString({ message: 'El email debe ser un string' })
    /* @Matches(/^$|^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, {
      message: 'El email debe de tener un formato válido o estar vacío',
    }) */
    correoElectronico?: string; // El operador `?` es opcional en TypeScript

    @IsOptional()
    @IsString({ message: 'El sitio web debe ser un string' })
    sitioWeb?: string; // El operador `?` es opcional en TypeScript
}
