import { IsEnum, IsNotEmpty, IsString, Matches, IsMongoId } from "class-validator";

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
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    nombreCentro: string

    @IsString({ message: 'La dirección debe ser un string' })
    @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
    direccionCentro: string

    @IsString({ message: 'El Código Postal debe ser un string' })
    @IsNotEmpty({ message: 'El Código Postal no puede estar vacío' })
    @Matches(/^[0-9]{5}$/, { message: 'El Código Postal debe de tener un formato válido' })
    codigoPostal: string

    @IsString({ message: 'El estado debe ser un string' })
    @IsNotEmpty({ message: 'El estado no puede estar vacío' })
    @IsEnum(estadosDeMexico, { message: 'El estado no es válido' })
    estado: string

    @IsString({ message: 'El municipio debe ser un string' })
    @IsNotEmpty({ message: 'El municipio no puede estar vacío' })
    municipio: string

    @IsMongoId({ message: 'El ID de "idEmpresa" no es válido' })
    idEmpresa: string

    @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
    createdBy: string

    @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
    updatedBy: string
}
