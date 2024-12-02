import { Injectable } from '@nestjs/common';
import { PrinterService } from '../printer/printer.service';
import { antidopingInforme } from './documents/antidoping.informe';
import { certificadoInforme } from './documents/certificado.informe';
import { aptitudPuestoInforme } from './documents/aptitud-puesto.informe';
import { examenVistaInforme } from './documents/examen-vista.informe';
import { exploracionFisicaInforme } from './documents/exploracion-fisica.informe';
import { historiaClinicaInforme } from './documents/historia-clinica.informe';
import { EmpresasService } from '../empresas/empresas.service';
import { TrabajadoresService } from '../trabajadores/trabajadores.service';
import { ExpedientesService } from '../expedientes/expedientes.service';
import { convertirFechaADDMMAAAA, convertirFechaAAAAAMMDD, calcularEdad, calcularAntiguedad } from 'src/utils/dates';
import { findNearestDocument } from 'src/utils/findNearestDocuments';

@Injectable()
export class InformesService {
  constructor(
    private readonly printer: PrinterService,
    private readonly empresasService: EmpresasService,
    private readonly trabajadoresService: TrabajadoresService,
    private readonly expedientesService: ExpedientesService,
  ) {}

  async getInformeAntidoping(
    empresaId: string,
    trabajadorId: string,
    antidopingId: string,
  ): Promise<PDFKit.PDFDocument> {
    const empresa = await this.empresasService.findOne(empresaId);

    const nombreEmpresa = empresa.nombreComercial;

    const trabajador = await this.trabajadoresService.findOne(trabajadorId);

    const datosTrabajador = {
      nombre: trabajador.nombre,
      nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
      escolaridad: trabajador.escolaridad,
      edad: `${calcularEdad(convertirFechaAAAAAMMDD(trabajador.fechaNacimiento))} años`,
      puesto: trabajador.puesto,
      sexo: trabajador.sexo,
      antiguedad: calcularAntiguedad(
        convertirFechaAAAAAMMDD(trabajador.fechaIngreso),
      ),
      telefono: trabajador.telefono,
      estadoCivil: trabajador.estadoCivil,
      hijos: trabajador.hijos,
    };

    const antidoping = await this.expedientesService.findDocument(
      'antidoping',
      antidopingId,
    );

    const datosAntidoping = {
      fechaAntidoping: antidoping.fechaAntidoping,
      marihuana: antidoping.marihuana,
      cocaina: antidoping.cocaina,
      anfetaminas: antidoping.anfetaminas,
      metanfetaminas: antidoping.metanfetaminas,
      opiaceos: antidoping.opiaceos,
    };

    const docDefinition = antidopingInforme(
      nombreEmpresa,
      datosTrabajador,
      datosAntidoping,
    );
    return this.printer.createPdf(docDefinition);
  }
  
