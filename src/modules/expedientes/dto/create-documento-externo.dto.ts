import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

const tiposDocumentos = [
    "Prueba(s) de laboratorio",
    "Estudio de Gabinete",
    "Imagenología",
    "Fotografía de prueba rápida",
    "Identificación",
    "Receta médica",
    "Formato específico",
    "Otro",
  ];
  
  const extensiones = [".pdf", ".jpeg", ".jpg", ".png"];

export class CreateDocumentoExternoDto {

    @ApiProperty({
        description: 'Tipo de documento',
        enum: tiposDocumentos,
        example: 'Prueba(s) de laboratorio'
    })
    @IsString({ message: 'El tipo de documento debe ser un string' })
    @IsNotEmpty({ message: 'El tipo de documento no puede estar vacío' })
    @IsEnum(tiposDocumentos, { message: 'El tipo de documento debe ser uno de los siguientes: ' + tiposDocumentos })
    tipoDocumento: string;

    @ApiProperty({
        description: 'Nombre del documento',
        example: 'Prueba de laboratorio'
    })
    @IsString({ message: 'El nombre del documento debe ser un string' })
    @IsNotEmpty({ message: 'El nombre del documento no puede estar vacío' })
    nombreDocumento: string;

    @ApiProperty({
        description: 'Fecha del documento externo',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha del documento externo debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha del informe no puede estar vacía' })
    fechaDocumento: Date;

    @ApiProperty({
        description: 'Notas del documento',
        example: '"A RH (+)"'
    })
    @IsString({ message: 'Las notas del documento debe ser un string' })
    @IsOptional()
    notasDocumento: string;

    @ApiProperty({
        description: 'Extensión del documento',
        enum: extensiones,
        example: '.pdf'
    })
    @IsString({ message: 'La extensión del documento debe ser un string' })
    @IsNotEmpty({ message: 'La extensión del documento no puede estar vacía' })
    @IsEnum(extensiones, { message: 'La extensión del documento debe ser uno de los siguientes: ' + extensiones })
    extension: string;

    @ApiProperty({
        description: 'El ID del trabajador',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @ApiProperty({
        description: 'Ruta hacía el documento externo',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del documento debe ser un string' })
    @IsNotEmpty({ message: 'La ruta deldocumento no puede estar vacía' })
    rutaDocumento: string;

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
    updatedBy: string;
}
