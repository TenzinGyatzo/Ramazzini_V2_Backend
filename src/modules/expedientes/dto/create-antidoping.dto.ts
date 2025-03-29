import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";


const resultado = ["Positivo", "Negativo"];

export class CreateAntidopingDto {

    @ApiProperty({
        description: 'Fecha del antidoping',
        example: '1980-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha del antidoping debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha del antidoping no puede estar vacía' })
    fechaAntidoping: Date;

    @ApiProperty({
        description: 'Resultado de marihuana',
        enum: resultado,
        example: 'Positivo'
    })
    @IsString({ message: 'Marihuana debe ser un string' })
    @IsNotEmpty({ message: 'Marihuana no puede estar vacía' })
    @IsEnum(resultado, { message: 'El resultado de marihuana debe ser Positivo o Negativo' })
    marihuana: string;

    @ApiProperty({
        description: 'Resultado de cocaina',
        enum: resultado,
        example: 'Negativo'
    })
    @IsString({ message: 'Cocaina debe ser un string' })
    @IsNotEmpty({ message: 'Cocaina no puede estar vacía' })
    @IsEnum(resultado, { message: 'El resultado de cocaína debe ser Positivo o Negativo' })
    cocaina: string;

    @ApiProperty({
        description: 'Resultado de anfetaminas',
        enum: resultado,
        example: 'Negativo'
    })
    @IsString({ message: 'Anfetaminas debe ser un string' })
    @IsNotEmpty({ message: 'Anfetaminas no puede estar vacía' })    
    @IsEnum(resultado, { message: 'El resultado de anfetaminas debe ser Positivo o Negativo' })
    anfetaminas: string;

    @ApiProperty({
        description: 'Resultado de metanfetaminas',
        enum: resultado,
        example: 'Negativo'
    })
    @IsString({ message: 'Metanfetaminas debe ser un string' })
    @IsNotEmpty({ message: 'Metanfetaminas no puede estar vacía' })
    @IsEnum(resultado, { message: 'El resultado de metanfetaminas debe ser Positivo o Negativo' })
    metanfetaminas: string;

    @ApiProperty({
        description: 'Resultado de opiaceos',
        enum: resultado,
        example: 'Negativo'
    })
    @IsString({ message: 'Opiaceos debe ser un string' })
    @IsNotEmpty({ message: 'Opiaceos no puede estar vacía' })
    @IsEnum(resultado, { message: 'El resultado de opiaceos debe ser Positivo o Negativo' })
    opiaceos: string;


    @IsOptional()
    @IsString({ message: 'Benzodiacepinas debe ser un string' })
    @IsEnum(resultado, { message: 'El resultado de benzodiacepinas debe ser Positivo o Negativo' })
    benzodiacepinas?: string;

    @IsOptional()
    @IsString({ message: 'fenciclidina debe ser un string' })
    @IsEnum(resultado, { message: 'El resultado de fenciclidina debe ser Positivo o Negativo' })
    fenciclidina?: string;

    @IsOptional()
    @IsString({ message: 'metadona debe ser un string' })
    @IsEnum(resultado, { message: 'El resultado de metadona debe ser Positivo o Negativo' })
    metadona?: string;

    @IsOptional()
    @IsString({ message: 'barbituricos debe ser un string' })
    @IsEnum(resultado, { message: 'El resultado de barbituricos debe ser Positivo o Negativo' })
    barbituricos?: string;

    @IsOptional()
    @IsString({ message: 'antidepresivosTriciclicos debe ser un string' })
    @IsEnum(resultado, { message: 'El resultado de antidepresivosTriciclicos debe ser Positivo o Negativo' })
    antidepresivosTriciclicos?: string;

    @ApiProperty({
        description: 'El ID del trabajador',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @ApiProperty({
        description: 'Ruta hacía el PDF del antidoping',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del PDF del antidoping debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF del antidoping no puede estar vacía' })
    rutaPDF: string;

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