  async getInformeAptitudPuesto(
    empresaId: string,
    trabajadorId: string,
    aptitudId: string,
  ): Promise<PDFKit.PDFDocument> {
    const empresa = await this.empresasService.findOne(empresaId);
    const nombreEmpresa = empresa.nombreComercial;

    const trabajador = await this.trabajadoresService.findOne(trabajadorId);
    const datosTrabajador = {
      nombre: trabajador.nombre,
      nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
      escolaridad: trabajador.escolaridad,
      edad: `${calcularEdad(convertirFechaAAAAAMMDD(trabajador.fechaNacimiento))} años`,
      puesto: trabajador.puesto,
      sexo: trabajador.sexo,
      antiguedad: calcularAntiguedad(
        convertirFechaAAAAAMMDD(trabajador.fechaIngreso),
      ),
      telefono: trabajador.telefono,
      estadoCivil: trabajador.estadoCivil,
      hijos: trabajador.hijos,
    };

    const aptitud = await this.expedientesService.findDocument('aptitud', aptitudId);
    const datosAptitud = {
      fechaAptitudPuesto: aptitud.fechaAptitudPuesto,
      evaluacionAdicional1: aptitud.evaluacionAdicional1,
      fechaEvaluacionAdicional1: aptitud.fechaEvaluacionAdicional1,
      resultadosEvaluacionAdicional1: aptitud.resultadosEvaluacionAdicional1,
      evaluacionAdicional2: aptitud.evaluacionAdicional2,
      fechaEvaluacionAdicional2: aptitud.fechaEvaluacionAdicional2,
      resultadosEvaluacionAdicional2: aptitud.resultadosEvaluacionAdicional2,
      evaluacionAdicional3: aptitud.evaluacionAdicional3,
      fechaEvaluacionAdicional3: aptitud.fechaEvaluacionAdicional3,
      resultadosEvaluacionAdicional3: aptitud.resultadosEvaluacionAdicional3,
      evaluacionAdicional4: aptitud.evaluacionAdicional4,
      fechaEvaluacionAdicional4: aptitud.fechaEvaluacionAdicional4,
      resultadosEvaluacionAdicional4: aptitud.resultadosEvaluacionAdicional4,
      evaluacionAdicional5: aptitud.evaluacionAdicional5,
      fechaEvaluacionAdicional5: aptitud.fechaEvaluacionAdicional5,
      resultadosEvaluacionAdicional5: aptitud.resultadosEvaluacionAdicional5,
      evaluacionAdicional6: aptitud.evaluacionAdicional6,
      fechaEvaluacionAdicional6: aptitud.fechaEvaluacionAdicional6,
      resultadosEvaluacionAdicional6: aptitud.resultadosEvaluacionAdicional6,
      aptitudPuesto: aptitud.aptitudPuesto,
      alteracionesSalud: aptitud.alteracionesSalud,
      resultados: aptitud.resultados,
      medidasPreventivas: aptitud.medidasPreventivas,
    };

    const historiasClinicas = await this.expedientesService.findDocuments('historiaClinica', trabajadorId);
    const nearestHistoriaClinica = findNearestDocument(historiasClinicas, aptitud.fechaAptitudPuesto, 'fechaHistoriaClinica');
    const datosHistoriaClinica = {
      fechaHistoriaClinica: nearestHistoriaClinica.fechaHistoriaClinica,
      resumenHistoriaClinica: nearestHistoriaClinica.resumenHistoriaClinica,
    };

    const exploracionesFisicas = await this.expedientesService.findDocuments('exploracionFisica', trabajadorId);
    const nearestExploracionFisica = findNearestDocument(exploracionesFisicas, aptitud.fechaAptitudPuesto, 'fechaExploracionFisica');
    const datosExploracionFisica = {
      fechaExploracionFisica: nearestExploracionFisica.fechaExploracionFisica,
      tensionArterialSistolica: nearestExploracionFisica.tensionArterialSistolica,
      tensionArterialDiastolica: nearestExploracionFisica.tensionArterialDiastolica,
      categoriaTensionArterial: nearestExploracionFisica.categoriaTensionArterial,
      indiceMasaCorporal: nearestExploracionFisica.indiceMasaCorporal,
      categoriaIMC: nearestExploracionFisica.categoriaIMC,
      circunferenciaCintura: nearestExploracionFisica.circunferenciaCintura,
      categoriaCircunferenciaCintura: nearestExploracionFisica.categoriaCircunferenciaCintura,
      resumenExploracionFisica: nearestExploracionFisica.resumenExploracionFisica,
    }

    const examenesVista = await this.expedientesService.findDocuments('examenVista', trabajadorId);
    const nearestExamenVista = findNearestDocument(examenesVista, aptitud.fechaAptitudPuesto, 'fechaExamenVista');
    const datosExamenVista = {
      fechaExamenVista: nearestExamenVista.fechaExamenVista,
      ojoIzquierdoLejanaSinCorreccion: nearestExamenVista.ojoIzquierdoLejanaSinCorreccion,
      ojoDerechoLejanaSinCorreccion: nearestExamenVista.ojoDerechoLejanaSinCorreccion,
      sinCorreccionLejanaInterpretacion: nearestExamenVista.sinCorreccionLejanaInterpretacion,
      ojoIzquierdoLejanaConCorreccion: nearestExamenVista.ojoIzquierdoLejanaConCorreccion,
      ojoDerechoLejanaConCorreccion: nearestExamenVista.ojoDerechoLejanaConCorreccion,
      conCorreccionLejanaInterpretacion: nearestExamenVista.conCorreccionLejanaInterpretacion,
      porcentajeIshihara: nearestExamenVista.porcentajeIshihara,
      interpretacionIshihara: nearestExamenVista.interpretacionIshihara,
    }

    const antidopings = await this.expedientesService.findDocuments('antidoping', trabajadorId);
    const nearestAntidoping = findNearestDocument(antidopings, aptitud.fechaAptitudPuesto, 'fechaAntidoping');
    const datosAntidoping = {
      fechaAntidoping: nearestAntidoping.fechaAntidoping,
      marihuana: nearestAntidoping.marihuana,
      cocaina: nearestAntidoping.cocaina,
      anfetaminas: nearestAntidoping.anfetaminas,
      metanfetaminas: nearestAntidoping.metanfetaminas,
      opiaceos: nearestAntidoping.opiaceos,
    }

    const docDefinition = aptitudPuestoInforme(
      nombreEmpresa,
      datosTrabajador,
      datosAptitud,
      datosHistoriaClinica,
      datosExploracionFisica,
      datosExamenVista,
      datosAntidoping
    );
    return this.printer.createPdf(docDefinition);
  }

