import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

const tipoAptitud = [
  'Apto Sin Restricciones',
  'Apto Con Precaución',
  'Apto Con Restricciones',
  'No Apto',
  'Evaluación No Completada',
];

export class CreateAptitudDto {
  @ApiProperty({
    description: 'Fecha del informe de aptitud al puesto',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsDate({ message: 'La fecha del informe debe ser una fecha' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'La fecha del informe no puede estar vacía' })
  fechaAptitudPuesto: Date;

  // EVALUACIÓN ADICIONAL 1
  @ApiProperty({
    description: 'Nombre de evaluación adicional 1',
    example: 'Estudios de laboratorio',
  })
  @IsOptional()
  @IsString({ message: 'Evaluación adicional 1 debe ser un string' })
  evaluacionAdicional1: string;

  @ApiProperty({
    description: 'Fecha de evaluación adicional 1',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación adicional 1 debe ser una fecha' })
  @Type(() => Date)
  fechaEvaluacionAdicional1: Date;

  @ApiProperty({
    description: 'Resultados de evaluación adicional 1',
    example: 'Resultados dentro de parámetros normales',
  })
  @IsOptional()
  @IsString({
    message: 'Resultados de evaluación adicional 1 debe ser un string',
  })
  resultadosEvaluacionAdicional1: string;

  // EVALUACIÓN ADICIONAL 2
  @ApiProperty({
    description: 'Nombre de evaluación adicional 2',
    example: 'RX Simple de Tórax',
  })
  @IsOptional()
  @IsString({ message: 'Evaluación adicional 2 debe ser un string' })
  evaluacionAdicional2: string;

  @ApiProperty({
    description: 'Fecha de evaluación adicional 2',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación adicional 2 debe ser una fecha' })
  @Type(() => Date)
  fechaEvaluacionAdicional2: Date;

  @ApiProperty({
    description: 'Resultados de evaluación adicional 2',
    example: 'Tórax en PA dentro de límites normales',
  })
  @IsOptional()
  @IsString({
    message: 'Resultados de evaluación adicional 1 debe ser un string',
  })
  resultadosEvaluacionAdicional2: string;

  // EVALUACIÓN ADICIONAL 3
  @ApiProperty({
    description: 'Nombre de evaluación adicional 3',
    example: 'RX Columna lumbar',
  })
  @IsOptional()
  @IsString({ message: 'Evaluación adicional 3 debe ser un string' })
  evaluacionAdicional3: string;

  @ApiProperty({
    description: 'Fecha de evaluación adicional 3',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación adicional 3 debe ser una fecha' })
  @Type(() => Date)
  fechaEvaluacionAdicional3: Date;

  @ApiProperty({
    description: 'Resultados de evaluación adicional 3',
    example: 'Columna lumbar en PA y Lateral dentro de límites normales',
  })
  @IsOptional()
  @IsString({
    message: 'Resultados de evaluación adicional 3 debe ser un string',
  })
  resultadosEvaluacionAdicional3: string;

  // EVALUACIÓN ADICIONAL 4
  @ApiProperty({
    description: 'Nombre de evaluación adicional 4',
    example: 'Audiometría',
  })
  @IsOptional()
  @IsString({ message: 'Evaluación adicional 4 debe ser un string' })
  evaluacionAdicional4: string;

  @ApiProperty({
    description: 'Fecha de evaluación adicional 4',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación adicional 4 debe ser una fecha' })
  @Type(() => Date)
  fechaEvaluacionAdicional4: Date;

  @ApiProperty({
    description: 'Resultados de evaluación adicional 4',
    example: 'Audición normal bilateral con HBC de 11.0%',
  })
  @IsOptional()
  @IsString({
    message: 'Resultados de evaluación adicional 4 debe ser un string',
  })
  resultadosEvaluacionAdicional4: string;

  // EVALUACIÓN ADICIONAL 5
  @ApiProperty({
    description: 'Nombre de evaluación adicional 5',
    example: 'Espirometría',
  })
  @IsOptional()
  @IsString({ message: 'Evaluación adicional 5 debe ser un string' })
  evaluacionAdicional5: string;

  @ApiProperty({
    description: 'Fecha de evaluación adicional 5',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación adicional 5 debe ser una fecha' })
  @Type(() => Date)
  fechaEvaluacionAdicional5: Date;

  @ApiProperty({
    description: 'Resultados de evaluación adicional 5',
    example: 'Alteración ventilatoria de tipo no obstructivo, ligera',
  })
  @IsOptional()
  @IsString({
    message: 'Resultados de evaluación adicional 5 debe ser un string',
  })
  resultadosEvaluacionAdicional5: string;

  // EVALUACIÓN ADICIONAL 6
  @ApiProperty({
    description: 'Nombre de evaluación adicional 6',
    example: 'Tipo de Sangre',
  })
  @IsOptional()
  @IsString({ message: 'Evaluación adicional 6 debe ser un string' })
  evaluacionAdicional6: string;

  @ApiProperty({
    description: 'Fecha de evaluación adicional 6',
    example: '2024-10-25T07:00:00.000+00:00',
  })
  @IsOptional()
  @IsDate({ message: 'La fecha de evaluación adicional 6 debe ser una fecha' })
  @Type(() => Date)
  fechaEvaluacionAdicional6: Date;

  @ApiProperty({
    description: 'Resultados de evaluación adicional 6',
    example: '"A RH (+)"',
  })
  @IsOptional()
  @IsString({
    message: 'Resultados de evaluación adicional 6 debe ser un string',
  })
  resultadosEvaluacionAdicional6: string;

  // APTITUD
  @ApiProperty({
    description: 'Aptitud al puesto',
    enum: tipoAptitud,
    example: 'Apto Sin Restricciones',
  })
  @IsString({ message: 'Aptitud al puesto debe ser un string' })
  @IsNotEmpty({ message: 'Aptitud al puesto no puede estar vacía' })
  @IsEnum(tipoAptitud, {
    message:
      'El tipo de aptitud debe ser Apto Sin Restricciones, Apto con Precaución, Apto Con Restricciones, No Apto o Evaluación No Completada',
  })
  aptitudPuesto: string;

  @ApiProperty({
    description: 'Alteraciones de salud',
    example:
      'El trabajador presenta sobrepeso con índice de masa corporal (IMC) de 30.6. Tiene una circunferencia de cintura de 105 cm por lo que tiene un riesgo alto de desarrollar enfermedades cardiometabólicas. Presenta presión arterial alta (140/90 mm Hg). Agudezaa visual ligeramente reducida con uso de lentes y visión cromática normal. Se refiere asintomático. Se encuentra clínicamente sano.',
  })
  @IsString({ message: 'Alteraciones de salud debe ser un string' })
  alteracionesSalud: string;

  @ApiProperty({
    description: 'Resultados del exámen médico laboral',
    example:
      'Posterior a efectuar el examen integral de salud ocupacional, se determina que actualmente se encuentra CLÍNICAMENTE APTO CON PRECAUCIÓN PARA LABORAR en las actividades del puesto al que aspira. Cabe señalar que la determinación de la aptitud para el trabajo es solamente clínica, toda vez que no contamos con análisis de laboratorio en este momento.',
  })
  @IsString({ message: 'Resultados debe ser un string' })
  resultados: string;

  @ApiProperty({
    description: 'Medidas preventivas',
    example:
      'Es importante mantener hábitos saludables, como una alimentación balanceada, ejercicio regular y descanso adecuado. Es importante el uso de EPP adecuado, así como efectuar vigilancia médica con periodicidad anual, incluyendo exámenes generales de laboratorio y gabinete para una vigilancia integral de la salud.',
  })
  @IsString({ message: 'Medidas preventivas debe ser un string' })
  medidasPreventivas: string;

  @ApiProperty({
    description: 'El ID del trabajador',
    example: '671fe9cc00fcb5611b10686e',
  })
  @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
  @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
  idTrabajador: string;

  @ApiProperty({
    description: 'Ruta hacía el PDF del informe',
    example:
      'expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf',
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
