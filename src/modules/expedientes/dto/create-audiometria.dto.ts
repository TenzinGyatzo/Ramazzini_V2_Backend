import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, Validate } from "class-validator";
import { IsValidAudiometryValueConstraint } from "../validators/audiometry.validator";

export class CreateAudiometriaDto {

    @IsDate({ message: 'La fecha de la audiometría debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha de la audiometría no puede estar vacía' })
    fechaAudiometria: Date;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 125 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho125?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 250 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho250?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 500 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho500?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 1000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho1000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 2000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho2000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 3000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho3000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 4000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho4000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 6000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho6000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído derecho a 8000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoDerecho8000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 3 })
    porcentajePerdidaOD?: number;
    
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 125 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo125?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 250 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo250?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 500 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo500?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 1000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo1000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 2000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo2000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 3000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo3000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 4000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo4000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 6000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo6000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 0 })
    @Validate(IsValidAudiometryValueConstraint, { message: 'El nivel escucha en decibeles del oído izquierdo a 8000 Hz debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110' })
    oidoIzquierdo8000?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 3 })
    porcentajePerdidaOI?: number;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 3 })
    hipoacusiaBilateralCombinada?: number;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un string' })
    observacionesAudiometria?: string;

    @IsOptional()
    @IsString({ message: 'La interpretación debe ser un string' })
    interpretacionAudiometrica?: string;

    @IsOptional()
    @IsString({ message: 'El diagnóstico de la audiometría debe ser un string' })
    diagnosticoAudiometria?: string;

    @IsOptional()
    @IsString({ each: true, message: 'Cada recomendación debe ser un string' })
    recomendacionesAudiometria?: string[];

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