  async getInformeCertificado(
    empresaId: string,
    trabajadorId: string,
    certificadoId: string,
  ): Promise<PDFKit.PDFDocument> {
    const empresa = await this.empresasService.findOne(empresaId);
    const nombreEmpresa = empresa.nombreComercial;

    const trabajador = await this.trabajadoresService.findOne(trabajadorId);
    const datosTrabajador = {
      nombre: trabajador.nombre.toUpperCase(),
      nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
      escolaridad: trabajador.escolaridad,
      edad: `${calcularEdad(convertirFechaAAAAAMMDD(trabajador.fechaNacimiento))} años`,
      puesto: trabajador.puesto,
      sexo: trabajador.sexo,
      antiguedad: calcularAntiguedad(
        convertirFechaAAAAAMMDD(trabajador.fechaIngreso),
      ),
      telefono: trabajador.telefono,
      estadoCivil: trabajador.estadoCivil,
      hijos: trabajador.hijos,
    };

    const certificado = await this.expedientesService.findDocument( 'certificado', certificadoId );
    const datosCertificado = {
      fechaCertificado: certificado.fechaCertificado,
      impedimentosFisicos: certificado.impedimentosFisicos,
    };

    const examenesVista = await this.expedientesService.findDocuments('examenVista', trabajadorId);
    const nearestExamenVista = findNearestDocument(examenesVista, certificado.fechaCertificado, 'fechaExamenVista');
    const datosExamenVista = {
      fechaExamenVista: nearestExamenVista.fechaExamenVista,
      ojoIzquierdoLejanaSinCorreccion: nearestExamenVista.ojoIzquierdoLejanaSinCorreccion,
      ojoDerechoLejanaSinCorreccion: nearestExamenVista.ojoDerechoLejanaSinCorreccion,
    }

    const docDefinition = certificadoInforme(
      nombreEmpresa,
      datosTrabajador,
      datosCertificado,
      datosExamenVista
    );
    return this.printer.createPdf(docDefinition);
  }

  async getInformeExamenVista(
    empresaId: string,
    trabajadorId: string,
    examenVistaId: string,
  ): Promise<PDFKit.PDFDocument> {
    const empresa = await this.empresasService.findOne(empresaId);

    const nombreEmpresa = empresa.nombreComercial;

    const trabajador = await this.trabajadoresService.findOne(trabajadorId);

    const datosTrabajador = {
      nombre: trabajador.nombre.toUpperCase(),
      nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
      escolaridad: trabajador.escolaridad,
      edad: `${calcularEdad(convertirFechaAAAAAMMDD(trabajador.fechaNacimiento))} años`,
      puesto: trabajador.puesto,
      sexo: trabajador.sexo,
      antiguedad: calcularAntiguedad(
        convertirFechaAAAAAMMDD(trabajador.fechaIngreso),
      ),
      telefono: trabajador.telefono,
      estadoCivil: trabajador.estadoCivil,
      hijos: trabajador.hijos,
    };

    const examenVista = await this.expedientesService.findDocument(
      'examenVista',
      examenVistaId,
    );

    const datosExamenVista = {
      fechaExamenVista: examenVista.fechaExamenVista,
      ojoIzquierdoLejanaSinCorreccion: examenVista.ojoIzquierdoLejanaSinCorreccion,
      ojoDerechoLejanaSinCorreccion: examenVista.ojoDerechoLejanaSinCorreccion,
      sinCorreccionLejanaInterpretacion: examenVista.sinCorreccionLejanaInterpretacion,
      requiereLentesUsoGeneral: examenVista.requiereLentesUsoGeneral,
      ojoIzquierdoCercanaSinCorreccion: examenVista.ojoIzquierdoCercanaSinCorreccion,
      ojoDerechoCercanaSinCorreccion: examenVista.ojoDerechoCercanaSinCorreccion,
      sinCorreccionCercanaInterpretacion: examenVista.sinCorreccionCercanaInterpretacion,
      requiereLentesParaLectura: examenVista.requiereLentesParaLectura,
      ojoIzquierdoLejanaConCorreccion: examenVista.ojoIzquierdoLejanaConCorreccion,
      ojoDerechoLejanaConCorreccion: examenVista.ojoDerechoLejanaConCorreccion,
      conCorreccionLejanaInterpretacion: examenVista.conCorreccionLejanaInterpretacion,
      ojoIzquierdoCercanaConCorreccion: examenVista.ojoIzquierdoCercanaConCorreccion,
      ojoDerechoCercanaConCorreccion: examenVista.ojoDerechoCercanaConCorreccion,
      conCorreccionCercanaInterpretacion: examenVista.conCorreccionCercanaInterpretacion,
      placasCorrectas: examenVista.placasCorrectas,
      porcentajeIshihara: examenVista.porcentajeIshihara,
      interpretacionIshihara: examenVista.interpretacionIshihara
    };

    const docDefinition = examenVistaInforme(
      nombreEmpresa,
      datosTrabajador,
      datosExamenVista,
    );
    return this.printer.createPdf(docDefinition);
  }

