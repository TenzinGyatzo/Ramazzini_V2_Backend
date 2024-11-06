import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

const categoriasIMC = [
    '',
    'Bajo peso',
    'Normal',
    'Sobrepeso',
    'Obesidad clase I',
    'Obesidad clase II',
    'Obesidad clase III',
  ];
  
  const categoriasCircunferenciaCintura = [
    '',
    'Bajo Riesgo',
    'Riesgo Aumentado',
    'Alto Riesgo',
  ];
  
  const categoriasTensionArterial = [
    '',
    'Óptima',
    'Normal',
    'Alta',
    'Hipertensión ligera',
    'Hipertensión moderada',
    'Hipertensión severa',
  ];
  
  const categoriasFrecuenciaCardiaca = [
    '',
    'Excelente',
    'Buena',
    'Normal',
    'Elevada',
    'Alta',
    'Muy alta',
  ];
  
  const categoriasFrecuenciaRespiratoria = [
    '',
    'Bradipnea',
    'Normal',
    'Taquipnea',
    'Hiperventilación',
  ];
  
  const categoriaSaturacionOxigeno = [
    '',
    'Normal',
    'Aceptable',
    'Moderadamente baja',
    'Hipoxemia leve',
    'Hipoxemia grave',
  ];

export class CreateExploracionFisicaDto {

    @ApiProperty({
        description: 'Fecha de la exploracion fisica',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha de la exploración fisica debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha de la exploración fisica no puede estar vacía' })
    fechaExploracionFisica: Date;

    // Somatometría
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
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
    
    @IsOptional()
    @IsEnum(categoriasIMC, { message: 'La categoria debe ser alguna de las siguientes: ' + categoriasIMC })
    categoriaIMC: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    circunferenciaCintura: number;

    @IsOptional()
    @IsEnum(categoriasCircunferenciaCintura, { message: 'La categoria debe ser alguna de las siguientes: ' + categoriasCircunferenciaCintura })
    categoriaCircunferenciaCintura: string;

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
    @IsEnum(categoriasTensionArterial)
    categoriaTensionArterial: string;

    @IsOptional()
    @Min(40)
    @Max(150)
    @IsNumber({ maxDecimalPlaces: 0 })
    frecuenciaCardiaca: number;

    @IsOptional()
    @IsEnum(categoriasFrecuenciaCardiaca, { message: 'La categoria debe ser alguna de las siguientes: ' + categoriasFrecuenciaCardiaca })
    categoriaFrecuenciaCardiaca: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(12)
    @Max(45)
    frecuenciaRespiratoria: number;

    @IsOptional()
    @IsEnum(categoriasFrecuenciaRespiratoria, { message: 'La categoria debe ser alguna de las siguientes: ' + categoriasFrecuenciaRespiratoria })
    categoriaFrecuenciaRespiratoria: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(80)
    @Max(100)
    saturacionOxigeno: number;

    @IsOptional()
    @IsEnum(categoriaSaturacionOxigeno, { message: 'La categoria debe ser alguna de las siguientes: ' + categoriaSaturacionOxigeno })
    categoriaSaturacionOxigeno: string;

    // Cabeza y Cuello
    @IsOptional()
    craneoCara: number;

    @IsOptional()
    ojos: number;

    @IsOptional()
    oidos: number;

    @IsOptional()
    nariz: number;

    @IsOptional()
    boca: number;

    @IsOptional()
    cuello: number;

    // Extremidades Superiores
    @IsOptional()
    hombros: number;

    @IsOptional()
    codos: number;

    @IsOptional()
    manos: number;

    @IsOptional()
    neurologicoESuperiores: string;

    @IsOptional()
    vascularESuperiores: string;

    // Tórax
    @IsOptional()
    torax: string;

    // Abdomen
    @IsOptional()
    abdomen: string;

    // Extremidades Inferiores
    @IsOptional()
    cadera: string;

    @IsOptional()
    rodillas: string;

    @IsOptional()
    tobillosPies: string;

    @IsOptional()
    neurologicoEInferiores: string;

    @IsOptional()
    vascularEInferiores: string;

    // Columna
    @IsOptional()
    inspeccionColumna: string;

    @IsOptional()
    movimientosColumna: string;

    // Piel
    @IsOptional()
    lesionesPiel: string;

    @IsOptional()
    cicatrices: string;

    @IsOptional()
    nevos: string;

    // Exploración Neurológica Complementaria
    @IsOptional()
    coordinacion: string;

    @IsOptional()
    sensibilidad: string;

    @IsOptional()
    equilibrio: string;

    @IsOptional()
    marcha: string;

    // Resumen de la exploración física
    @IsOptional()
    resumenExploracionFisica: string;

    // Trabajador, ruta al archivo e info de creador y actualizador
    @ApiProperty({
        description: 'El ID del trabajador',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @ApiProperty({
        description: 'Ruta hacía el PDF del informe',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del PDF del informe debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF del informe no puede estar vacía' })
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
