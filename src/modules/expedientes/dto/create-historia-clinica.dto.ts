import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

const siONo = ["Si", "No"];

const motivoExamen = ["Ingreso", "Inicial", "Periódico"];

const menarcaOpciones = [
  "Menos de 9 años",
  "9-11 años",
  "12-14 años",
  "15-17 años",
  "18-20 años",
  "21-24 años",
  "25 años o más",
];

const duracionOpciones = [
  "2 días",
  "3 días",
  "4 días",
  "5 días",
  "6 días",
  "7 días",
  "Otro",
];

const frecuenciaOpciones = [
  "Regular",
  "Oligomenorrea",
  "Polimenorrea",
  "Amenorrea",
];

const gestasOpciones = [
  "0 (Ninguna)",
  "1 gesta",
  "2 gestas",
  "3 gestas",
  "4 gestas",
  "5 gestas",
  "Más de 5 gestas",
];

const partosOpciones = [
  "0 (Ninguno)",
  "1 parto",
  "2 partos",
  "3 partos",
  "4 partos",
  "5 partos",
  "Más de 5 partos",
];

const cesareasOpciones = [
  "0 (Ninguna)",
  "1 cesarea",
  "2 cesareas",
  "3 cesareas",
  "Más de 3 cesareas",
];

const abortosOpciones = [
  "0 (Ninguno)",
  "1 aborto",
  "2 abortos",
  "3 abortos",
  "Más de 3 abortos",
];

const cantidadDeSangreOpciones = ["Normal", "Hipermenorrea", "Hipomenorrea"];

const dolorMenstrualOpciones = ["Eumenorrea", "Dismenorrea"];

export class CreateHistoriaClinicaDto {

    @IsNotEmpty({ message: 'El motivo del examen no puede estar vacío' })
    @IsEnum(motivoExamen, { message: 'El motivo del examen debe ser alguno de los siguientes: ' + motivoExamen })
    motivoExamen: string

    @ApiProperty({
        description: 'Fecha de la Historia Clinica',
        example: '2024-10-25T07:00:00.000+00:00'
    })
    @IsDate({ message: 'La fecha de la historia clínica debe ser una fecha' })
    @Type(() => Date)
    fechaHistoriaClinica: Date;

    // Antecedentes Heredofamiliares
    @IsOptional()
    @IsEnum(siONo, { message: 'nefropatias debe ser Si o No' })
    nefropatias: string;