  async getInformeExploracionFisica(
    empresaId: string,
    trabajadorId: string,
    exploracionFisicaId: string,
  ): Promise<PDFKit.PDFDocument> {
    const empresa = await this.empresasService.findOne(empresaId);

    const nombreEmpresa = empresa.nombreComercial;

    const trabajador = await this.trabajadoresService.findOne(trabajadorId);

    const datosTrabajador = {
      nombre: trabajador.nombre,
      nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
      escolaridad: trabajador.escolaridad,
      edad: `${calcularEdad(convertirFechaAAAAAMMDD(trabajador.fechaNacimiento))} años`,
      puesto: trabajador.puesto,
      sexo: trabajador.sexo,
      antiguedad: calcularAntiguedad(
        convertirFechaAAAAAMMDD(trabajador.fechaIngreso),
      ),
      telefono: trabajador.telefono,
      estadoCivil: trabajador.estadoCivil,
      hijos: trabajador.hijos,
    };

    const exploracionFisica = await this.expedientesService.findDocument(
      'exploracionFisica',
      exploracionFisicaId,
    );

    const datosExploracionFisica = {
      fechaExploracionFisica: exploracionFisica.fechaExploracionFisica,
      peso: exploracionFisica.peso,
      altura: exploracionFisica.altura,
      indiceMasaCorporal: exploracionFisica.indiceMasaCorporal,
      categoriaIMC: exploracionFisica.categoriaIMC,
      circunferenciaCintura: exploracionFisica.circunferenciaCintura,
      categoriaCircunferenciaCintura: exploracionFisica.categoriaCircunferenciaCintura,
      tensionArterialSistolica: exploracionFisica.tensionArterialSistolica,
      tensionArterialDiastolica: exploracionFisica.tensionArterialDiastolica,
      categoriaTensionArterial: exploracionFisica.categoriaTensionArterial,
      frecuenciaCardiaca: exploracionFisica.frecuenciaCardiaca,
      categoriaFrecuenciaCardiaca: exploracionFisica.categoriaFrecuenciaCardiaca,
      frecuenciaRespiratoria: exploracionFisica.frecuenciaRespiratoria,
      categoriaFrecuenciaRespiratoria: exploracionFisica.categoriaFrecuenciaRespiratoria,
      saturacionOxigeno: exploracionFisica.saturacionOxigeno,
      categoriaSaturacionOxigeno: exploracionFisica.categoriaSaturacionOxigeno,
      craneoCara: exploracionFisica.craneoCara,
      ojos: exploracionFisica.ojos,
      oidos: exploracionFisica.oidos,
      nariz: exploracionFisica.nariz,
      boca: exploracionFisica.boca,
      cuello: exploracionFisica.cuello,
      hombros: exploracionFisica.hombros,
      codos: exploracionFisica.codos,
      manos: exploracionFisica.manos,
      neurologicoESuperiores: exploracionFisica.neurologicoESuperiores,
      vascularESuperiores: exploracionFisica.vascularESuperiores,
      torax: exploracionFisica.torax,
      abdomen: exploracionFisica.abdomen,
      cadera: exploracionFisica.cadera,
      rodillas: exploracionFisica.rodillas,
      tobillosPies: exploracionFisica.tobillosPies,
      neurologicoEInferiores: exploracionFisica.neurologicoEInferiores,
      vascularEInferiores: exploracionFisica.vascularEInferiores,
      inspeccionColumna: exploracionFisica.inspeccionColumna,
      movimientosColumna: exploracionFisica.movimientosColumna,
      lesionesPiel: exploracionFisica.lesionesPiel,
      cicatrices: exploracionFisica.cicatrices,
      nevos: exploracionFisica.nevos,
      coordinacion: exploracionFisica.coordinacion,
      sensibilidad: exploracionFisica.sensibilidad,
      equilibrio: exploracionFisica.equilibrio,
      marcha: exploracionFisica.marcha,
      resumenExploracionFisica: exploracionFisica.resumenExploracionFisica,
    };

    const docDefinition = exploracionFisicaInforme(
      nombreEmpresa,
      datosTrabajador,
      datosExploracionFisica,
    );
    return this.printer.createPdf(docDefinition);
  }

