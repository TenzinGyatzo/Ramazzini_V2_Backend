/**
 * CIE-10 Restrictions Catalog Utility
 * 
 * Catálogo interno de restricciones clínicas por sexo y edad para diagnósticos CIE-10.
 * Aplicable únicamente a diagnósticos en Nota Médica (salud ocupacional).
 * 
 * Bloque C3/C4: Validaciones determinísticas por SEXO y/o EDAD
 */

export interface RestrictionRule {
  sexoPermitido: 'MUJER' | 'HOMBRE';
  edadMin?: number;
  edadMax?: number;
  ruleId: 'C3' | 'C4';
  descripcion: string;
}

/**
 * Catálogo de restricciones CIE-10 por prefijo
 * Mapea prefijos de códigos CIE-10 a restricciones de sexo y edad
 */
const CIE10_RESTRICTIONS: Map<string, RestrictionRule> = new Map([
  // ========== C3: GINECOLÓGICOS / MAMA / EMBARAZO ==========
  
  // Cáncer de mama - Solo MUJER, sin restricción de edad
  ['C50', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de mama - Solo permitido para MUJER',
  }],

  // Cáncer cervicouterino - MUJER, 25-64 años
  ['C53', {
    sexoPermitido: 'MUJER',
    edadMin: 25,
    edadMax: 64,
    ruleId: 'C3',
    descripcion: 'Cáncer cervicouterino - Solo permitido para MUJER entre 25 y 64 años',
  }],

  // Neoplasia in situ del cuello uterino - MUJER, 25-64 años
  ['D06', {
    sexoPermitido: 'MUJER',
    edadMin: 25,
    edadMax: 64,
    ruleId: 'C3',
    descripcion: 'Neoplasia in situ del cuello uterino - Solo permitido para MUJER entre 25 y 64 años',
  }],

  // Cáncer de vulva - Solo MUJER
  ['C51', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de vulva - Solo permitido para MUJER',
  }],

  // Cáncer de vagina - Solo MUJER
  ['C52', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de vagina - Solo permitido para MUJER',
  }],

  // Cáncer de cuerpo del útero - Solo MUJER
  ['C54', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de cuerpo del útero - Solo permitido para MUJER',
  }],

  // Cáncer de útero, parte no especificada - Solo MUJER
  ['C55', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de útero, parte no especificada - Solo permitido para MUJER',
  }],

  // Cáncer de ovario - Solo MUJER
  ['C56', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de ovario - Solo permitido para MUJER',
  }],

  // Cáncer de trompa de Falopio y otros órganos genitales femeninos - Solo MUJER
  ['C57', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de trompa de Falopio y otros órganos genitales femeninos - Solo permitido para MUJER',
  }],

  // Cáncer de órganos genitales femeninos, otros y no especificados - Solo MUJER
  ['C58', {
    sexoPermitido: 'MUJER',
    ruleId: 'C3',
    descripcion: 'Cáncer de órganos genitales femeninos, otros y no especificados - Solo permitido para MUJER',
  }],

  // Enfermedades inflamatorias de órganos pélvicos femeninos (N70-N77)
  ['N70', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Salpingitis y ooforitis' }],
  ['N71', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Enfermedad inflamatoria del útero' }],
  ['N72', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Enfermedad inflamatoria del cuello uterino' }],
  ['N73', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otras enfermedades inflamatorias pélvicas' }],
  ['N74', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Trastornos inflamatorios de órganos pélvicos en enfermedades clasificadas en otra parte' }],
  ['N75', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Enfermedades de la glándula de Bartholin' }],
  ['N76', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otras afecciones inflamatorias de la vagina y la vulva' }],
  ['N77', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Ulceración e inflamación vulvovaginal en enfermedades clasificadas en otra parte' }],

  // Trastornos no inflamatorios de órganos genitales femeninos (N80-N98)
  ['N80', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Endometriosis' }],
  ['N81', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Prolapso genital femenino' }],
  ['N82', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Fístulas del tracto genital femenino' }],
  ['N83', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Trastornos no inflamatorios del ovario, de la trompa de Falopio y del ligamento ancho' }],
  ['N84', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Pólipo del tracto genital femenino' }],
  ['N85', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otros trastornos no inflamatorios del útero' }],
  ['N86', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Erosión y ectropión del cuello uterino' }],
  ['N87', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Displasia del cuello uterino' }],
  ['N88', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otros trastornos no inflamatorios del cuello uterino' }],
  ['N89', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otros trastornos no inflamatorios de la vagina' }],
  ['N90', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otros trastornos no inflamatorios de la vulva y del periné' }],
  ['N91', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Amenorrea, oligomenorrea e hipomenorrea' }],
  ['N92', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Menstruación excesiva, frecuente e irregular' }],
  ['N93', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Otras hemorragias uterinas y vaginales anormales' }],
  ['N94', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Dolor y otras afecciones asociadas con los órganos genitales femeninos y el ciclo menstrual' }],
  ['N95', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Trastornos de la menopausia y otros trastornos perimenopáusicos' }],
  ['N96', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Aborto recurrente' }],
  ['N97', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Esterilidad femenina' }],
  ['N98', { sexoPermitido: 'MUJER', ruleId: 'C3', descripcion: 'Complicaciones asociadas con la fecundación artificial' }],

  // Embarazo, parto y puerperio (O00-O99) - MUJER, >= 10 años (mínimo biológico conservador)
  ['O00', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Embarazo ectópico - Solo permitido para MUJER desde 10 años' }],
  ['O01', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Mola hidatiforme - Solo permitido para MUJER desde 10 años' }],
  ['O02', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otros productos anormales de la concepción - Solo permitido para MUJER desde 10 años' }],
  ['O03', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Aborto espontáneo - Solo permitido para MUJER desde 10 años' }],
  ['O04', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Aborto médico - Solo permitido para MUJER desde 10 años' }],
  ['O05', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otro aborto - Solo permitido para MUJER desde 10 años' }],
  ['O06', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Aborto no especificado - Solo permitido para MUJER desde 10 años' }],
  ['O07', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Fallo en el aborto médico - Solo permitido para MUJER desde 10 años' }],
  ['O08', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones consecutivas al aborto y embarazo ectópico - Solo permitido para MUJER desde 10 años' }],
  ['O09', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Embarazo con aborto previo - Solo permitido para MUJER desde 10 años' }],
  ['O10', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Hipertensión preexistente que complica el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O11', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastorno hipertensivo preexistente con proteinuria - Solo permitido para MUJER desde 10 años' }],
  ['O12', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Edema y proteinuria gestacionales - Solo permitido para MUJER desde 10 años' }],
  ['O13', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Hipertensión gestacional sin proteinuria significativa - Solo permitido para MUJER desde 10 años' }],
  ['O14', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Preeclampsia - Solo permitido para MUJER desde 10 años' }],
  ['O15', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Eclampsia - Solo permitido para MUJER desde 10 años' }],
  ['O16', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Hipertensión materna no especificada - Solo permitido para MUJER desde 10 años' }],
  ['O20', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Hemorragia al inicio del embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O21', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Vómitos excesivos en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O22', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones venosas en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O23', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Infecciones del tracto genitourinario en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O24', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Diabetes mellitus en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O25', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Desnutrición en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O26', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Cuidados maternos por otras complicaciones principalmente relacionadas con el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O28', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Hallazgos anormales en el examen antenatal de la madre - Solo permitido para MUJER desde 10 años' }],
  ['O29', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones de la anestesia durante el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O30', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Embarazo múltiple - Solo permitido para MUJER desde 10 años' }],
  ['O31', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones específicas del embarazo múltiple - Solo permitido para MUJER desde 10 años' }],
  ['O32', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Cuidados maternos por presentación anormal conocida o sospechada - Solo permitido para MUJER desde 10 años' }],
  ['O33', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Cuidados maternos por desproporción conocida o sospechada - Solo permitido para MUJER desde 10 años' }],
  ['O34', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Cuidados maternos por anormalidad conocida o sospechada de los órganos pélvicos maternos - Solo permitido para MUJER desde 10 años' }],
  ['O35', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Cuidados maternos por anormalidad y lesión conocidas o sospechadas del feto - Solo permitido para MUJER desde 10 años' }],
  ['O36', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Cuidados maternos por otros problemas fetales conocidos o sospechados - Solo permitido para MUJER desde 10 años' }],
  ['O40', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Polihidramnios - Solo permitido para MUJER desde 10 años' }],
  ['O41', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otros trastornos de las membranas y del líquido amniótico - Solo permitido para MUJER desde 10 años' }],
  ['O42', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Ruptura prematura de membranas - Solo permitido para MUJER desde 10 años' }],
  ['O43', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos placentarios - Solo permitido para MUJER desde 10 años' }],
  ['O44', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Placenta previa - Solo permitido para MUJER desde 10 años' }],
  ['O45', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Desprendimiento prematuro de la placenta - Solo permitido para MUJER desde 10 años' }],
  ['O46', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Anteparto (hemorragia) - Solo permitido para MUJER desde 10 años' }],
  ['O47', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Falso trabajo de parto - Solo permitido para MUJER desde 10 años' }],
  ['O48', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Embarazo prolongado - Solo permitido para MUJER desde 10 años' }],
  ['O49', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Polihidramnios - Solo permitido para MUJER desde 10 años' }],
  ['O50', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Edema, proteinuria y trastornos hipertensivos en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O51', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Embarazo múltiple - Solo permitido para MUJER desde 10 años' }],
  ['O52', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos del útero en el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O53', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Incompetencia cervical - Solo permitido para MUJER desde 10 años' }],
  ['O54', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Insuficiencia placentaria - Solo permitido para MUJER desde 10 años' }],
  ['O55', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos del feto - Solo permitido para MUJER desde 10 años' }],
  ['O56', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos del líquido amniótico y de las membranas - Solo permitido para MUJER desde 10 años' }],
  ['O57', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos relacionados con la duración del embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O58', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos maternos relacionados predominantemente con el embarazo - Solo permitido para MUJER desde 10 años' }],
  ['O59', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trastornos relacionados con el crecimiento fetal y trastornos del feto - Solo permitido para MUJER desde 10 años' }],
  ['O60', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Parto prematuro - Solo permitido para MUJER desde 10 años' }],
  ['O61', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Fallo en la inducción del trabajo de parto - Solo permitido para MUJER desde 10 años' }],
  ['O62', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Anormalidades de las contracciones del trabajo de parto - Solo permitido para MUJER desde 10 años' }],
  ['O63', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trabajo de parto prolongado - Solo permitido para MUJER desde 10 años' }],
  ['O64', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Obstrucción del trabajo de parto debida a presentación anormal del feto - Solo permitido para MUJER desde 10 años' }],
  ['O65', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Obstrucción del trabajo de parto debida a anormalidad de la pelvis materna - Solo permitido para MUJER desde 10 años' }],
  ['O66', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otras obstrucciones del trabajo de parto - Solo permitido para MUJER desde 10 años' }],
  ['O67', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trabajo de parto y parto complicados por hemorragia intraparto - Solo permitido para MUJER desde 10 años' }],
  ['O68', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trabajo de parto y parto complicados por sufrimiento fetal - Solo permitido para MUJER desde 10 años' }],
  ['O69', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trabajo de parto y parto complicados por problemas del cordón umbilical - Solo permitido para MUJER desde 10 años' }],
  ['O70', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Desgarro perineal durante el parto - Solo permitido para MUJER desde 10 años' }],
  ['O71', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otras laceraciones obstétricas - Solo permitido para MUJER desde 10 años' }],
  ['O72', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Hemorragia posparto - Solo permitido para MUJER desde 10 años' }],
  ['O73', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Retención de placenta y membranas, sin hemorragia - Solo permitido para MUJER desde 10 años' }],
  ['O74', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones de la anestesia durante el trabajo de parto y el parto - Solo permitido para MUJER desde 10 años' }],
  ['O75', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otras complicaciones del trabajo de parto y del parto - Solo permitido para MUJER desde 10 años' }],
  ['O76', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otros trastornos relacionados con el trabajo de parto y el parto - Solo permitido para MUJER desde 10 años' }],
  ['O77', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Trabajo de parto obstruido - Solo permitido para MUJER desde 10 años' }],
  ['O78', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones del trabajo de parto y del parto, no especificadas - Solo permitido para MUJER desde 10 años' }],
  ['O79', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otras complicaciones del trabajo de parto y del parto - Solo permitido para MUJER desde 10 años' }],
  ['O80', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Parto único espontáneo - Solo permitido para MUJER desde 10 años' }],
  ['O81', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Parto único con fórceps o ventosa - Solo permitido para MUJER desde 10 años' }],
  ['O82', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Parto único por cesárea - Solo permitido para MUJER desde 10 años' }],
  ['O83', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otro parto único asistido - Solo permitido para MUJER desde 10 años' }],
  ['O84', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Parto múltiple - Solo permitido para MUJER desde 10 años' }],
  ['O85', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Sepsis puerperal - Solo permitido para MUJER desde 10 años' }],
  ['O86', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otras infecciones puerperales - Solo permitido para MUJER desde 10 años' }],
  ['O87', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones venosas en el puerperio - Solo permitido para MUJER desde 10 años' }],
  ['O88', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Embolia obstétrica - Solo permitido para MUJER desde 10 años' }],
  ['O89', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones de la anestesia durante el puerperio - Solo permitido para MUJER desde 10 años' }],
  ['O90', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Complicaciones del puerperio - Solo permitido para MUJER desde 10 años' }],
  ['O91', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Infecciones mamarias asociadas con el parto - Solo permitido para MUJER desde 10 años' }],
  ['O92', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otros trastornos de la mama y de la lactancia asociados con el parto - Solo permitido para MUJER desde 10 años' }],
  ['O93', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Muerte materna - Solo permitido para MUJER desde 10 años' }],
  ['O94', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Secuelas de complicaciones del embarazo, parto y puerperio - Solo permitido para MUJER desde 10 años' }],
  ['O95', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Muerte obstétrica de causa no especificada - Solo permitido para MUJER desde 10 años' }],
  ['O96', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Muerte por cualquier causa obstétrica - Solo permitido para MUJER desde 10 años' }],
  ['O97', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Muerte por secuelas de causas obstétricas directas - Solo permitido para MUJER desde 10 años' }],
  ['O98', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Enfermedades maternas infecciosas y parasitarias clasificables en otra parte que complican el embarazo, el parto y el puerperio - Solo permitido para MUJER desde 10 años' }],
  ['O99', { sexoPermitido: 'MUJER', edadMin: 10, ruleId: 'C3', descripcion: 'Otras enfermedades maternas clasificables en otra parte que complican el embarazo, el parto y el puerperio - Solo permitido para MUJER desde 10 años' }],

  // ========== C4: PROSTÁTICOS / MASCULINOS ==========

  // Hiperplasia prostática - HOMBRE, >= 40 años
  ['N40', {
    sexoPermitido: 'HOMBRE',
    edadMin: 40,
    ruleId: 'C4',
    descripcion: 'Hiperplasia prostática - Solo permitido para HOMBRE desde 40 años',
  }],

  // Cáncer de pene - Solo HOMBRE
  ['C60', {
    sexoPermitido: 'HOMBRE',
    ruleId: 'C4',
    descripcion: 'Cáncer de pene - Solo permitido para HOMBRE',
  }],

  // Cáncer de próstata - HOMBRE, >= 40 años
  ['C61', {
    sexoPermitido: 'HOMBRE',
    edadMin: 40,
    ruleId: 'C4',
    descripcion: 'Cáncer de próstata - Solo permitido para HOMBRE desde 40 años',
  }],

  // Cáncer de testículo - Solo HOMBRE
  ['C62', {
    sexoPermitido: 'HOMBRE',
    ruleId: 'C4',
    descripcion: 'Cáncer de testículo - Solo permitido para HOMBRE',
  }],

  // Cáncer de otros órganos genitales masculinos - Solo HOMBRE
  ['C63', {
    sexoPermitido: 'HOMBRE',
    ruleId: 'C4',
    descripcion: 'Cáncer de otros órganos genitales masculinos - Solo permitido para HOMBRE',
  }],

  // Otros trastornos de la próstata y órganos genitales masculinos (N41-N51) - Solo HOMBRE
  ['N41', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Enfermedades inflamatorias de la próstata' }],
  ['N42', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Otros trastornos de la próstata' }],
  ['N43', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Hidrocele y espermatocele' }],
  ['N44', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Torsión del testículo' }],
  ['N45', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Orquitis y epididimitis' }],
  ['N46', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Esterilidad masculina' }],
  ['N47', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Prepucio redundante, fimosis y parafimosis' }],
  ['N48', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Otros trastornos del pene' }],
  ['N49', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Trastornos inflamatorios de órganos genitales masculinos en enfermedades clasificadas en otra parte' }],
  ['N50', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Otros trastornos de los órganos genitales masculinos' }],
  ['N51', { sexoPermitido: 'HOMBRE', ruleId: 'C4', descripcion: 'Trastornos de los órganos genitales masculinos en enfermedades clasificadas en otra parte' }],
]);

/**
 * Extrae el prefijo CIE-10 de un código completo
 * Ejemplos: "C50.9" → "C50", "C50" → "C50", "O00" → "O00"
 * 
 * @param cie10Code - Código CIE-10 (formato: "CODE" o "CODE - DESCRIPTION")
 * @returns Prefijo normalizado (uppercase) o null si es inválido
 */
export function getPrefixFromCode(cie10Code: string | null | undefined): string | null {
  if (!cie10Code || typeof cie10Code !== 'string') {
    return null;
  }

  // Primero extraer el código base usando la utilidad existente
  // Esto maneja formatos como "C50 - DESCRIPTION"
  const codeBase = cie10Code.split(' - ')[0].trim().toUpperCase();
  
  if (!codeBase) {
    return null;
  }

  // Extraer prefijo: tomar primeros 3-4 caracteres hasta el punto o fin de cadena
  // CIE-10 tiene formato: Letra + 2 dígitos + opcional punto + subcódigo
  // Ejemplos: "C50" → "C50", "C50.9" → "C50", "O00" → "O00"
  const match = codeBase.match(/^([A-Z][0-9]{2})/);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Obtiene la restricción CIE-10 para un código dado
 * 
 * @param cie10Code - Código CIE-10 (formato: "CODE" o "CODE - DESCRIPTION")
 * @returns Restricción si existe, null si no hay restricción
 */
export function getCIE10Restriction(
  cie10Code: string | null | undefined,
): RestrictionRule | null {
  if (!cie10Code) {
    return null;
  }

  const prefix = getPrefixFromCode(cie10Code);
  if (!prefix) {
    return null;
  }

  return CIE10_RESTRICTIONS.get(prefix) || null;
}

/**
 * Verifica si un código CIE-10 tiene restricciones
 * 
 * @param cie10Code - Código CIE-10
 * @returns true si tiene restricciones, false en caso contrario
 */
export function hasCIE10Restriction(cie10Code: string | null | undefined): boolean {
  return getCIE10Restriction(cie10Code) !== null;
}

