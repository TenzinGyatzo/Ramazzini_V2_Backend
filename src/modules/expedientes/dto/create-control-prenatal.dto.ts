import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';

export class CreateControlPrenatalDto {
  @ApiProperty({
    description: 'Fecha de inicio del control prenatal',
    example: '1980-10-25T07:00:00.000+00:00',
  })
  @IsDate({
    message: 'La fecha de inicio del control prenatal debe ser una fecha',
  })
  @Type(() => Date)
  @IsNotEmpty({
    message: 'La fecha de inicio del control prenatal no puede estar vacía',
  })
  fechaInicioControlPrenatal: Date;

  @ApiProperty({
    description: 'Altura en metros',
    example: 1.7,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Altura debe ser un número' })
  altura?: number;

  @ApiProperty({
    description: 'Edad de la primera menstruación',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'Edad de la primera menstruación debe ser un número' },
  )
  menarca?: number;

  @ApiProperty({
    description: 'Características del ciclo menstrual',
    example: '28x4', // 28 días de duración y 4 días de sangrado
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'Características del ciclo menstrual debe ser un string',
  })
  ciclos?: string;

  @ApiProperty({
    description: 'Inicio de Vida Sexual Activa (edad)',
    example: 18,
    required: false,
  })
  @IsOptional()
  @IsNumber(
    {},
    { message: 'Inicio de Vida Sexual Activa (edad) debe ser un número' },
  )
  ivsa?: number;

  @ApiProperty({
    description: 'Número total de embarazos',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Número total de embarazos debe ser un número' })
  gestas?: number;

  @ApiProperty({
    description: 'Número de partos vaginales',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Número de partos vaginales debe ser un número' })
  partos?: number;

  @ApiProperty({
    description: 'Número de cesáreas',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Número de cesáreas debe ser un número' })
  cesareas?: number;

  @ApiProperty({
    description: 'Número de abortos',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Número de abortos debe ser un número' })
  abortos?: number;

  @ApiProperty({
    description: 'Fecha de Última Menstruación',
    example: '1980-10-25T07:00:00.000+00:00',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Fecha de Última Menstruación debe ser una fecha' })
  @Type(() => Date)
  fum?: Date;

  @ApiProperty({
    description: 'Fecha Probable de Parto',
    example: '1981-07-25T07:00:00.000+00:00',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Fecha Probable de Parto debe ser una fecha' })
  @Type(() => Date)
  fpp?: Date;

  @ApiProperty({
    description: 'Método de Planificación Familiar',
    example: 'Condón',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Método de Planificación Familiar debe ser un string' })
  metodoPlanificacionFamiliar?: string;

  // Seguimiento mensual - Enero
  @ApiProperty({ description: 'Fecha del control de enero', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de enero debe ser una fecha' })
  @Type(() => Date)
  eneroFecha?: Date | null;

  @ApiProperty({ description: 'Peso en enero (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de enero debe ser un número' })
  eneroPeso?: number;

  @ApiProperty({ description: 'IMC en enero', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de enero debe ser un número' })
  eneroImc?: number;

  @ApiProperty({ description: 'Tensión arterial en enero', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de enero debe ser un string' })
  eneroTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en enero',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de enero debe ser un número' })
  eneroFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en enero',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de enero debe ser un número' })
  eneroSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en enero (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de enero debe ser un número' })
  eneroFondoUterino?: number;

  // Seguimiento mensual - Febrero
  @ApiProperty({ description: 'Fecha del control de febrero', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de febrero debe ser una fecha' })
  @Type(() => Date)
  febreroFecha?: Date | null;

  @ApiProperty({ description: 'Peso en febrero (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de febrero debe ser un número' })
  febreroPeso?: number;

  @ApiProperty({ description: 'IMC en febrero', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de febrero debe ser un número' })
  febreroImc?: number;

  @ApiProperty({ description: 'Tensión arterial en febrero', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de febrero debe ser un string' })
  febreroTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en febrero',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de febrero debe ser un número' })
  febreroFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en febrero',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de febrero debe ser un número' })
  febreroSdg?: number;

  @ApiProperty({
    description: 'Fondo uterino en febrero (cm)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de febrero debe ser un número' })
  febreroFondoUterino?: number;

  // Seguimiento mensual - Marzo
  @ApiProperty({ description: 'Fecha del control de marzo', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de marzo debe ser una fecha' })
  @Type(() => Date)
  marzoFecha?: Date | null;

  @ApiProperty({ description: 'Peso en marzo (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de marzo debe ser un número' })
  marzoPeso?: number;

  @ApiProperty({ description: 'IMC en marzo', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de marzo debe ser un número' })
  marzoImc?: number;

  @ApiProperty({ description: 'Tensión arterial en marzo', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de marzo debe ser un string' })
  marzoTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en marzo',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de marzo debe ser un número' })
  marzoFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en marzo',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de marzo debe ser un número' })
  marzoSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en marzo (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de marzo debe ser un número' })
  marzoFondoUterino?: number;

  // Seguimiento mensual - Abril
  @ApiProperty({ description: 'Fecha del control de abril', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de abril debe ser una fecha' })
  @Type(() => Date)
  abrilFecha?: Date | null;

  @ApiProperty({ description: 'Peso en abril (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de abril debe ser un número' })
  abrilPeso?: number;

  @ApiProperty({ description: 'IMC en abril', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de abril debe ser un número' })
  abrilImc?: number;

  @ApiProperty({ description: 'Tensión arterial en abril', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de abril debe ser un string' })
  abrilTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en abril',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de abril debe ser un número' })
  abrilFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en abril',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de abril debe ser un número' })
  abrilSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en abril (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de abril debe ser un número' })
  abrilFondoUterino?: number;

  // Seguimiento mensual - Mayo
  @ApiProperty({ description: 'Fecha del control de mayo', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de mayo debe ser una fecha' })
  @Type(() => Date)
  mayoFecha?: Date | null;

  @ApiProperty({ description: 'Peso en mayo (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de mayo debe ser un número' })
  mayoPeso?: number;

  @ApiProperty({ description: 'IMC en mayo', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de mayo debe ser un número' })
  mayoImc?: number;

  @ApiProperty({ description: 'Tensión arterial en mayo', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de mayo debe ser un string' })
  mayoTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en mayo',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de mayo debe ser un número' })
  mayoFcf?: number;

  @ApiProperty({ description: 'Semanas de gestación en mayo', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de mayo debe ser un número' })
  mayoSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en mayo (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de mayo debe ser un número' })
  mayoFondoUterino?: number;

  // Seguimiento mensual - Junio
  @ApiProperty({ description: 'Fecha del control de junio', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de junio debe ser una fecha' })
  @Type(() => Date)
  junioFecha?: Date | null;

  @ApiProperty({ description: 'Peso en junio (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de junio debe ser un número' })
  junioPeso?: number;

  @ApiProperty({ description: 'IMC en junio', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de junio debe ser un número' })
  junioImc?: number;

  @ApiProperty({ description: 'Tensión arterial en junio', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de junio debe ser un string' })
  junioTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en junio',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de junio debe ser un número' })
  junioFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en junio',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de junio debe ser un número' })
  junioSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en junio (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de junio debe ser un número' })
  junioFondoUterino?: number;

  // Seguimiento mensual - Julio
  @ApiProperty({ description: 'Fecha del control de julio', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de julio debe ser una fecha' })
  @Type(() => Date)
  julioFecha?: Date | null;

  @ApiProperty({ description: 'Peso en julio (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de julio debe ser un número' })
  julioPeso?: number;

  @ApiProperty({ description: 'IMC en julio', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de julio debe ser un número' })
  julioImc?: number;

  @ApiProperty({ description: 'Tensión arterial en julio', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de julio debe ser un string' })
  julioTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en julio',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de julio debe ser un número' })
  julioFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en julio',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de julio debe ser un número' })
  julioSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en julio (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de julio debe ser un número' })
  julioFondoUterino?: number;

  // Seguimiento mensual - Agosto
  @ApiProperty({ description: 'Fecha del control de agosto', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de agosto debe ser una fecha' })
  @Type(() => Date)
  agostoFecha?: Date | null;

  @ApiProperty({ description: 'Peso en agosto (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de agosto debe ser un número' })
  agostoPeso?: number;

  @ApiProperty({ description: 'IMC en agosto', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de agosto debe ser un número' })
  agostoImc?: number;

  @ApiProperty({ description: 'Tensión arterial en agosto', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de agosto debe ser un string' })
  agostoTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en agosto',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de agosto debe ser un número' })
  agostoFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en agosto',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de agosto debe ser un número' })
  agostoSdg?: number;

  @ApiProperty({ description: 'Fondo uterino en agosto (cm)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de agosto debe ser un número' })
  agostoFondoUterino?: number;

  // Seguimiento mensual - Septiembre
  @ApiProperty({
    description: 'Fecha del control de septiembre',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Fecha de septiembre debe ser una fecha' })
  @Type(() => Date)
  septiembreFecha?: Date | null;

  @ApiProperty({ description: 'Peso en septiembre (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de septiembre debe ser un número' })
  septiembrePeso?: number;

  @ApiProperty({ description: 'IMC en septiembre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de septiembre debe ser un número' })
  septiembreImc?: number;

  @ApiProperty({
    description: 'Tensión arterial en septiembre',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de septiembre debe ser un string' })
  septiembreTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en septiembre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de septiembre debe ser un número' })
  septiembreFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en septiembre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de septiembre debe ser un número' })
  septiembreSdg?: number;

  @ApiProperty({
    description: 'Fondo uterino en septiembre (cm)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de septiembre debe ser un número' })
  septiembreFondoUterino?: number;

  // Seguimiento mensual - Octubre
  @ApiProperty({ description: 'Fecha del control de octubre', required: false })
  @IsOptional()
  @IsDate({ message: 'Fecha de octubre debe ser una fecha' })
  @Type(() => Date)
  octubreFecha?: Date | null;

  @ApiProperty({ description: 'Peso en octubre (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de octubre debe ser un número' })
  octubrePeso?: number;

  @ApiProperty({ description: 'IMC en octubre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de octubre debe ser un número' })
  octubreImc?: number;

  @ApiProperty({ description: 'Tensión arterial en octubre', required: false })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de octubre debe ser un string' })
  octubreTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en octubre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de octubre debe ser un número' })
  octubreFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en octubre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de octubre debe ser un número' })
  octubreSdg?: number;

  @ApiProperty({
    description: 'Fondo uterino en octubre (cm)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de octubre debe ser un número' })
  octubreFondoUterino?: number;

  // Seguimiento mensual - Noviembre
  @ApiProperty({
    description: 'Fecha del control de noviembre',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Fecha de noviembre debe ser una fecha' })
  @Type(() => Date)
  noviembreFecha?: Date | null;

  @ApiProperty({ description: 'Peso en noviembre (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de noviembre debe ser un número' })
  noviembrePeso?: number;

  @ApiProperty({ description: 'IMC en noviembre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de noviembre debe ser un número' })
  noviembreImc?: number;

  @ApiProperty({
    description: 'Tensión arterial en noviembre',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de noviembre debe ser un string' })
  noviembreTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en noviembre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de noviembre debe ser un número' })
  noviembreFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en noviembre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de noviembre debe ser un número' })
  noviembreSdg?: number;

  @ApiProperty({
    description: 'Fondo uterino en noviembre (cm)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de noviembre debe ser un número' })
  noviembreFondoUterino?: number;

  // Seguimiento mensual - Diciembre
  @ApiProperty({
    description: 'Fecha del control de diciembre',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Fecha de diciembre debe ser una fecha' })
  @Type(() => Date)
  diciembreFecha?: Date | null;

  @ApiProperty({ description: 'Peso en diciembre (kg)', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'Peso de diciembre debe ser un número' })
  diciembrePeso?: number;

  @ApiProperty({ description: 'IMC en diciembre', required: false })
  @IsOptional()
  @IsNumber({}, { message: 'IMC de diciembre debe ser un número' })
  diciembreImc?: number;

  @ApiProperty({
    description: 'Tensión arterial en diciembre',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Tensión arterial de diciembre debe ser un string' })
  diciembreTia?: string;

  @ApiProperty({
    description: 'Frecuencia cardíaca fetal en diciembre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'FCF de diciembre debe ser un número' })
  diciembreFcf?: number;

  @ApiProperty({
    description: 'Semanas de gestación en diciembre',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'SDG de diciembre debe ser un número' })
  diciembreSdg?: number;

  @ApiProperty({
    description: 'Fondo uterino en diciembre (cm)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Fondo uterino de diciembre debe ser un número' })
  diciembreFondoUterino?: number;

  // Observaciones por métrica (evolución a lo largo del tiempo)
  @ApiProperty({
    description:
      'Observaciones sobre la evolución del peso a lo largo del tiempo',
    example: 'Ganancia de peso adecuada, dentro de los parámetros normales',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observaciones del peso debe ser un string' })
  observacionesPeso?: string;

  @ApiProperty({
    description:
      'Observaciones sobre la evolución del IMC a lo largo del tiempo',
    example: 'IMC se mantiene estable, sin cambios significativos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observaciones del IMC debe ser un string' })
  observacionesImc?: string;

  @ApiProperty({
    description:
      'Observaciones sobre la evolución de la tensión arterial a lo largo del tiempo',
    example: 'Tensión arterial controlada, sin signos de preeclampsia',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'Observaciones de la tensión arterial debe ser un string',
  })
  observacionesTia?: string;

  @ApiProperty({
    description:
      'Observaciones sobre la evolución de la frecuencia cardíaca fetal a lo largo del tiempo',
    example: 'FCF normal y estable, sin arritmias detectadas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observaciones de la FCF debe ser un string' })
  observacionesFcf?: string;

  @ApiProperty({
    description:
      'Observaciones sobre la evolución de las semanas de gestación a lo largo del tiempo',
    example: 'Desarrollo gestacional normal, sin retrasos detectados',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observaciones de las SDG debe ser un string' })
  observacionesSdg?: string;

  @ApiProperty({
    description:
      'Observaciones sobre la evolución del fondo uterino a lo largo del tiempo',
    example: 'Crecimiento uterino adecuado, corresponde a la edad gestacional',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observaciones del fondo uterino debe ser un string' })
  observacionesFondoUterino?: string;

  @ApiProperty({
    description: 'El ID del trabajador',
    example: '671fe9cc00fcb5611b10686e',
  })
  @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
  @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
  idTrabajador: string;

  @ApiProperty({
    description: 'Ruta hacía el PDF del control prenatal',
    example: 'expedientes-medicos/Control Prenatal/Juan Pérez López.pdf',
    required: false,
  })
  @IsOptional()
  @IsString({
    message: 'La ruta del PDF del control prenatal debe ser un string',
  })
  rutaPDF?: string;

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
