import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMongoId, IsOptional } from "class-validator";


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
      description: 'El Código Postal del centro de trabajo (4-10 dígitos)',
      example: '81200',
      required: false
    })
    @IsString({ message: 'El Código Postal debe ser un string' })
    @IsOptional()
    codigoPostal?: string
    
    @ApiProperty({
      description: 'Región/Provincia/Estado donde se encuentra el centro de trabajo',
      example: 'Sinaloa, Buenos Aires, São Paulo',
      required: false
    })
    @IsString({ message: 'El estado debe ser un string' })
    @IsOptional()
    estado?: string

    @ApiProperty({
      description: 'Ciudad/Municipio donde se encuentra el centro de trabajo',
      example: 'Ahome, Bogotá, Lima',
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