  async getInformeHistoriaClinica(
    empresaId: string,
    trabajadorId: string,
    historiaClinicaId: string,
  ): Promise<PDFKit.PDFDocument> {
    const empresa = await this.empresasService.findOne(empresaId);

    const nombreEmpresa = empresa.nombreComercial;

    const trabajador = await this.trabajadoresService.findOne(trabajadorId);

    const datosTrabajador = {
      nombre: trabajador.nombre,
      nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
      escolaridad: trabajador.escolaridad,
      edad: `${calcularEdad(convertirFechaAAAAAMMDD(trabajador.fechaNacimiento))} años`,
      puesto: trabajador.puesto,
      sexo: trabajador.sexo,
      antiguedad: calcularAntiguedad(
        convertirFechaAAAAAMMDD(trabajador.fechaIngreso),
      ),
      telefono: trabajador.telefono,
      estadoCivil: trabajador.estadoCivil,
      hijos: trabajador.hijos,
    };

    const historiaClinica = await this.expedientesService.findDocument(
      'historiaClinica',
      historiaClinicaId,
    );

    const datosHistoriaClinica = {
      motivoExamen: historiaClinica.motivoExamen,
      fechaHistoriaClinica: historiaClinica.fechaHistoriaClinica,
      // Antecedentes Heredofamiliares
      nefropatias: historiaClinica.nefropatias,
      nefropatiasEspecificar: historiaClinica.nefropatiasEspecificar,
      diabeticos: historiaClinica.diabeticos,
      diabeticosEspecificar: historiaClinica.diabeticosEspecificar,
      hipertensivos: historiaClinica.hipertensivos,
      hipertensivosEspecificar: historiaClinica.hipertensivosEspecificar,
      cardiopaticos: historiaClinica.cardiopaticos,
      cardiopaticosEspecificar: historiaClinica.cardiopaticosEspecificar,
      neoplasicos: historiaClinica.neoplasicos,
      neoplasicosEspecificar: historiaClinica.neoplasicosEspecificar,
      psiquiatricos: historiaClinica.psiquiatricos,
      psiquiatricosEspecificar: historiaClinica.psiquiatricosEspecificar,
      epilepticos: historiaClinica.epilepticos,
      epilepticosEspecificar: historiaClinica.epilepticosEspecificar,
      leuticos: historiaClinica.leuticos,
      leuticosEspecificar: historiaClinica.leuticosEspecificar,
      fimicos: historiaClinica.fimicos,
      fimicosEspecificar: historiaClinica.fimicosEspecificar,
      hepatopatias: historiaClinica.hepatopatias,
      hepatopatiasEspecificar: historiaClinica.hepatopatiasEspecificar,
      // Antecedentes Personales Patologicos
      lumbalgias: historiaClinica.lumbalgias,
      lumbalgiasEspecificar: historiaClinica.lumbalgiasEspecificar,
      diabeticosPP: historiaClinica.diabeticosPP,
      diabeticosPPEspecificar: historiaClinica.diabeticosPPEspecificar,
      cardiopaticosPP: historiaClinica.cardiopaticosPP,
      cardiopaticosPPEspecificar: historiaClinica.cardiopaticosPPEspecificar,
      alergicos: historiaClinica.alergicos,
      alergicosEspecificar: historiaClinica.alergicosEspecificar,
      hipertensivosPP: historiaClinica.hipertensivosPP,
      hipertensivosPPEspecificar: historiaClinica.hipertensivosPPEspecificar,
      obesidad: historiaClinica.obesidad,
      obesidadEspecificar: historiaClinica.obesidadEspecificar,
      epilepticosPP: historiaClinica.epilepticosPP,
      epilepticosPPEspecificar: historiaClinica.epilepticosPPEspecificar,
      accidentes: historiaClinica.accidentes,
      accidentesEspecificar: historiaClinica.accidentesEspecificar,
      quirurgicos: historiaClinica.quirurgicos,
      quirurgicosEspecificar: historiaClinica.quirurgicosEspecificar,
      traumaticos: historiaClinica.traumaticos,
      traumaticosEspecificar: historiaClinica.traumaticosEspecificar,
      // Antecedentes Personales No Patologicos
      alcoholismo: historiaClinica.alcoholismo,
      alcoholismoEspecificar: historiaClinica.alcoholismoEspecificar,
      tabaquismo: historiaClinica.tabaquismo,
      tabaquismoEspecificar: historiaClinica.tabaquismoEspecificar,
      toxicomanias: historiaClinica.toxicomanias,
      toxicomaniasEspecificar: historiaClinica.toxicomaniasEspecificar,
      alimentacionDeficiente: historiaClinica.alimentacionDeficiente,
      alimentacionDeficienteEspecificar: historiaClinica.alimentacionDeficienteEspecificar,
      actividadFisicaDeficiente: historiaClinica.actividadFisicaDeficiente,
      actividadFisicaDeficienteEspecificar: historiaClinica.actividadFisicaDeficienteEspecificar,
      higienePersonalDeficiente: historiaClinica.higienePersonalDeficiente,
      higienePersonalDeficienteEspecificar: historiaClinica.higienePersonalDeficienteEspecificar,
      // Antecedentes Gineco-Obstetricos
      menarca: historiaClinica.menarca,
      duracionPromedio: historiaClinica.duracionPromedio,
      frecuencia: historiaClinica.frecuencia,
      gestas: historiaClinica.gestas,
      partos: historiaClinica.partos,
      cesareas: historiaClinica.cesareas,
      abortos: historiaClinica.abortos,
      fechaUltimaRegla: historiaClinica.fechaUltimaRegla,
      cantidadDeSangre: historiaClinica.cantidadDeSangre,
      dolorMenstrual: historiaClinica.dolorMenstrual,
      embarazoActual: historiaClinica.embarazoActual,
      planificacionFamiliar: historiaClinica.planificacionFamiliar,
      vidaSexualActiva: historiaClinica.vidaSexualActiva,
      fechaUltimoPapanicolaou: historiaClinica.fechaUltimoPapanicolaou,
      // Antecedentes Laborales
      empresaAnterior1: historiaClinica.empresaAnterior1,
      puestoAnterior1: historiaClinica.puestoAnterior1,
      antiguedadAnterior1: historiaClinica.antiguedadAnterior1,
      agentesAnterior1: historiaClinica.agentesAnterior1,
      empresaAnterior2: historiaClinica.empresaAnterior2,
      puestoAnterior2: historiaClinica.puestoAnterior2,
      antiguedadAnterior2: historiaClinica.antiguedadAnterior2,
      agentesAnterior2: historiaClinica.agentesAnterior2,
      empresaAnterior3: historiaClinica.empresaAnterior3,
      puestoAnterior3: historiaClinica.puestoAnterior3,
      antiguedadAnterior3: historiaClinica.antiguedadAnterior3,
      agentesAnterior3: historiaClinica.agentesAnterior3,
      accidenteLaboral: historiaClinica.accidenteLaboral,
      accidenteLaboralEspecificar: historiaClinica.accidenteLaboralEspecificar,
      descripcionDelDano: historiaClinica.descripcionDelDano,
      secuelas: historiaClinica.secuelas,
      // Resumen
      resumenHistoriaClinica: historiaClinica.resumenHistoriaClinica,
    };

    const docDefinition = historiaClinicaInforme(
      nombreEmpresa,
      datosTrabajador,
      datosHistoriaClinica,
    );
    return this.printer.createPdf(docDefinition);
  }

}
