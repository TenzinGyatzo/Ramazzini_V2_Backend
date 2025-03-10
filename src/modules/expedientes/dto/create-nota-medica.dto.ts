import { Type } from "class-transformer";
import { IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";


export class CreateNotaMedicaDto {

    @IsDate({ message: 'La fecha de la nota médica debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha de la nota médica no puede estar vacía' })
    fechaNotaMedica: Date;

    @IsString({ message: 'El motivo de consulta debe ser un string' })
    @IsNotEmpty({ message: 'El motivo de consulta no puede estar vacío' })
    motivoConsulta: string;

    @IsOptional()
    @IsString({ message: 'Los antecedentes deben ser un string' })
    antecedentes: string;

    @IsString({ message: 'La exploración física debe ser un string' })
    @IsNotEmpty({ message: 'La exploración física no puede estar vacía' })
    exploracionFisica: string;

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
    @Min(35)
    @Max(41)
    temperatura: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Min(80)
    @Max(100)
    saturacionOxigeno: number;

    @IsString({ message: 'El diagnóstico debe ser un string' })
    @IsNotEmpty({ message: 'El diagnóstico no puede estar vacío' })
    diagnostico: string;

    @IsString({ message: 'El tratamiento debe ser un string' })
    @IsNotEmpty({ message: 'El tratamiento no puede estar vacío' })
    tratamiento: string;

    @IsOptional()
    @IsString({ message: 'Las recomendaciones deben ser un string' })
    recomendaciones: string;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un string' })
    observaciones: string;

    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @IsString({ message: 'La ruta del PDF del informe debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF del informe no puede estar vacía' })
    rutaPDF: string;

    @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
    @IsNotEmpty({ message: 'El ID de "createdBy" no puede estar vacío' })
    createdBy: string;

    @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
    @IsNotEmpty({ message: 'El ID de "updatedBy" no puede estar vacío' })
    updatedBy: string;
}