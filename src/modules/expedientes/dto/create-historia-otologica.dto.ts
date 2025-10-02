import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

const siONo = ["Si", "No"];

const proteccionAuditivaOpciones = ["Siempre", "A veces", "Nunca"];

const otoscopiaOpciones = ["Permeable", "No permeable"];

const tiempoExposicionOpciones = [
  "Menos de 1 año",
  "1 - 5 años", 
  "6 - 10 años",
  "11 - 15 años",
  "16 - 20 años",
  "Más de 20 años"
];

const resultadoCuestionarioOpciones = ["Procedente", "Procedente con precaución", "No procedente"];

export class CreateHistoriaOtologicaDto {

    @ApiProperty({
        description: 'Fecha de la historia otológica',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha de la historia otológica debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha de la historia otológica no puede estar vacía' })
    fechaHistoriaOtologica: Date;

    // Síntomas recientes (últimos 2 meses)
    @ApiProperty({
        description: 'Dolor de oído',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El dolor de oído debe ser un string' })
    @IsNotEmpty({ message: 'El dolor de oído no puede estar vacío' })
    @IsEnum(siONo, { message: 'El dolor de oído debe ser uno de los siguientes: ' + siONo })
    dolorOido: string

    @ApiProperty({
        description: 'Supuración de oído',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La supuración de oído debe ser un string' })
    @IsNotEmpty({ message: 'La supuración de oído no puede estar vacía' })
    @IsEnum(siONo, { message: 'La supuración de oído debe ser uno de los siguientes: ' + siONo })
    supuracionOido: string

    @ApiProperty({
        description: 'Mareo o vértigo',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El mareo o vértigo debe ser un string' })
    @IsNotEmpty({ message: 'El mareo o vértigo no puede estar vacío' })
    @IsEnum(siONo, { message: 'El mareo o vértigo debe ser uno de los siguientes: ' + siONo })
    mareoVertigo: string

    @ApiProperty({
        description: 'Zumbido (tinnitus)',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El zumbido (tinnitus) debe ser un string' })
    @IsNotEmpty({ message: 'El zumbido (tinnitus) no puede estar vacío' })
    @IsEnum(siONo, { message: 'El zumbido (tinnitus) debe ser uno de los siguientes: ' + siONo })
    zumbidoTinnitus: string

    @ApiProperty({
        description: 'Pérdida de audición (súbita o progresiva)',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La pérdida de audición debe ser un string' })
    @IsNotEmpty({ message: 'La pérdida de audición no puede estar vacía' })
    @IsEnum(siONo, { message: 'La pérdida de audición debe ser uno de los siguientes: ' + siONo })
    perdidaAudicion: string

    @ApiProperty({
        description: 'Oído tapado / plenitud',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El oído tapado / plenitud debe ser un string' })
    @IsNotEmpty({ message: 'El oído tapado / plenitud no puede estar vacío' })
    @IsEnum(siONo, { message: 'El oído tapado / plenitud debe ser uno de los siguientes: ' + siONo })
    oidoTapadoPlenitud: string

    // Antecedentes personales
    @ApiProperty({
        description: 'Otitis frecuentes en la infancia',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Las otitis frecuentes en la infancia deben ser un string' })
    @IsNotEmpty({ message: 'Las otitis frecuentes en la infancia no pueden estar vacías' })
    @IsEnum(siONo, { message: 'Las otitis frecuentes en la infancia deben ser uno de los siguientes: ' + siONo })
    otitisFrecuentesInfancia: string

    @ApiProperty({
        description: 'Cirugías de oído',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Las cirugías de oído deben ser un string' })
    @IsNotEmpty({ message: 'Las cirugías de oído no pueden estar vacías' })
    @IsEnum(siONo, { message: 'Las cirugías de oído deben ser uno de los siguientes: ' + siONo })
    cirugiasOido: string

    @ApiProperty({
        description: 'Traumatismo craneal o barotrauma (vuelo, buceo, golpes)',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El traumatismo craneal o barotrauma debe ser un string' })
    @IsNotEmpty({ message: 'El traumatismo craneal o barotrauma no puede estar vacío' })
    @IsEnum(siONo, { message: 'El traumatismo craneal o barotrauma debe ser uno de los siguientes: ' + siONo })
    traumatismoCranealBarotrauma: string

    @ApiProperty({
        description: 'Uso de audífonos',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El uso de audífonos debe ser un string' })
    @IsNotEmpty({ message: 'El uso de audífonos no puede estar vacío' })
    @IsEnum(siONo, { message: 'El uso de audífonos debe ser uno de los siguientes: ' + siONo })
    usoAudifonos: string

    @ApiProperty({
        description: 'Historia familiar de hipoacusia',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La historia familiar de hipoacusia debe ser un string' })
    @IsNotEmpty({ message: 'La historia familiar de hipoacusia no puede estar vacía' })
    @IsEnum(siONo, { message: 'La historia familiar de hipoacusia debe ser uno de los siguientes: ' + siONo })
    historiaFamiliarHipoacusia: string

    @ApiProperty({
        description: 'Meningitis u otra infección grave en la infancia',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La meningitis u otra infección grave en la infancia debe ser un string' })
    @IsNotEmpty({ message: 'La meningitis u otra infección grave en la infancia no puede estar vacía' })
    @IsEnum(siONo, { message: 'La meningitis u otra infección grave en la infancia debe ser uno de los siguientes: ' + siONo })
    meningitisInfeccionGraveInfancia: string

    @ApiProperty({
        description: 'Diabetes',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La diabetes debe ser un string' })
    @IsNotEmpty({ message: 'La diabetes no puede estar vacía' })
    @IsEnum(siONo, { message: 'La diabetes debe ser uno de los siguientes: ' + siONo })
    diabetes: string

    @ApiProperty({
        description: 'Enfermedad renal',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La enfermedad renal debe ser un string' })
    @IsNotEmpty({ message: 'La enfermedad renal no puede estar vacía' })
    @IsEnum(siONo, { message: 'La enfermedad renal debe ser uno de los siguientes: ' + siONo })
    enfermedadRenal: string

    @ApiProperty({
        description: 'Medicamentos ototóxicos recientes (antibióticos, quimioterapia, diuréticos)',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Los medicamentos ototóxicos recientes deben ser un string' })
    @IsNotEmpty({ message: 'Los medicamentos ototóxicos recientes no pueden estar vacíos' })
    @IsEnum(siONo, { message: 'Los medicamentos ototóxicos recientes deben ser uno de los siguientes: ' + siONo })
    medicamentosOtotoxicos: string

    // Exposición a ruido
    @ApiProperty({
        description: 'Trabajo en ambientes ruidosos',
        enum: siONo,
        example: 'Si'
    })
    @IsString({ message: 'El trabajo en ambientes ruidosos debe ser un string' })
    @IsNotEmpty({ message: 'El trabajo en ambientes ruidosos no puede estar vacío' })
    @IsEnum(siONo, { message: 'El trabajo en ambientes ruidosos debe ser uno de los siguientes: ' + siONo })
    trabajoAmbientesRuidosos: string

    @ApiProperty({
        description: 'Tiempo de exposición laboral',
        enum: tiempoExposicionOpciones,
        example: '1 - 5 años'
    })
    @IsString({ message: 'El tiempo de exposición laboral debe ser un string' })
    @IsNotEmpty({ message: 'El tiempo de exposición laboral no puede estar vacío' })
    @IsEnum(tiempoExposicionOpciones, { message: 'El tiempo de exposición laboral debe ser uno de los siguientes: ' + tiempoExposicionOpciones })
    tiempoExposicionLaboral: string

    @ApiProperty({
        description: 'Uso de protección auditiva',
        enum: proteccionAuditivaOpciones,
        example: 'A veces'
    })
    @IsString({ message: 'El uso de protección auditiva debe ser un string' })
    @IsNotEmpty({ message: 'El uso de protección auditiva no puede estar vacío' })
    @IsEnum(proteccionAuditivaOpciones, { message: 'El uso de protección auditiva debe ser uno de los siguientes: ' + proteccionAuditivaOpciones })
    usoProteccionAuditiva: string

    @ApiProperty({
        description: 'Música fuerte / uso prolongado de audífonos',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La música fuerte / uso prolongado de audífonos debe ser un string' })
    @IsNotEmpty({ message: 'La música fuerte / uso prolongado de audífonos no puede estar vacía' })
    @IsEnum(siONo, { message: 'La música fuerte / uso prolongado de audífonos debe ser uno de los siguientes: ' + siONo })
    musicaFuerteAudifonos: string

    @ApiProperty({
        description: 'Armas de fuego / pasatiempos ruidosos',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Las armas de fuego / pasatiempos ruidosos deben ser un string' })
    @IsNotEmpty({ message: 'Las armas de fuego / pasatiempos ruidosos no pueden estar vacías' })
    @IsEnum(siONo, { message: 'Las armas de fuego / pasatiempos ruidosos deben ser uno de los siguientes: ' + siONo })
    armasFuegoPasatiemposRuidosos: string

    @ApiProperty({
        description: 'Servicio militar',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El servicio militar debe ser un string' })
    @IsNotEmpty({ message: 'El servicio militar no puede estar vacío' })
    @IsEnum(siONo, { message: 'El servicio militar debe ser uno de los siguientes: ' + siONo })
    servicioMilitar: string

    // Otros
    @ApiProperty({
        description: 'Alergias',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Las alergias deben ser un string' })
    @IsNotEmpty({ message: 'Las alergias no pueden estar vacías' })
    @IsEnum(siONo, { message: 'Las alergias deben ser uno de los siguientes: ' + siONo })
    alergias: string

    @ApiProperty({
        description: 'Resfriado el día de la prueba',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El resfriado el día de la prueba debe ser un string' })
    @IsNotEmpty({ message: 'El resfriado el día de la prueba no puede estar vacío' })
    @IsEnum(siONo, { message: 'El resfriado el día de la prueba debe ser uno de los siguientes: ' + siONo })
    resfriadoDiaPrueba: string

    // Otoscopia
    @ApiProperty({
        description: 'Otoscopia oído derecho',
        enum: otoscopiaOpciones,
        example: 'Permeable'
    })
    @IsString({ message: 'La otoscopia del oído derecho debe ser un string' })
    @IsNotEmpty({ message: 'La otoscopia del oído derecho no puede estar vacía' })
    @IsEnum(otoscopiaOpciones, { message: 'La otoscopia del oído derecho debe ser uno de los siguientes: ' + otoscopiaOpciones })
    otoscopiaOidoDerecho: string

    @ApiProperty({
        description: 'Otoscopia oído izquierdo',
        enum: otoscopiaOpciones,
        example: 'Permeable'
    })
    @IsString({ message: 'La otoscopia del oído izquierdo debe ser un string' })
    @IsNotEmpty({ message: 'La otoscopia del oído izquierdo no puede estar vacía' })
    @IsEnum(otoscopiaOpciones, { message: 'La otoscopia del oído izquierdo debe ser uno de los siguientes: ' + otoscopiaOpciones })
    otoscopiaOidoIzquierdo: string

    // Resultado de cuestionario
    @ApiProperty({
        description: 'Resultado de cuestionario',
        enum: resultadoCuestionarioOpciones,
        example: 'Procedente'
    })
    @IsString({ message: 'El resultado de cuestionario debe ser un string' })
    @IsNotEmpty({ message: 'El resultado de cuestionario no puede estar vacío' })
    @IsEnum(resultadoCuestionarioOpciones, { message: 'El resultado de cuestionario debe ser uno de los siguientes: ' + resultadoCuestionarioOpciones })
    resultadoCuestionario: string

    // Trabajador, ruta al archivo e info de creador y actualizador
    @ApiProperty({
        description: 'El ID del trabajador',
        example: '671fe9cc00fcb5611b10686e',
    })
    @IsMongoId({ message: 'El id del trabajador debe ser un ObjectId' })
    @IsNotEmpty({ message: 'El id del trabajador no puede estar vacío' })
    idTrabajador: string;

    @ApiProperty({
        description: 'Ruta hacía el PDF de la historia otológica',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del PDF de la historia otológica debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF de la historia otológica no puede estar vacía' })
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