    @IsOptional()
    @IsString({ message: 'nefropatiasEspecificar debe ser un string' })
    nefropatiasEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'diabeticos debe ser Si o No' })
    diabeticos: string;

    @IsOptional()
    @IsString({ message: 'diabeticosEspecificar debe ser un string' })
    diabeticosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'hipertensivos debe ser Si o No' })
    hipertensivos: string;

    @IsOptional()
    @IsString({ message: 'hipertensivosEspecificar debe ser un string' })
    hipertensivosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'cardiopaticos debe ser Si o No' })
    cardiopaticos: string;

    @IsOptional()
    @IsString({ message: 'cardiopaticosEspecificar debe ser un string' })
    cardiopaticosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'neoplasicos debe ser Si o No' })
    neoplasicos: string;

    @IsOptional()
    @IsString({ message: 'neoplasicosEspecificar debe ser un string' })
    neoplasicosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'psiquiatricos debe ser Si o No' })
    psiquiatricos: string;

    @IsOptional()
    @IsString({ message: 'psiquiatricosEspecificar debe ser un string' })
    psiquiatricosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'epilepticos debe ser Si o No' })
    epilepticos: string;

    @IsOptional()
    @IsString({ message: 'epilepticosEspecificar debe ser un string' })
    epilepticosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'leuticos debe ser Si o No' })
    leuticos: string;

    @IsOptional()
    @IsString({ message: 'leuticosEspecificar debe ser un string' })
    leuticosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'fimicos debe ser Si o No' })
    fimicos: string;

    @IsOptional()
    @IsString({ message: 'fimicosEspecificar debe ser un string' })
    fimicosEspecificar: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'hepatopatias debe ser Si o No' })
    hepatopatias: string;

    @IsOptional()
    @IsString({ message: 'hepatopatiasEspecificar debe ser un string' })
    hepatopatiasEspecificar: string;


    // Antecedentes Personales Patológicos (PP)
    @IsOptional()
    @IsEnum(siONo, { message: 'lumbalgias debe ser Si o No' })
    lumbalgias: string;
    
    @IsOptional()
    @IsString({ message: 'lumbalgiasEspecificar debe ser un string' })
    lumbalgiasEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'diabeticosPP debe ser Si o No' })
    diabeticosPP: string;
    
    @IsOptional()
    @IsString({ message: 'diabeticosPPEspecificar debe ser un string' })
    diabeticosPPEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'cardiopaticosPP debe ser Si o No' })
    cardiopaticosPP: string;
    
    @IsOptional()
    @IsString({ message: 'cardiopaticosPPEspecificar debe ser un string' })
    cardiopaticosPPEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'alergicos debe ser Si o No' })
    alergicos: string;
    
    @IsOptional()
    @IsString({ message: 'alergicosEspecificar debe ser un string' })
    alergicosEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'hipertensivosPP debe ser Si o No' })
    hipertensivosPP: string;
    
    @IsOptional()
    @IsString({ message: 'hipertensivosPPEspecificar debe ser un string' })
    hipertensivosPPEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'obesidad debe ser Si o No' })
    obesidad: string;
    
    @IsOptional()
    @IsString({ message: 'obesidadEspecificar debe ser un string' })
    obesidadEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'epilepticosPP debe ser Si o No' })
    epilepticosPP: string;
    
    @IsOptional()
    @IsString({ message: 'epilepticosPPEspecificar debe ser un string' })
    epilepticosPPEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'accidentes debe ser Si o No' })
    accidentes: string;
    
    @IsOptional()
    @IsString({ message: 'accidentesEspecificar debe ser un string' })
    accidentesEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'quirurgicos debe ser Si o No' })
    quirurgicos: string;
    
    @IsOptional()
    @IsString({ message: 'quirurgicosEspecificar debe ser un string' })
    quirurgicosEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'traumaticos debe ser Si o No' })
    traumaticos: string;
    
    @IsOptional()
    @IsString({ message: 'traumaticosEspecificar debe ser un string' })
    traumaticosEspecificar: string;
    

    // Antecedentes Personales No Patológicos
    @IsOptional()
    @IsEnum(siONo, { message: 'alcoholismo debe ser Si o No' })
    alcoholismo: string;
    
    @IsOptional()
    @IsString({ message: 'alcoholismoEspecificar debe ser un string' })
    alcoholismoEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'tabaquismo debe ser Si o No' })
    tabaquismo: string;
    
    @IsOptional()
    @IsString({ message: 'tabaquismoEspecificar debe ser un string' })
    tabaquismoEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'toxicomanias debe ser Si o No' })
    toxicomanias: string;
    
    @IsOptional()
    @IsString({ message: 'toxicomaniasEspecificar debe ser un string' })
    toxicomaniasEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'alimentacionDeficiente debe ser Si o No' })
    alimentacionDeficiente: string;
    
    @IsOptional()
    @IsString({ message: 'alimentacionDeficienteEspecificar debe ser un string' })
    alimentacionDeficienteEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'actividadFisicaDeficiente debe ser Si o No' })
    actividadFisicaDeficiente: string;
    
    @IsOptional()
    @IsString({ message: 'actividadFisicaDeficienteEspecificar debe ser un string' })
    actividadFisicaDeficienteEspecificar: string;
    
    @IsOptional()
    @IsEnum(siONo, { message: 'higienePersonalDeficiente debe ser Si o No' })
    higienePersonalDeficiente: string;
    
    @IsOptional()
    @IsString({ message: 'higienePersonalDeficienteEspecificar debe ser un string' })
    higienePersonalDeficienteEspecificar: string;

    
    // Antecedentes Ginecoobstetricos
    @IsOptional()
    @IsEnum( menarcaOpciones, { message: 'menarca debe ser alguna de las siguientes opciones: ' + menarcaOpciones })
    menarca: string;

    @IsOptional()
    @IsEnum( duracionOpciones, { message: 'duracionPromedio debe ser alguna de las siguientes opciones: ' + duracionOpciones })
    duracionPromedio: string;
    
    @IsOptional()
    @IsEnum( frecuenciaOpciones, { message: 'frecuencia debe ser alguna de las siguientes opciones: ' + frecuenciaOpciones })
    frecuencia: string;

    @IsOptional()
    @IsEnum( gestasOpciones, { message: 'gestas debe ser alguna de las siguientes opciones: ' + gestasOpciones })
    gestas: string;

    @IsOptional()
    @IsEnum( partosOpciones, { message: 'partos debe ser alguna de las siguientes opciones: ' + partosOpciones })
    partos: string;

    @IsOptional()
    @IsEnum( cesareasOpciones, { message: 'cesareas debe ser alguna de las siguientes opciones: ' + cesareasOpciones })
    cesareas: string;

    @IsOptional()
    @IsEnum( abortosOpciones, { message: 'abortos debe ser alguna de las siguientes opciones: ' + abortosOpciones })
    abortos: string;

    @IsOptional()
    @IsString({ message: 'fechaUltimaRegla debe ser un string' })
    fechaUltimaRegla: string;

    @IsOptional()
    @IsEnum( cantidadDeSangreOpciones, { message: 'cantidadDeSangre debe ser alguna de las siguientes opciones: ' + cantidadDeSangreOpciones })
    cantidadDeSangre: string;

    @IsOptional()
    @IsEnum( dolorMenstrualOpciones, { message: 'dolorMenstrual debe ser alguna de las siguientes opciones: ' + dolorMenstrualOpciones })
    dolorMenstrual: string;

    @IsOptional()
    @IsString({ message: 'embarazoActual debe ser un string' })
    embarazoActual: string;

    @IsOptional()
    @IsString({ message: 'planificacionFamiliar debe ser un string' })
    planificacionFamiliar: string;

    @IsOptional()
    @IsString({ message: 'vidaSexualActiva debe ser un string' })
    vidaSexualActiva: string;

    @IsOptional()
    @IsString({ message: 'fechaUltimoPapanicolaou debe ser un string' })
    fechaUltimoPapanicolaou: string;

    
    // Antecedentes Laborales
    @IsOptional()
    @IsString({ message: 'empresaAnterior1 debe ser un string' })
    empresaAnterior1: string;

    @IsOptional()
    @IsString({ message: 'puestoAnterior1 debe ser un string' })
    puestoAnterior1: string;

    @IsOptional()
    @IsString({ message: 'antiguedadAnterior1 debe ser un string' })
    antiguedadAnterior1: string;

    @IsOptional()
    @IsString({ message: 'agentesAnterior1 debe ser un string' })
    agentesAnterior1: string;

    @IsOptional()
    @IsString({ message: 'empresaAnterior2 debe ser un string' })
    empresaAnterior2: string;

    @IsOptional()
    @IsString({ message: 'puestoAnterior2 debe ser un string' })
    puestoAnterior2: string;

    @IsOptional()
    @IsString({ message: 'antiguedadAnterior2 debe ser un string' })
    antiguedadAnterior2: string;

    @IsOptional()
    @IsString({ message: 'agentesAnterior2 debe ser un string' })
    agentesAnterior2: string;

    @IsOptional()
    @IsString({ message: 'empresaAnterior3 debe ser un string' })
    empresaAnterior3: string;

    @IsOptional()
    @IsString({ message: 'puestoAnterior3 debe ser un string' })
    puestoAnterior3: string;

    @IsOptional()
    @IsString({ message: 'antiguedadAnterior3 debe ser un string' })
    antiguedadAnterior3: string;

    @IsOptional()
    @IsString({ message: 'agentesAnterior3 debe ser un string' })
    agentesAnterior3: string;

    @IsOptional()
    @IsEnum(siONo, { message: 'accidenteLaboral debe ser Si o No' })
    accidenteLaboral: string;

    @IsOptional()
    @IsString({ message: 'accidenteLaboralEspecificar debe ser un string' })
    accidenteLaboralEspecificar: string;

    @IsOptional()
    @IsString({ message: 'descripcionDelDano debe ser un string' })
    descripcionDelDano: string;

    @IsOptional()
    @IsString({ message: 'secuelas debe ser un string' })
    secuelas: string;

    // Resumen de la Historia Clinica
    @IsOptional()
    @IsString({ message: 'resumenHistoriaClinica debe ser un string' })
    resumenHistoriaClinica: string;

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
