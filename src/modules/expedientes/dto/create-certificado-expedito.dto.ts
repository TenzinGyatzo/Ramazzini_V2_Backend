import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

  const gradosSalud = [
    'Óptimo',
    'Bueno',
    'Regular',
    'Malo'
  ]

  const tipoAptitud = [
    "Apto Sin Restricciones",
    "Apto Con Precaución",
    "Apto Con Restricciones",
    "No Apto",
    "Evaluación No Completada",
  ];

export class CreateCertificadoExpeditoDto {

    @ApiProperty({
        description: 'Fecha del certificado médico',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha del certificado debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha del certificado no puede estar vacía' })
    fechaCertificadoExpedito: Date;

    @ApiProperty({
        description: 'Cuerpo del certificado',
    })
    @IsString({ message: 'Cuerpo del certificado debe ser un string' })
    @IsNotEmpty({ message: 'Cuerpo del certificado no puede estar vacío' })
    cuerpoCertificado: string;

    @ApiProperty({
        description: 'Impedimentos Físicos',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsString({ message: 'Impedimentos Físicos debe ser un string' })
    @IsOptional({ message: 'Impedimentos Físicos puede estar vacío' })
    impedimentosFisicos: string;

    // Somatometría
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 1 })
    @Min(45)
    @Max(200)
    peso: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1.40)
    @Max(2.20)
    altura: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    indiceMasaCorporal: number;

    // Signos Vitales
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(60)
    @Max(200)
    tensionArterialSistolica: number;

    @IsOptional()
    @Min(40)
    @Max(150)
    @IsNumber({ maxDecimalPlaces: 0 })
    tensionArterialDiastolica: number;

    @IsOptional()
    @Min(40)
    @Max(150)
    @IsNumber({ maxDecimalPlaces: 0 })
    frecuenciaCardiaca: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(12)
    @Max(45)
    frecuenciaRespiratoria: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 1 })
    @Min(35.0)
    @Max(40.0)
    temperaturaCorporal: number;

    // Conclusión
    @IsOptional()
    @IsEnum(gradosSalud, { message: 'El grado de salud debe ser alguna de las siguientes: ' + gradosSalud })
    gradoSalud: string;

    @IsOptional()
    @IsEnum(tipoAptitud, { message: 'El tipo de aptitud debe ser alguna de las siguientes: ' + tipoAptitud })
    aptitudPuesto: string;

    @IsOptional()
    @IsString()
    descripcionSobreAptitud: string;

    @IsOptional()
    @IsString()
    observaciones: string;

    @ApiProperty({
        description: 'El ID del trabajador',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @ApiProperty({
        description: 'Ruta hacía el PDF del certificado',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del PDF del certificado debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF del certificado no puede estar vacía' })
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
