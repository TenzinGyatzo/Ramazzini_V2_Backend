import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Max, Min } from "class-validator";

const tiposDeRiesgo = ['Accidente de Trabajo', 'Accidente de Trayecto', 'Enfermedad de Trabajo'];

const siNO = ['Si', 'No'];

const tiposManejo = ['IMSS', 'Interno'];

const tipoAlta = ['Alta Interna', 'Alta ST2', 'Incapacidad Activa'];

export class CreateRiesgosTrabajoDto {

    @IsDate({ message: 'La fecha del riesgo de trabajo debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha del riesgo de trabajo no puede estar vacía' })
    fechaRiesgo: Date;

    @IsOptional()
    @IsString({ message: 'La recaída debe ser una cadena de texto' })
    @IsEnum(siNO, { message: `La recaída debe ser uno de los siguientes: ${siNO.join(', ')}` })
    recaida?: string;

    @IsOptional()
    @IsString({ message: 'El NSS debe ser una cadena de texto' })
    @Length(11, 11, { message: 'El NSS debe tener exactamente 11 caracteres' })
    NSS?: string;

    @IsOptional()
    @IsString({ message: 'El tipo de riesgo debe ser una cadena de texto' })
    @IsEnum(tiposDeRiesgo, { message: `El tipo de riesgo debe ser uno de los siguientes: ${tiposDeRiesgo.join(', ')}` })
    tipoRiesgo?: string;

    @IsOptional()
    @IsString({ message: 'La naturaleza de la lesión debe ser una cadena de texto' })
    naturalezaLesion?: string;

    @IsOptional()
    @IsString({ message: 'La parte del cuerpo afectada debe ser una cadena de texto' })
    parteCuerpoAfectada?: string;

    @IsOptional()
    @IsString({ message: 'El manejo debe ser una cadena de texto' })
    @IsEnum(tiposManejo, { message: `El manejo debe ser uno de los siguientes: ${tiposManejo.join(', ')}` })
    manejo?: string;

    @IsOptional()
    @IsString({ message: 'El tipo de alta debe ser una cadena de texto' })
    @IsEnum(tipoAlta, { message: `El tipo de alta debe ser uno de los siguientes: ${tipoAlta.join(', ')}` })
    alta?: string;

    @IsOptional()
    @IsDate({ message: 'La fecha de alta debe ser una fecha' })
    @Type(() => Date)
    fechaAlta?: Date;

    @IsOptional()
    @IsNumber({}, { message: 'Los días de incapacidad deben ser un número entero' })
    @Min(0, { message: 'Los días de incapacidad deben ser mayor o igual a 0' })
    @Type(() => Number)
    @IsInt({ message: 'Los días de incapacidad deben ser un número entero' })
    diasIncapacidad?: number;
    
    @IsOptional()
    @IsString({ message: 'Las secuelas deben ser una cadena de texto' })
    @IsEnum(siNO, { message: `Las secuelas deben ser uno de los siguientes: ${siNO.join(', ')}` })
    secuelas?: string;
    
    @IsOptional()
    @IsNumber({}, { message: 'El porcentaje de IPP debe ser un número' })
    @Type(() => Number)
    @Min(0, { message: 'El porcentaje de IPP debe ser mayor o igual a 0' })
    @Max(100, { message: 'El porcentaje de IPP debe ser menor o igual a 100' })
    @IsInt({ message: 'El porcentaje IPP deben ser un número entero' })
    porcentajeIPP?: number;

    @IsOptional()
    @IsString({ message: 'Las notas deben ser una cadena de texto' })
    notas?: string;

    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @IsMongoId({ message: 'El ID de "createdBy" no es válido' })
    @IsNotEmpty({ message: 'El ID de "createdBy" no puede estar vacío' })
    createdBy: string;

    @IsMongoId({ message: 'El ID de "updatedBy" no es válido' })
    @IsNotEmpty({ message: 'El ID de "updatedBy" no puede estar vacío' })
    updatedBy: string;
}