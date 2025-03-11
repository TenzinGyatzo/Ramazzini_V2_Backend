import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, Matches, IsMongoId, IsOptional } from "class-validator";

const estadosDeMexico = [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Chiapas",
    "Chihuahua",
    "Coahuila",
    "Colima",
    "Durango",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Estado de México",
    "Michoacán",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas",
  ];

export class CreateCentrosTrabajoDto {
    @ApiProperty({
      description: 'Nombre del centro de trabajo',
      example: 'Bodega Topolobampo'
    })
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    nombreCentro: string

    @ApiProperty({
      description: 'Dirección del centro de trabajo',
      example: 'Calle SinNombre #123',
      required: false
    })
    @IsString({ message: 'La dirección debe ser un string' })
    @IsOptional()
    direccionCentro?: string

    @ApiProperty({
      description: 'El Código Postal del centro de trabajo, con un formato válido de 5 dígitos',
      example: '81200',
      required: false
    })
    @IsString({ message: 'El Código Postal debe ser un string' })
    @IsOptional()
    // @Matches(/^[0-9]{5}$/, { message: 'El Código Postal debe de tener un formato válido' })
    codigoPostal?: string
    
    @ApiProperty({
      description: 'El estado donde se encuentra el centro de trabajo',
      enum: estadosDeMexico,
      example: 'Sinaloa',
      required: false
    })
    @IsString({ message: 'El estado debe ser un string' })
    @IsOptional()
    // @IsEnum(estadosDeMexico, { message: 'El estado no es válido' })
    estado?: string

    @ApiProperty({
      description: 'El municipio donde se encuentra el centro de trabajo',
      example: 'Ahome',
      required: false
    })
    @IsString({ message: 'El municipio debe ser un string' })
    @IsOptional()
    municipio?: string

    @ApiProperty({
      description: 'El ID de la empresa a la cual pertenece el centro de trabajo',
      example: '60d9f70fc39b3c1b8f0d6c0a',
    })
    @IsMongoId({ message: 'El ID de "idEmpresa" no es válido' })
    @IsNotEmpty({ message: 'El ID de la empresa no puede estar vacío' })
    idEmpresa: string

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
    updatedBy: string
}
