import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  IsMongoId,
  IsOptional,
} from 'class-validator';

const titulos = ['Dr.', 'Dra.'];
const siONo = ['Si', 'No'];

class LogotipoDto {
  @IsString({ message: 'El "data" del logotipo debe ser un string' })
  data: string;

  @IsString({ message: 'El "contentType" del logotipo debe ser un string' })
  contentType: string;
}

export class CreateMedicoFirmanteDto {
  @IsString({ message: 'El nombre debe ser un string' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'El título profesional debe ser un string' })
  // @IsEnum(titulos, { message: 'El título profesional debe ser Dr. o Dra.' })
  tituloProfesional?: string;

  @IsOptional()
  @IsString({ message: 'El numero de cédula profesional debe ser un string' })
  numeroCedulaProfesional?: string;

  @IsOptional()
  // @IsEnum(siONo, { message: 'especialistaSaludTrabajo debe ser Si o No' })
  especialistaSaludTrabajo?: string;

  @IsOptional()
  @IsString({
    message: 'El numero de cédula de especialista debe ser un string',
  })
  numeroCedulaEspecialista?: string;

  @IsOptional()
  @IsString({
    message: 'El nombre de la cédencial adicional debe ser un string',
  })
  nombreCredencialAdicional?: string;

  @IsOptional()
  @IsString({ message: 'El numero de cédula adicional debe ser un string' })
  numeroCredencialAdicional?: string;

  @IsOptional()
  // @ValidateNested()
  @Type(() => LogotipoDto)
  firma?: LogotipoDto;

  @IsOptional()
  // @ValidateNested()
  @Type(() => LogotipoDto)
  firmaConAntefirma?: LogotipoDto;

  @IsMongoId({ message: 'El ID de "idUser" no es válido' })
  @IsNotEmpty({ message: 'El ID del usuario no puede estar vacío' })
  idUser: string;
  static firma: { data: string; contentType: string };
}
