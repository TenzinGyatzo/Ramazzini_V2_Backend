import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

const siONo = ["Si", "No"];

const tabaquismoOpciones = ["No fuma", "Fuma actualmente", "Exfumador"];

const paquetesAnoOpciones = ["0", "<10", "10–20", ">20"];

const exposicionPolvosOpciones = ["Orgánicos", "Inorgánicos", "Ambos", "No"];

const disneaOpciones = ["Ninguna", "Al esfuerzo", "En reposo"];

const medicamentosOpciones = ["Si", "No", "Especificar"];

const resultadoCuestionarioOpciones = ["Procedente", "Procedente con precaución", "No procedente"];

export class CreatePrevioEspirometriaDto {

    @ApiProperty({
        description: 'Fecha del previo espirometría',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha del previo espirometría debe ser una fecha' })
    @Type(() => Date)
    @IsNotEmpty({ message: 'La fecha del previo espirometría no puede estar vacía' })
    fechaPrevioEspirometria: Date;

    // Factores de riesgo respiratorio
    @ApiProperty({
        description: 'Tabaquismo',
        enum: tabaquismoOpciones,
        example: 'No fuma'
    })
    @IsString({ message: 'El tabaquismo debe ser un string' })
    @IsNotEmpty({ message: 'El tabaquismo no puede estar vacío' })
    @IsEnum(tabaquismoOpciones, { message: 'El tabaquismo debe ser uno de los siguientes: ' + tabaquismoOpciones })
    tabaquismo: string

    @ApiProperty({
        description: 'Paquetes-año (si aplica)',
        enum: paquetesAnoOpciones,
        example: '<10'
    })
    @IsString({ message: 'Los paquetes-año deben ser un string' })
    @IsOptional()
    @IsEnum(paquetesAnoOpciones, { message: 'Los paquetes-año deben ser uno de los siguientes: ' + paquetesAnoOpciones })
    paquetesAno: string

    @ApiProperty({
        description: 'Exposición a humos de biomasa',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La exposición a humos de biomasa debe ser un string' })
    @IsNotEmpty({ message: 'La exposición a humos de biomasa no puede estar vacía' })
    @IsEnum(siONo, { message: 'La exposición a humos de biomasa debe ser uno de los siguientes: ' + siONo })
    exposicionHumosBiomasa: string

    @ApiProperty({
        description: 'Exposición laboral a polvos',
        enum: exposicionPolvosOpciones,
        example: 'No'
    })
    @IsString({ message: 'La exposición laboral a polvos debe ser un string' })
    @IsNotEmpty({ message: 'La exposición laboral a polvos no puede estar vacía' })
    @IsEnum(exposicionPolvosOpciones, { message: 'La exposición laboral a polvos debe ser uno de los siguientes: ' + exposicionPolvosOpciones })
    exposicionLaboralPolvos: string

    @ApiProperty({
        description: 'Exposición a vapores o gases irritantes',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La exposición a vapores o gases irritantes debe ser un string' })
    @IsNotEmpty({ message: 'La exposición a vapores o gases irritantes no puede estar vacía' })
    @IsEnum(siONo, { message: 'La exposición a vapores o gases irritantes debe ser uno de los siguientes: ' + siONo })
    exposicionVaporesGasesIrritantes: string

    @ApiProperty({
        description: 'Antecedentes de tuberculosis u otras infecciones respiratorias',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Los antecedentes de tuberculosis u otras infecciones respiratorias deben ser un string' })
    @IsNotEmpty({ message: 'Los antecedentes de tuberculosis u otras infecciones respiratorias no pueden estar vacíos' })
    @IsEnum(siONo, { message: 'Los antecedentes de tuberculosis u otras infecciones respiratorias deben ser uno de los siguientes: ' + siONo })
    antecedentesTuberculosisInfeccionesRespiratorias: string

    // Síntomas respiratorios
    @ApiProperty({
        description: 'Tos crónica',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La tos crónica debe ser un string' })
    @IsNotEmpty({ message: 'La tos crónica no puede estar vacía' })
    @IsEnum(siONo, { message: 'La tos crónica debe ser uno de los siguientes: ' + siONo })
    tosCronica: string

    @ApiProperty({
        description: 'Expectoración frecuente',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La expectoración frecuente debe ser un string' })
    @IsNotEmpty({ message: 'La expectoración frecuente no puede estar vacía' })
    @IsEnum(siONo, { message: 'La expectoración frecuente debe ser uno de los siguientes: ' + siONo })
    expectoracionFrecuente: string

    @ApiProperty({
        description: 'Disnea',
        enum: disneaOpciones,
        example: 'Ninguna'
    })
    @IsString({ message: 'La disnea debe ser un string' })
    @IsNotEmpty({ message: 'La disnea no puede estar vacía' })
    @IsEnum(disneaOpciones, { message: 'La disnea debe ser uno de los siguientes: ' + disneaOpciones })
    disnea: string

    @ApiProperty({
        description: 'Sibilancias',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'Las sibilancias deben ser un string' })
    @IsNotEmpty({ message: 'Las sibilancias no pueden estar vacías' })
    @IsEnum(siONo, { message: 'Las sibilancias deben ser uno de los siguientes: ' + siONo })
    sibilancias: string

    @ApiProperty({
        description: 'Hemoptisis',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La hemoptisis debe ser un string' })
    @IsNotEmpty({ message: 'La hemoptisis no puede estar vacía' })
    @IsEnum(siONo, { message: 'La hemoptisis debe ser uno de los siguientes: ' + siONo })
    hemoptisis: string

    @ApiProperty({
        description: 'Otros síntomas',
        example: 'Dolor de pecho'
    })
    @IsString({ message: 'Los otros síntomas deben ser un string' })
    @IsOptional()
    otrosSintomas: string

    // Antecedentes médicos relevantes
    @ApiProperty({
        description: 'Asma',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El asma debe ser un string' })
    @IsNotEmpty({ message: 'El asma no puede estar vacío' })
    @IsEnum(siONo, { message: 'El asma debe ser uno de los siguientes: ' + siONo })
    asma: string

    @ApiProperty({
        description: 'EPOC / Bronquitis crónica',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La EPOC / Bronquitis crónica debe ser un string' })
    @IsNotEmpty({ message: 'La EPOC / Bronquitis crónica no puede estar vacía' })
    @IsEnum(siONo, { message: 'La EPOC / Bronquitis crónica debe ser uno de los siguientes: ' + siONo })
    epocBronquitisCronica: string

    @ApiProperty({
        description: 'Fibrosis pulmonar',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La fibrosis pulmonar debe ser un string' })
    @IsNotEmpty({ message: 'La fibrosis pulmonar no puede estar vacía' })
    @IsEnum(siONo, { message: 'La fibrosis pulmonar debe ser uno de los siguientes: ' + siONo })
    fibrosisPulmonar: string

    @ApiProperty({
        description: 'Apnea del sueño',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La apnea del sueño debe ser un string' })
    @IsNotEmpty({ message: 'La apnea del sueño no puede estar vacía' })
    @IsEnum(siONo, { message: 'La apnea del sueño debe ser uno de los siguientes: ' + siONo })
    apneaSueno: string

    @ApiProperty({
        description: 'Medicamentos actuales (broncodilatadores, corticoides, otros)',
        enum: medicamentosOpciones,
        example: 'No'
    })
    @IsString({ message: 'Los medicamentos actuales deben ser un string' })
    @IsNotEmpty({ message: 'Los medicamentos actuales no pueden estar vacíos' })
    @IsEnum(siONo, { message: 'Los medicamentos actuales deben ser uno de los siguientes: ' + siONo })
    medicamentosActuales: string

    @ApiProperty({
        description: 'Especificar medicamentos actuales',
        example: 'Salbutamol, Prednisona'
    })
    @IsString({ message: 'La especificación de medicamentos actuales debe ser un string' })
    @IsOptional()
    medicamentosActualesEspecificar: string

    // Contraindicaciones Relativas
    @ApiProperty({
        description: 'Cirugía reciente (torácica, abdominal, ocular)',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La cirugía reciente debe ser un string' })
    @IsNotEmpty({ message: 'La cirugía reciente no puede estar vacía' })
    @IsEnum(siONo, { message: 'La cirugía reciente debe ser uno de los siguientes: ' + siONo })
    cirugiaReciente: string

    @ApiProperty({
        description: 'Infección respiratoria activa',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La infección respiratoria activa debe ser un string' })
    @IsNotEmpty({ message: 'La infección respiratoria activa no puede estar vacía' })
    @IsEnum(siONo, { message: 'La infección respiratoria activa debe ser uno de los siguientes: ' + siONo })
    infeccionRespiratoriaActiva: string

    @ApiProperty({
        description: 'Embarazo complicado',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El embarazo complicado debe ser un string' })
    @IsNotEmpty({ message: 'El embarazo complicado no puede estar vacío' })
    @IsEnum(siONo, { message: 'El embarazo complicado debe ser uno de los siguientes: ' + siONo })
    embarazoComplicado: string

    @ApiProperty({
        description: 'Derrame pleural',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El derrame pleural debe ser un string' })
    @IsNotEmpty({ message: 'El derrame pleural no puede estar vacío' })
    @IsEnum(siONo, { message: 'El derrame pleural debe ser uno de los siguientes: ' + siONo })
    derramePleural: string

    @ApiProperty({
        description: 'Neumotórax',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El neumotórax debe ser un string' })
    @IsNotEmpty({ message: 'El neumotórax no puede estar vacío' })
    @IsEnum(siONo, { message: 'El neumotórax debe ser uno de los siguientes: ' + siONo })
    neumotorax: string

    @ApiProperty({
        description: 'Alguna condición que contraindique broncodilatadores',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La condición que contraindique broncodilatadores debe ser un string' })
    @IsNotEmpty({ message: 'La condición que contraindique broncodilatadores no puede estar vacía' })
    @IsEnum(siONo, { message: 'La condición que contraindique broncodilatadores debe ser uno de los siguientes: ' + siONo })
    condicionContraindiqueBroncodilatadores: string

    // Contraindicaciones Absolutas
    @ApiProperty({
        description: 'Infarto agudo / angina inestable',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El infarto agudo / angina inestable debe ser un string' })
    @IsNotEmpty({ message: 'El infarto agudo / angina inestable no puede estar vacío' })
    @IsEnum(siONo, { message: 'El infarto agudo / angina inestable debe ser uno de los siguientes: ' + siONo })
    infartoAgudoAnginaInestable: string

    @ApiProperty({
        description: 'Aneurisma aórtico conocido',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El aneurisma aórtico conocido debe ser un string' })
    @IsNotEmpty({ message: 'El aneurisma aórtico conocido no puede estar vacío' })
    @IsEnum(siONo, { message: 'El aneurisma aórtico conocido debe ser uno de los siguientes: ' + siONo })
    aneurismaAorticoConocido: string

    @ApiProperty({
        description: 'Inestabilidad hemodinámica grave',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La inestabilidad hemodinámica grave debe ser un string' })
    @IsNotEmpty({ message: 'La inestabilidad hemodinámica grave no puede estar vacía' })
    @IsEnum(siONo, { message: 'La inestabilidad hemodinámica grave debe ser uno de los siguientes: ' + siONo })
    inestabilidadHemodinamicaGrave: string

    @ApiProperty({
        description: 'Hipertensión intracraneal',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'La hipertensión intracraneal debe ser un string' })
    @IsNotEmpty({ message: 'La hipertensión intracraneal no puede estar vacía' })
    @IsEnum(siONo, { message: 'La hipertensión intracraneal debe ser uno de los siguientes: ' + siONo })
    hipertensionIntracraneal: string

    @ApiProperty({
        description: 'Desprendimiento agudo de retina',
        enum: siONo,
        example: 'No'
    })
    @IsString({ message: 'El desprendimiento agudo de retina debe ser un string' })
    @IsNotEmpty({ message: 'El desprendimiento agudo de retina no puede estar vacío' })
    @IsEnum(siONo, { message: 'El desprendimiento agudo de retina debe ser uno de los siguientes: ' + siONo })
    desprendimientoAgudoRetina: string

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
        description: 'Ruta hacía el PDF del previo espirometría',
        example: "expedientes-medicos/Expedientes Medicos/AGRICULTURE/Parcelas Del Este/Juan Pérez López.pdf"
    })
    @IsString({ message: 'La ruta del PDF del previo espirometría debe ser un string' })
    @IsNotEmpty({ message: 'La ruta del PDF del previo espirometría no puede estar vacía' })
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
