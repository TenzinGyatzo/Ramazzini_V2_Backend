import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';

const perfiles = [
  'Médico único de empresa',
  'Médico independiente que brinda servicios a empresas',
  'Empresa de salud ocupacional',
  'Equipo Médico Interno de la Empresa',
  'Otro',
];

class LogotipoDto {
  @IsString({ message: 'El "data" del logotipo debe ser un string' })
  data: string;

  @IsString({ message: 'El "contentType" del logotipo debe ser un string' })
  contentType: string;
}

class AddOnDto {
  @IsString({ message: 'El tipo de add-on debe ser un string' })
  tipo: string;

  @IsNumber({}, { message: 'La cantidad del add-on debe ser un número' })
  cantidad: number;
}

export class CreateProveedoresSaludDto {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @IsString({ message: 'El RFC debe ser un string' })
  @IsNotEmpty({ message: 'El RFC no puede estar vacío' })
  RFC: string;

  @IsString({ message: 'El perfil del proveedor de salud debe ser un string' })
  @IsNotEmpty({ message: 'El perfil del proveedor de salud no puede estar vacío' })
  @IsEnum(perfiles, { message: 'El perfil del proveedor de salud debe ser uno de los valores predefinidos' })
  perfilProveedorSalud: string;

  @IsOptional()
  @Type(() => LogotipoDto)
  logotipoEmpresa?: LogotipoDto;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un string' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'El municipio debe ser un string' })
  municipio?: string;

  @IsOptional()
  @IsString({ message: 'El Código Postal debe ser un string' })
  codigoPostal?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser un string' })
  direccion?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'El email debe ser un string' })
  correoElectronico?: string;

  @IsOptional()
  @IsString({ message: 'El sitio web debe ser un string' })
  sitioWeb?: string;

  // **Campos relacionados con la suscripción y planes**
  @IsOptional()
  @IsString({ message: 'La referencia del plan debe ser un string' })
  referenciaPlan?: string; // INDIVIDUAL, PROFESIONAL, EMPRESARIAL

  @IsOptional()
  @IsNumber({}, { message: 'El número máximo de usuarios permitidos debe ser un número' })
  maxUsuariosPermitidos?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El número máximo de empresas permitidas debe ser un número' })
  maxEmpresasPermitidas?: number;

  @IsOptional()
  @IsString({ message: 'El estado de la suscripción debe ser un string' })
  estadoSuscripcion?: string; // pending, authorized

  @IsOptional()
  @Type(() => Date)
  fechaInicioTrial?: Date;

  @IsOptional()
  @IsBoolean({ message: 'El campo periodoDePruebaFinalizado debe ser un booleano' })
  periodoDePruebaFinalizado?: boolean;

  @IsOptional()
  @IsArray({ message: 'El campo addOns debe ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => AddOnDto)
  addOns?: AddOnDto[];

  // **Campos vinculados a MercadoPago**
  @IsOptional()
  @IsString({ message: 'El mercadoPagoSubscriptionId debe ser un string' })
  mercadoPagoSubscriptionId?: string;

  @IsOptional()
  @IsString({ message: 'El payerEmail debe ser un string' })
  payerEmail?: string;
}
