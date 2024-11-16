import { Injectable } from '@nestjs/common';
import { PrinterService } from '../printer/printer.service';
import { antidopingInforme } from './documents/antidoping.informe';
import { aptitudPuestoInforme } from './documents/aptitud-puesto.informe';
import { TrabajadoresService } from '../trabajadores/trabajadores.service';
import { ExpedientesService } from '../expedientes/expedientes.service';
import { convertirFechaADDMMAAAA, calcularEdad, calcularAntiguedad } from 'src/utils/dates';

@Injectable()
export class InformesService {
    constructor(
        private readonly printer: PrinterService,
        private readonly trabajadoresService: TrabajadoresService,
        private readonly expedientesService: ExpedientesService
    ) {}

    async getInformeAntidoping(trabajadorId: string, antidopingId: string): Promise<PDFKit.PDFDocument> {
        const trabajador = await this.trabajadoresService.findOne(trabajadorId);

        const datosTrabajador = {
          nombre: trabajador.nombre,
          nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
          escolaridad: trabajador.escolaridad,
          edad: `${calcularEdad(convertirFechaADDMMAAAA(trabajador.fechaNacimiento))} años`,
          puesto: trabajador.puesto,
          sexo: trabajador.sexo,
          antiguedad: calcularAntiguedad(convertirFechaADDMMAAAA(trabajador.fechaIngreso)),
          telefono: trabajador.telefono,
          estadoCivil: trabajador.estadoCivil,
          hijos: trabajador.hijos
        };

        const antidoping = await this.expedientesService.findDocument('antidoping', antidopingId);

        const datosAntidoping = {
          fechaAntidoping: antidoping.fechaAntidoping,
          marihuana: antidoping.marihuana,
          cocaina: antidoping.cocaina,
          anfetaminas: antidoping.anfetaminas,
          metanfetaminas: antidoping.metanfetaminas,
          opiaceos: antidoping.opiaceos
        };

        const docDefinition = antidopingInforme(datosTrabajador, datosAntidoping);
        return this.printer.createPdf(docDefinition);
    }

    async getInformeAptitudPuesto(trabajadorId: string, aptitudId: string): Promise<PDFKit.PDFDocument> {
        const trabajador = await this.trabajadoresService.findOne(trabajadorId);

        const datosTrabajador = {
          nombre: trabajador.nombre,
          nacimiento: convertirFechaADDMMAAAA(trabajador.fechaNacimiento),
          escolaridad: trabajador.escolaridad,
          edad: `${calcularEdad(convertirFechaADDMMAAAA(trabajador.fechaNacimiento))} años`,
          puesto: trabajador.puesto,
          sexo: trabajador.sexo,
          antiguedad: calcularAntiguedad(convertirFechaADDMMAAAA(trabajador.fechaIngreso)),
          telefono: trabajador.telefono,
          estadoCivil: trabajador.estadoCivil,
          hijos: trabajador.hijos
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
          medidasPreventivas: aptitud.medidasPreventivas
        };

        const docDefinition = aptitudPuestoInforme(datosTrabajador, datosAptitud);
        return this.printer.createPdf(docDefinition);
    }
}