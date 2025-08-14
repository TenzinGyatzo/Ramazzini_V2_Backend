import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from "class-validator";

const sexos = ["Masculino", "Femenino"];

const nivelesEscolaridad = [
  "Primaria",
  "Secundaria",
  "Preparatoria",
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Nula",
];

const estadosCiviles = [
  "Soltero/a",
  "Casado/a",
  "Unión libre",
  "Separado/a",
  "Divorciado/a",
  "Viudo/a",
];

const estadosLaborales = ["Activo", "Inactivo"];

export class CreateTrabajadorDto {
    @ApiProperty({
      description: 'Primer apellido del trabajador',
      example: 'Varela'
    })
    @IsString({ message: 'El primer apellido debe ser un string' })
    @IsNotEmpty({ message: 'El primer apellido no puede estar vacío' })
    primerApellido: string;

    @ApiProperty({
      description: 'Segundo apellido del trabajador',
      example: 'Ruvalcaba'
    })
    @IsString({ message: 'El segundo apellido debe ser un string' })
    @IsNotEmpty({ message: 'El segundo apellido no puede estar vacío' })
    segundoApellido: string;

    @ApiProperty({
      description: 'Nombre completo del trabajador',
      example: 'Juan Enrique'
    })
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    nombre: string;

    @ApiProperty({
      description: 'Fecha de nacimiento del trabajador, sirve para calcular edad dinamicamente',
      example: '1980-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha de nacimiento debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha de nacimiento no puede estar vacía' })
    fechaNacimiento: Date;

    @ApiProperty({
      description: 'Sexo del trabajador',
      enum: sexos,
      example: 'Masculino'
    })
    @IsString({ message: 'El sexo debe ser un string' })
    @IsNotEmpty({ message: 'El sexo no puede estar vacío' })
    @IsEnum(sexos, { message: 'El sexo debe ser Masculino o Femenino' })
    sexo: string;

    @ApiProperty({
      description: 'Último nivel de estudios completado',
      enum: nivelesEscolaridad,
      example: 'Preparatoria'
    })
    @IsString({ message: 'La escolaridad debe ser un string' })
    @IsNotEmpty({ message: 'La escolaridad no puede estar vacía' })
    @IsEnum(nivelesEscolaridad, {
      message:
        'La escolaridad debe ser Primaria, Secundaria, Preparatoria, Licenciatura, Maestría, Doctorado o Nula',
    })
    escolaridad: string;

    @ApiProperty({
      description: 'Puesto actual o puesto al que aspira el trabajador',
      example: 'Maniobrista'
    })
    @IsString({ message: 'El puesto debe ser un string' })
    @IsNotEmpty({ message: 'El puesto no puede estar vacío' })
    puesto: string;

    @ApiProperty({
      description: 'Fecha de ingreso al trabajo, sirve para calcular antigüedad dinamicamente',
      example: '2023-10-01T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha de ingreso debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha de ingreso no puede estar vacía' })
    fechaIngreso: Date;

    @ApiProperty({
      description: 'Número de teléfono del trabajador (opcional)',
      example: '6681078205',
      required: false, // Esto indica que es opcional en la documentación de Swagger
    })
    @IsOptional() // Indica que el campo es opcional
    @IsString({ message: 'El teléfono debe ser un string' })
    @Matches(/^$|^[0-9]{10}$/, { message: 'El teléfono debe estar vacío o tener 10 dígitos' })
    telefono?: string; // El operador `?` también indica que es opcional en TypeScript
    

    @ApiProperty({
      description: 'Estado Civil del trabajador',
      enum: estadosCiviles,
      example: 'Casado/a'
    })
    @IsString({ message: 'El estado civil debe ser un string' })
    @IsNotEmpty({ message: 'El estado civil no puede estar vacío' })
    @IsEnum(estadosCiviles, { message: 'El estado civil debe ser Soltero/a, Casado/a, Unión libre, Separado/a, Divorciado/a o Viudo/a' })
    estadoCivil: string;

    @ApiProperty({
      description: 'Número de empleado del trabajador (opcional, máximo 7 dígitos)',
      example: '1234567',
      required: false
    })
    @IsOptional()
    @IsString({ message: 'El número de empleado debe ser un string' })
    // @Matches(/^[0-9]{1,7}$/, { message: 'El número de empleado debe contener solo números y tener entre 1 y 7 dígitos' })
    numeroEmpleado?: string;

    @ApiProperty({
      description: 'Número de seguro social del trabajador (opcional, máximo 7 dígitos)',
      example: '1234567',
      required: false
    })
    @IsOptional()
    @IsString({ message: 'El número de seguro social debe ser un string' })
    // @Matches(/^[0-9]{11}$/, { message: 'El número de seguro social debe contener 11 dígitos' })
    nss?: string;

    // Agentes de Riesgo
    @IsOptional()
    @IsString({ each: true, message: 'Cada agente de riesgo debe ser un string' })
    agentesRiesgoActuales: string[];

    @ApiProperty({
      description: 'Estado laboral del trabajador',
      example: 'Activo'
    })
    @IsString({ message: 'El estado laboral debe ser un string' })
    @IsNotEmpty({ message: 'El estado laboral no puede estar vacío' })
    estadoLaboral: string;

    @ApiProperty({
      description: 'El ID del centro de trabajo al que pertenece el trabajador',
      example: '60d9f70fc39b3c1b8f0d6c0a'
    })
    @IsMongoId({ message: 'El id del centro de trabajo debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del centro de trabajo no puede estar vacío' })
    idCentroTrabajo: string;

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
