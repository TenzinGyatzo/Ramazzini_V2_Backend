import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trabajador } from './entities/trabajador.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { normalizeTrabajadorData } from 'src/utils/normalization'
import moment from 'moment';
import * as xlsx from 'xlsx';
import { format } from 'date-fns';
import { calcularEdad, calcularAntiguedad } from 'src/utils/dates';
import { Antidoping } from '../expedientes/schemas/antidoping.schema';
import { AptitudPuesto } from '../expedientes/schemas/aptitud-puesto.schema';
import { Certificado } from '../expedientes/schemas/certificado.schema';
import { DocumentoExterno } from '../expedientes/schemas/documento-externo.schema';
import { ExamenVista } from '../expedientes/schemas/examen-vista.schema';
import { ExploracionFisica } from '../expedientes/schemas/exploracion-fisica.schema';
import { HistoriaClinica } from '../expedientes/schemas/historia-clinica.schema';
import { NotaMedica } from '../expedientes/schemas/nota-medica.schema';
import { FilesService } from '../files/files.service';
import { RiesgoTrabajo } from '../riesgos-trabajo/schemas/riesgo-trabajo.schema';
import { CentroTrabajo } from '../centros-trabajo/schemas/centro-trabajo.schema';

@Injectable()
export class TrabajadoresService {
  constructor(@InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>,
  @InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>,
  @InjectModel(AptitudPuesto.name) private aptitudModel: Model<AptitudPuesto>,
  @InjectModel(Certificado.name) private certificadoModel: Model<Certificado>,
  @InjectModel(DocumentoExterno.name) private documentoExternoModel: Model<DocumentoExterno>,
  @InjectModel(ExamenVista.name) private examenVistaModel: Model<ExamenVista>,
  @InjectModel(ExploracionFisica.name) private exploracionFisicaModel: Model<ExploracionFisica>,
  @InjectModel(HistoriaClinica.name) private historiaClinicaModel: Model<HistoriaClinica>,
  @InjectModel(NotaMedica.name) private notaMedicaModel: Model<NotaMedica>,
  @InjectModel(RiesgoTrabajo.name) private riesgoTrabajoModel: Model<RiesgoTrabajo>,
  @InjectModel(CentroTrabajo.name) private centroTrabajoModel: Model<CentroTrabajo>,
  private filesService: FilesService) {}

  async create(createTrabajadorDto: CreateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(createTrabajadorDto);
    
    // Validar unicidad del número de empleado a nivel empresa si se proporciona
    if (normalizedDto.numeroEmpleado) {
      await this.validateNumeroEmpleadoUniqueness(normalizedDto.numeroEmpleado, normalizedDto.idCentroTrabajo);
    }
    
    try {
      const createdTrabajador = new this.trabajadorModel(normalizedDto);
      const savedTrabajador = await createdTrabajador.save();
      return savedTrabajador;
    } catch (error) {
      console.error('Error al guardar el trabajador:', error);
      throw error;
    }
  }
  
  async findWorkersByCenter(id: string): Promise<Trabajador[]> {
    return await this.trabajadorModel.find({ idCentroTrabajo: id }).exec();
  }

  async findWorkersWithHistoriaDataByCenter(centroId: string): Promise<any[]> {
    // Obtener todos los trabajadores del centro
    const trabajadores = await this.trabajadorModel
      .find({ idCentroTrabajo: centroId })
      .lean();

    // Ordenar por fecha efectiva: fechaTransferencia si existe, sino createdAt
    trabajadores.sort((a, b) => {
      const fechaA = a.fechaTransferencia || (a as any).createdAt;
      const fechaB = b.fechaTransferencia || (b as any).createdAt;
      
      // Orden ascendente (más antiguo primero)
      return new Date(fechaA).getTime() - new Date(fechaB).getTime();
    });
    const trabajadoresIds = trabajadores.map(t => t._id);
  
    // HISTORIAS CLÍNICAS
    const historias = await this.historiaClinicaModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();
  
    const historiasMap = new Map<string, any>();
    for (const historia of historias) {
      const id = historia.idTrabajador.toString();
      const actual = historiasMap.get(id);
      if (!actual || new Date(historia.fechaHistoriaClinica) > new Date(actual.fechaHistoriaClinica)) {
        historiasMap.set(id, historia);
      }
    }
  
    // APTITUD PUESTO
    const aptitudes = await this.aptitudModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();
  
    const aptitudesMap = new Map<string, any>();
    for (const aptitud of aptitudes) {
      const id = aptitud.idTrabajador.toString();
      const actual = aptitudesMap.get(id);
      if (!actual || new Date(aptitud.fechaAptitudPuesto) > new Date(actual.fechaAptitudPuesto)) {
        aptitudesMap.set(id, aptitud);
      }
    }
  
    // EXPLORACIÓN FÍSICA
    const exploraciones = await this.exploracionFisicaModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();
  
    const exploracionesMap = new Map<string, any>();
    for (const exploracion of exploraciones) {
      const id = exploracion.idTrabajador.toString();
      const actual = exploracionesMap.get(id);
      if (!actual || new Date(exploracion.fechaExploracionFisica) > new Date(actual.fechaExploracionFisica)) {
        exploracionesMap.set(id, exploracion);
      }
    }

    // EXÁMENES DE VISTA
    const examenesVista = await this.examenVistaModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();

    const examenesVistaMap = new Map<string, any>();
    for (const examen of examenesVista) {
      const id = examen.idTrabajador.toString();
      const actual = examenesVistaMap.get(id);
      if (!actual || new Date(examen.fechaExamenVista) > new Date(actual.fechaExamenVista)) {
        examenesVistaMap.set(id, examen);
      }
    }

    // CONSULTAS
    const consultas = await this.notaMedicaModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();

    const consultasMap = new Map<string, any>();
    for (const consulta of consultas) {
      const id = consulta.idTrabajador.toString();
      const actual = consultasMap.get(id);
      if (!actual || new Date(consulta.fechaNotaMedica) > new Date(actual.fechaNotaMedica)) {
        consultasMap.set(id, consulta);
      }
    }

    // RIESGOS DE TRABAJO
    const riesgos = await this.riesgoTrabajoModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();

    const riesgosMap = new Map<string, any[]>();
    for (const riesgo of riesgos) {
      const id = riesgo.idTrabajador.toString();
      if (!riesgosMap.has(id)) riesgosMap.set(id, []);
      riesgosMap.get(id).push(riesgo);
    }
  
    // COMBINAR
    const resultado = trabajadores.map(trabajador => {
      const id = trabajador._id.toString();
  
      const historia = historiasMap.get(id);
      const aptitud = aptitudesMap.get(id);
      const exploracion = exploracionesMap.get(id);
      const examenVista = examenesVistaMap.get(id);
      const consulta = consultasMap.get(id);
  
      return {
        ...trabajador,
        historiaClinicaResumen: historia
          ? {
              lumbalgias: historia.lumbalgias ?? null,
              diabeticosPP: historia.diabeticosPP ?? null,
              cardiopaticosPP: historia.cardiopaticosPP ?? null,
              alergicos: historia.alergicos ?? null,
              hipertensivosPP: historia.hipertensivosPP ?? null,
              respiratorios: historia.respiratorios ?? null,
              epilepticosPP: historia.epilepticosPP ?? null,
              accidentes: historia.accidentes ?? null,
              quirurgicos: historia.quirurgicos ?? null,
              traumaticos: historia.traumaticos ?? null,
              alcoholismo: historia.alcoholismoEspecificar ?? null,
              tabaquismo: historia.tabaquismoEspecificar ?? null,
              accidenteLaboral: historia.accidenteLaboral ?? null,
            }
          : null,
        aptitudResumen: aptitud
          ? {
              aptitudPuesto: aptitud.aptitudPuesto ?? null,
            }
          : null,
        exploracionFisicaResumen: exploracion
          ? {
              categoriaIMC: exploracion.categoriaIMC ?? null,
              categoriaCircunferenciaCintura: exploracion.categoriaCircunferenciaCintura ?? null,
              categoriaTensionArterial: exploracion.categoriaTensionArterial ?? null,
              resumenExploracionFisica: exploracion.resumenExploracionFisica ?? null,
            }
          : null,
        examenVistaResumen: examenVista
          ? {
              requiereLentesUsoGeneral: examenVista.requiereLentesUsoGeneral ?? null,
              interpretacionIshihara: examenVista.interpretacionIshihara ?? null,
              sinCorreccionLejanaInterpretacion: examenVista.sinCorreccionLejanaInterpretacion ?? null,
              ojoIzquierdoLejanaConCorreccion: examenVista.ojoIzquierdoLejanaConCorreccion ?? null,
              ojoDerechoLejanaConCorreccion: examenVista.ojoDerechoLejanaConCorreccion ?? null,
            }
          : null,
        consultaResumen: consulta
          ? {
              fechaNotaMedica: format(new Date(consulta.fechaNotaMedica), 'dd/MM/yyyy') ?? null,
            }
          : null,
          riesgosTrabajo: riesgosMap.get(id) ?? [],
      };
    });
  
    return resultado;
  } 

  async findRiesgosTrabajoPorEmpresa(empresaId: string): Promise<any[]> {
    // Paso 1: Obtener los centros de trabajo de la empresa
    const centros = await this.centroTrabajoModel
      .find({ idEmpresa: empresaId }, '_id')
      .lean();
  
    const centroIds = centros.map(c => c._id);
  
    if (centroIds.length === 0) return [];
  
    // Paso 2: Obtener los trabajadores de esos centros
    const trabajadores = await this.trabajadorModel
      .find({ idCentroTrabajo: { $in: centroIds } }, '_id nombre sexo puesto fechaNacimiento fechaIngreso idCentroTrabajo numeroEmpleado')
      .lean();
  
    const trabajadoresIds = trabajadores.map(t => t._id);
  
    if (trabajadoresIds.length === 0) return [];
  
    // Paso 3: Obtener los riesgos de esos trabajadores
    const riesgos = await this.riesgoTrabajoModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();
  
    const trabajadoresMap = new Map<string, any>();
    for (const trabajador of trabajadores) {
      trabajadoresMap.set(trabajador._id.toString(), trabajador);
    }
  
    const riesgosEnriquecidos = riesgos.map(riesgo => {
      const trabajador = trabajadoresMap.get(riesgo.idTrabajador.toString());
  
      return {
        ...riesgo,
        nombreTrabajador: trabajador?.nombre ?? 'Desconocido',
        sexoTrabajador: trabajador?.sexo ?? '',
        puestoTrabajador: trabajador?.puesto ?? '',
        fechaNacimiento: trabajador?.fechaNacimiento ?? null,
        fechaIngreso: trabajador?.fechaIngreso ?? null,
        idCentroTrabajo: trabajador?.idCentroTrabajo ?? null,
        numeroEmpleado: trabajador?.numeroEmpleado ?? null,
      };
    });
  
    return riesgosEnriquecidos;
  }   
  
  async findSexosYFechasNacimientoActivos(centroId: string): Promise<any[]> {
    const resultados = await this.trabajadorModel.find({ 
      idCentroTrabajo: centroId,
      estadoLaboral: 'Activo',
      sexo: { $exists: true }, 
      fechaNacimiento: { $exists: true } 
    }, 'sexo fechaNacimiento').lean();

    return resultados.map(trabajador => ({
      // id: trabajador._id,
      sexo: trabajador.sexo,
      fechaNacimiento: trabajador.fechaNacimiento
    }));
  }

  // trabajadores.service.ts
  async getDashboardData(centroId: string, inicio?: string, fin?: string) {
    // 0. Creaar el filtro de rango dde fechas para cada tipo
    const rangoFecha = (campo: string) => {
      if (!inicio || !fin) return {};
      return {
        [campo]: {
          $gte: new Date(inicio),
          $lte: new Date(fin)
        }
      };
    };

    // 1. Obtener todos los trabajadores del centro
    const trabajadores = await this.trabajadorModel
      .find({ idCentroTrabajo: centroId })
      .select('_id estadoLaboral sexo fechaNacimiento agentesRiesgoActuales') // solo lo necesario
      .lean();

    // 2. Separar trabajadores activos e inactivos
    const trabajadoresActivos = trabajadores.filter(t => t.estadoLaboral === 'Activo');
    const trabajadoresInactivos = trabajadores.filter(t => t.estadoLaboral === 'Inactivo');

    // 3. Obtener arrays de IDs
    const idsActivos = trabajadoresActivos.map(t => t._id);
    const idsTodos = trabajadores.map(t => t._id); // algunos gráficos usan ambos

    // 4. Prepara base del objeto de retorno
    const dashboardData = {
      grupoEtario: [ // agrupado por centro
        trabajadoresActivos.map(t => ({
          sexo: t.sexo,
          fechaNacimiento: t.fechaNacimiento
        }))
      ],
      agentesRiesgo: [
        trabajadoresActivos.map(t => ({
          agentesRiesgoActuales: t.agentesRiesgoActuales,
        })),
      ],
      imc: [],
      circunferenciaCintura: [],
      tensionArterial: [],
      alcoholYTabaco: [],
      enfermedadesCronicas: [],
      antecedentes: [],
      agudezaVisual: [],
      daltonismo: [],
      aptitudes: [],
      consultas: [],
      trabajadoresEvaluados: []
    };

    // 5. EXPLORACIONES FÍSICAS – Obtener la más reciente por trabajador activo
    const exploraciones = await this.exploracionFisicaModel
    .find({ idTrabajador: { $in: idsActivos }, ...rangoFecha('fechaExploracionFisica') })
    .select('idTrabajador categoriaIMC categoriaCircunferenciaCintura categoriaTensionArterial fechaExploracionFisica')
    .lean();

    const exploracionesMap = new Map<string, any>();
    for (const exploracion of exploraciones) {
    const id = exploracion.idTrabajador.toString();
    const actual = exploracionesMap.get(id);
    if (!actual || new Date(exploracion.fechaExploracionFisica) > new Date(actual.fechaExploracionFisica)) {
      exploracionesMap.set(id, exploracion);
    }
    }

    dashboardData.imc.push(
    Array.from(exploracionesMap.values()).map((exploracion) => ({
      categoriaIMC: exploracion.categoriaIMC ?? null
    }))
    );

    // 6. CIRCUNFERENCIA DE CINTURA – Usar la misma exploración más reciente
    dashboardData.circunferenciaCintura.push(
      Array.from(exploracionesMap.values()).map((exploracion) => ({
        categoriaCircunferenciaCintura: exploracion.categoriaCircunferenciaCintura ?? null
      }))
    );

    // 7. TENSIÓN ARTERIAL – Usar la misma exploración más reciente
    dashboardData.tensionArterial.push(
      Array.from(exploracionesMap.values()).map((exploracion) => ({
        categoriaTensionArterial: exploracion.categoriaTensionArterial ?? null
      }))
    );

    // 8. HISTORIAS CLÍNICAS – Obtener la más reciente por trabajador activo
    const historias = await this.historiaClinicaModel
    .find({ idTrabajador: { $in: idsActivos }, ...rangoFecha('fechaHistoriaClinica') })
    .select('idTrabajador alcoholismo tabaquismo diabeticosPP hipertensivosPP cardiopaticosPP epilepticosPP respiratorios alergicos lumbalgias accidentes quirurgicos traumaticos fechaHistoriaClinica')
    .lean();

    const historiasMap = new Map<string, any>();
    for (const historia of historias) {
    const id = historia.idTrabajador.toString();
    const actual = historiasMap.get(id);
    if (!actual || new Date(historia.fechaHistoriaClinica) > new Date(actual.fechaHistoriaClinica)) {
      historiasMap.set(id, historia);
    }
    }

    // 9. ALCOHOL Y TABACO
    dashboardData.alcoholYTabaco.push(
    Array.from(historiasMap.values()).map((historia) => ({
      alcoholismo: historia.alcoholismo ?? null,
      tabaquismo: historia.tabaquismo ?? null
    }))
    );

    // 10. ENFERMEDADES CRÓNICAS
    dashboardData.enfermedadesCronicas.push(
      Array.from(historiasMap.values()).map((historia) => ({
        diabeticosPP: historia.diabeticosPP ?? null,
        hipertensivosPP: historia.hipertensivosPP ?? null,
        cardiopaticosPP: historia.cardiopaticosPP ?? null,
        epilepticosPP: historia.epilepticosPP ?? null,
        respiratorios: historia.respiratorios ?? null,
        alergicos: historia.alergicos ?? null
      }))
    );

    // 11. ANTECEDENTES TRAUMÁTICOS O LOCALIZADOS
    dashboardData.antecedentes.push(
      Array.from(historiasMap.values()).map((historia) => ({
        lumbalgias: historia.lumbalgias ?? null,
        accidentes: historia.accidentes ?? null,
        quirurgicos: historia.quirurgicos ?? null,
        traumaticos: historia.traumaticos ?? null
      }))
    );

    // 12. EXÁMENES DE VISTA – Obtener el más reciente por trabajador activo
    const examenesVista = await this.examenVistaModel
    .find({ idTrabajador: { $in: idsActivos }, ...rangoFecha('fechaExamenVista') })
    .select('idTrabajador requiereLentesUsoGeneral ojoIzquierdoLejanaSinCorreccion ojoDerechoLejanaSinCorreccion sinCorreccionLejanaInterpretacion ojoIzquierdoLejanaConCorreccion ojoDerechoLejanaConCorreccion conCorreccionLejanaInterpretacion interpretacionIshihara fechaExamenVista')
    .lean();

    const examenesMap = new Map<string, any>();
    for (const examen of examenesVista) {
    const id = examen.idTrabajador.toString();
    const actual = examenesMap.get(id);
    if (!actual || new Date(examen.fechaExamenVista) > new Date(actual.fechaExamenVista)) {
      examenesMap.set(id, examen);
    }
    }

    // 13. AGUDEZA VISUAL
    dashboardData.agudezaVisual.push(
    Array.from(examenesMap.values()).map((examen) => ({
      requiereLentesUsoGeneral: examen.requiereLentesUsoGeneral ?? null,
      ojoIzquierdoLejanaSinCorreccion: examen.ojoIzquierdoLejanaSinCorreccion ?? null,
      ojoDerechoLejanaSinCorreccion: examen.ojoDerechoLejanaSinCorreccion ?? null,
      sinCorreccionLejanaInterpretacion: examen.sinCorreccionLejanaInterpretacion ?? null,
      ojoIzquierdoLejanaConCorreccion: examen.ojoIzquierdoLejanaConCorreccion ?? null,
      ojoDerechoLejanaConCorreccion: examen.ojoDerechoLejanaConCorreccion ?? null,
      conCorreccionLejanaInterpretacion: examen.conCorreccionLejanaInterpretacion ?? null,
    }))
    );

    // 14. DALTONISMO
    dashboardData.daltonismo.push(
      Array.from(examenesMap.values()).map((examen) => ({
        interpretacionIshihara: examen.interpretacionIshihara ?? null
      }))
    );

    // 15. APTITUD PUESTO – Obtener la más reciente por trabajador (activo o inactivo)
    const aptitudes = await this.aptitudModel
    .find({ idTrabajador: { $in: idsTodos }, ...rangoFecha('fechaAptitudPuesto') })
    .select('idTrabajador aptitudPuesto fechaAptitudPuesto')
    .lean();

    const aptitudesMap = new Map<string, any>();
    for (const aptitud of aptitudes) {
    const id = aptitud.idTrabajador.toString();
    const actual = aptitudesMap.get(id);
    if (!actual || new Date(aptitud.fechaAptitudPuesto) > new Date(actual.fechaAptitudPuesto)) {
      aptitudesMap.set(id, aptitud);
    }
    }

    dashboardData.aptitudes.push(
    Array.from(aptitudesMap.values()).map((aptitud) => ({
      aptitudPuesto: aptitud.aptitudPuesto ?? null
    }))
    );

    // 16. CONSULTAS – Obtener todas las notas médicas por trabajador (activo o inactivo)
    const consultas = await this.notaMedicaModel
      .find({ idTrabajador: { $in: idsTodos }, ...rangoFecha('fechaNotaMedica') })
      .select('idTrabajador fechaNotaMedica')
      .lean();

    // Se incluyen todas las consultas, no solo la más reciente
    dashboardData.consultas.push(
      consultas.map((consulta) => ({
        fechaNotaMedica: consulta.fechaNotaMedica ?? null,
      }))
    );

    const trabajadoresEvaluadosSet = new Set([
      ...exploracionesMap.keys(),
      ...historiasMap.keys(),
      ...examenesMap.keys(),
      ...aptitudesMap.keys(),
    ]);

    dashboardData.trabajadoresEvaluados = Array.from(trabajadoresEvaluadosSet);

    // Si hay filtro de fechas, obtener solo trabajadores con evaluaciones en el período
    let trabajadoresFiltrados = trabajadoresActivos;
    
    if (inicio && fin) {
      // Obtener IDs de trabajadores que tienen evaluaciones en el período
      const trabajadoresConEvaluaciones = new Set([
        ...exploracionesMap.keys(),
        ...historiasMap.keys(),
        ...examenesMap.keys(),
        ...aptitudesMap.keys(),
      ]);
      
      // Filtrar trabajadores activos que tienen evaluaciones en el período
      trabajadoresFiltrados = trabajadoresActivos.filter(t => 
        trabajadoresConEvaluaciones.has(t._id.toString())
      );
    }

    // Para agentes de riesgo, mostrar trabajadores filtrados por período
    dashboardData.agentesRiesgo = [
      trabajadoresFiltrados.map(t => ({
        agentesRiesgoActuales: t.agentesRiesgoActuales,
      }))
    ];

    // Para grupos etarios y distribución por sexo, mostrar trabajadores filtrados por período
    dashboardData.grupoEtario = [
      trabajadoresFiltrados.map(t => ({
        sexo: t.sexo,
        fechaNacimiento: t.fechaNacimiento
      }))
    ];

    return dashboardData;
  }

  async findOne(id: string): Promise<any> {
    // 1. Obtener al trabajador
    const trabajador = await this.trabajadorModel.findById(id).lean();
    if (!trabajador) throw new Error('Trabajador no encontrado');
  
    // 2. Obtener los riesgos de trabajo
    const riesgos = await this.riesgoTrabajoModel
      .find({ idTrabajador: id })
      .sort({ fechaRiesgo: -1 })
      .lean();
  
    // 3. Adjuntar y retornar
    return {
      ...trabajador,
      riesgosTrabajo: riesgos
    };
  }

  async update(id: string, updateTrabajadorDto: UpdateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(updateTrabajadorDto);
    
    // Validar unicidad del número de empleado a nivel empresa si se proporciona
    if (normalizedDto.numeroEmpleado) {
      // Obtener el trabajador actual para verificar si está cambiando el número
      const trabajadorActual = await this.trabajadorModel.findById(id).exec();
      if (!trabajadorActual) {
        throw new BadRequestException('Trabajador no encontrado');
      }
      
      // Solo validar si el número está cambiando
      if (trabajadorActual.numeroEmpleado !== normalizedDto.numeroEmpleado) {
        await this.validateNumeroEmpleadoUniqueness(normalizedDto.numeroEmpleado, trabajadorActual.idCentroTrabajo.toString());
      }
    }
    
    return await this.trabajadorModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  async transferirTrabajador(trabajadorId: string, nuevoCentroId: string, updatedBy: string): Promise<Trabajador> {
    // Validar que el trabajador existe
    const trabajador = await this.trabajadorModel.findById(trabajadorId).exec();
    if (!trabajador) {
      throw new BadRequestException('Trabajador no encontrado');
    }

    // Validar que el nuevo centro de trabajo existe
    const nuevoCentro = await this.centroTrabajoModel.findById(nuevoCentroId).exec();
    if (!nuevoCentro) {
      throw new BadRequestException('Centro de trabajo destino no encontrado');
    }

    // Validar que no se está transfiriendo al mismo centro
    if (trabajador.idCentroTrabajo.toString() === nuevoCentroId) {
      throw new BadRequestException('El trabajador ya pertenece a este centro de trabajo');
    }

    // Validar unicidad del número de empleado en el nuevo centro si existe
    // if (trabajador.numeroEmpleado) {
    //   await this.validateNumeroEmpleadoUniqueness(trabajador.numeroEmpleado, nuevoCentroId);
    // }

    // Actualizar el centro de trabajo del trabajador y establecer fecha de transferencia
    const trabajadorActualizado = await this.trabajadorModel.findByIdAndUpdate(
      trabajadorId,
      {
        idCentroTrabajo: nuevoCentroId,
        updatedBy: updatedBy,
        fechaTransferencia: new Date()
      },
      { new: true }
    ).exec();

    return trabajadorActualizado;
  }

  private processWorkerData(worker) {
      return {
        nombre: worker.nombre ? String(worker.nombre).trim() : '',
        fechaNacimiento: moment(worker.fechaNacimiento, 'DD/MM/YYYY').isValid() 
            ? moment(worker.fechaNacimiento, 'DD/MM/YYYY').toDate()  // Conversión a Date
            : null,
        sexo: worker.sexo ? String(worker.sexo).trim() : '',
        escolaridad: worker.escolaridad ? String(worker.escolaridad).trim() : '',
        puesto: worker.puesto ? String(worker.puesto).trim() : '',
        fechaIngreso: moment(worker.fechaIngreso, 'DD/MM/YYYY').isValid()
            ? moment(worker.fechaIngreso, 'DD/MM/YYYY').toDate()  // Conversión a Date
            : null,
        telefono: worker.telefono ? String(worker.telefono).trim() : '',
        estadoCivil: worker.estadoCivil ? String(worker.estadoCivil).trim() : '',
        numeroEmpleado: worker.numeroEmpleado ? String(worker.numeroEmpleado).trim() : '',
        agentesRiesgoActuales: worker.agentesRiesgoActuales || [],
        estadoLaboral: worker.estadoLaboral ? String(worker.estadoLaboral).trim() : 'Activo',
        idCentroTrabajo: worker.idCentroTrabajo,
        createdBy: worker.createdBy,
        updatedBy: worker.updatedBy,
    };
  }

  // Método para importar trabajadores
  async importarTrabajadores(data: any[], idCentroTrabajo: string, createdBy: string) {
    const resultados = [];

    for (const worker of data) {
        const processedWorker = this.processWorkerData({
            ...worker,
            idCentroTrabajo,
            createdBy,
            updatedBy: createdBy
        });

        try {
            const nuevoTrabajador = await this.create(processedWorker);
            resultados.push({ success: true, worker: nuevoTrabajador });
        } catch (error) {
            console.error(`Error al crear el trabajador ${worker.nombre}:`, error.message);
            resultados.push({ success: false, error: error.message, worker });
        }
    }

    const hasErrors = resultados.some((r) => !r.success);
    if (hasErrors) {
        throw new BadRequestException({
            message: 'Hubo un error, por favor utilice la plantilla.',
            data: resultados.filter((r) => !r.success),
        });
    }

    return { message: 'Trabajadores importados exitosamente', data: resultados };
  }

  private buildFilePath(basePath: string, doc: any): string {
    
    if (!doc) {
      console.log(`[DEBUG] Documento inválido.`);
      return '';
    }
  
    // Mapeo de campos de fecha por tipo de documento
    const dateFields: Record<string, string> = {
      HistoriaClinica: 'fechaHistoriaClinica',
      ExploracionFisica: 'fechaExploracionFisica',
      ExamenVista: 'fechaExamenVista',
      Antidoping: 'fechaAntidoping',
      AptitudPuesto: 'fechaAptitudPuesto',
      Certificado: 'fechaCertificado',
      DocumentoExterno: 'fechaDocumento', // Este es clave para Documento Externo
      NotaMedica: 'fechaNotaMedica',
    };
  
    // Determinar el tipo de documento con el nombre del modelo en Mongoose
    const modelName = doc.constructor.modelName;
    const fechaCampo = dateFields[modelName] || 'createdAt'; // Usar createdAt si no hay fecha específica
  
    if (!doc[fechaCampo]) {
      return '';
    }
  
    // ⚠️ Convertir la fecha a string ISO si es un objeto Date
    const fechaISO = doc[fechaCampo] instanceof Date ? doc[fechaCampo].toISOString() : doc[fechaCampo];
    
    if (typeof fechaISO !== 'string' || !fechaISO.includes('T')) {
      console.log(`[ERROR] La fecha no está en el formato esperado.`);
      return '';
    }
  
    // Extraer manualmente el día, mes y año sin que JavaScript lo ajuste
    const [year, month, day] = fechaISO.split('T')[0].split('-'); // Extrae "2025", "03", "12"
    const fecha = `${day}-${month}-${year}`; // Formato DD-MM-YYYY
  
    // Mapeo de nombres de documentos para generar el nombre del archivo
    const documentTypes: Record<string, string> = {
      HistoriaClinica: 'Historia Clinica',
      ExploracionFisica: 'Exploracion Fisica',
      ExamenVista: 'Examen Vista',
      Antidoping: 'Antidoping',
      AptitudPuesto: 'Aptitud',
      Certificado: 'Certificado',
      NotaMedica: 'Nota Medica',
    };
  
    // Si es un Documento Externo, construir el nombre dinámicamente
    let fullPath = '';
  
    if (modelName === 'DocumentoExterno') {
      if (!doc.nombreDocumento || !doc.extension) {
        console.log(`[ERROR] Documento Externo sin nombre o sin extensión.`);
        return '';
      }
      fullPath = `${basePath}/${doc.nombreDocumento} ${fecha}${doc.extension}`;
    } else {
      const tipoDocumento = documentTypes[modelName] || 'Documento';
      fullPath = `${basePath}/${tipoDocumento} ${fecha}.pdf`;
    }
  
    // Limpiar cualquier doble barra accidental en la ruta
    fullPath = fullPath.replace(/\/\//g, '/');
  
    // console.log(`[DEBUG] Ruta generada: ${fullPath}`);
  
    return fullPath;
  }

  private async eliminarArchivosDeDocumentos(documentos: any[]): Promise<boolean> {
    if (documentos.length === 0) return true;
  
    console.log(`[DEBUG] Verificando eliminación de ${documentos.length} archivos asociados...`);
  
    let eliminacionesExitosas = 0;
    let erroresEncontrados = 0;
    const archivosAEliminar: string[] = [];
  
    try {
      // 1️⃣ Verificar que los archivos existen antes de eliminarlos
      for (const doc of documentos) {
        let fullPath = '';
  
        if ('rutaPDF' in doc && doc.rutaPDF) {
          fullPath = this.buildFilePath(doc.rutaPDF, doc);
        } else if ('rutaDocumento' in doc && doc.rutaDocumento) {
          fullPath = this.buildFilePath(doc.rutaDocumento, doc);
        }
  
        if (!fullPath) continue;
  
        archivosAEliminar.push(fullPath);
      }
  
      // Si no hay archivos a eliminar, salir exitosamente
      if (archivosAEliminar.length === 0) return true;
  
      console.log(`[DEBUG] Se han identificado ${archivosAEliminar.length} archivos a eliminar.`);
  
      // 2️⃣ Intentar eliminar los archivos solo después de confirmar la eliminación en la base de datos
      await Promise.all(
        archivosAEliminar.map(async (filePath) => {
          try {
            await this.filesService.deleteFile(filePath);
            eliminacionesExitosas++;
          } catch (error) {
            erroresEncontrados++;
            console.error(`[ERROR] No se pudo eliminar el archivo ${filePath}: ${error.message}`);
          }
        })
      );
  
      console.log(
        `[DEBUG] Eliminación de archivos completada. Exitosos: ${eliminacionesExitosas}, Errores: ${erroresEncontrados}`
      );
  
      return erroresEncontrados === 0;
    } catch (error) {
      console.error(`[ERROR] Error en la eliminación de archivos: ${error.message}`);
      return false;
    }
  }
  
  async remove(id: string): Promise<boolean> {
    const session = await this.trabajadorModel.db.startSession();
  
    try {
      await session.withTransaction(async () => {
        // console.log(`[DEBUG] Eliminando Trabajador con ID: ${id}...`);
  
        // 1️⃣ Buscar documentos del trabajador
        const documentos = (
          await Promise.all([
            this.historiaClinicaModel.find({ idTrabajador: id }).session(session).exec(),
            this.exploracionFisicaModel.find({ idTrabajador: id }).session(session).exec(),
            this.examenVistaModel.find({ idTrabajador: id }).session(session).exec(),
            this.antidopingModel.find({ idTrabajador: id }).session(session).exec(),
            this.aptitudModel.find({ idTrabajador: id }).session(session).exec(),
            this.certificadoModel.find({ idTrabajador: id }).session(session).exec(),
            this.documentoExternoModel.find({ idTrabajador: id }).session(session).exec(),
            this.notaMedicaModel.find({ idTrabajador: id }).session(session).exec(),
            this.riesgoTrabajoModel.find({ idTrabajador: id }).session(session).exec(),
          ])
        ).flat();
  
        if (documentos.length > 0) {
          // console.log(`[DEBUG] Verificando que se pueden eliminar ${documentos.length} documentos asociados...`);
  
          // 2️⃣ Intentar eliminar los documentos en la base de datos primero
          await Promise.all([
            this.historiaClinicaModel.deleteMany({ idTrabajador: id }).session(session),
            this.exploracionFisicaModel.deleteMany({ idTrabajador: id }).session(session),
            this.examenVistaModel.deleteMany({ idTrabajador: id }).session(session),
            this.antidopingModel.deleteMany({ idTrabajador: id }).session(session),
            this.aptitudModel.deleteMany({ idTrabajador: id }).session(session),
            this.certificadoModel.deleteMany({ idTrabajador: id }).session(session),
            this.documentoExternoModel.deleteMany({ idTrabajador: id }).session(session),
            this.notaMedicaModel.deleteMany({ idTrabajador: id }).session(session),
            this.riesgoTrabajoModel.deleteMany({ idTrabajador: id }).session(session),
          ]);
  
          // 3️⃣ Si la eliminación en la base de datos fue exitosa, proceder a eliminar los archivos
          console.log(`[DEBUG] Eliminación de registros en la base de datos completada. Procediendo con eliminación de archivos...`);
          const eliminacionExitosa = await this.eliminarArchivosDeDocumentos(documentos);
          if (!eliminacionExitosa) {
            throw new Error('Error eliminando archivos.');
          }
        } else {
          console.log(`[DEBUG] No hay documentos asociados, eliminando directamente el Trabajador.`);
        }
  
        // 4️⃣ Eliminar el trabajador
        const result = await this.trabajadorModel.findByIdAndDelete(id).session(session);
  
        if (!result) {
          throw new Error(`No se pudo eliminar el Trabajador con ID: ${id}.`);
        }
      });
  
      session.endSession();
      return true;
    } catch (error) {
      console.error(`[ERROR] ${error.message}`);
      session.endSession();
      return false;
    }
  }

  async exportarTrabajadores(idCentroTrabajo: string): Promise<Buffer> {
    // Consultar trabajadores del centro de trabajo especificado
    const trabajadores = await this.trabajadorModel.find({ idCentroTrabajo }).exec();

    // Convertir los datos en un arreglo de objetos para el archivo Excel, usando edad y antigüedad
    const trabajadoresData = trabajadores.map(trabajador => {
      // Convertir las fechas a formato string 'YYYY-MM-DD' para usar en calcularEdad y calcularAntiguedad
      const fechaNacimientoStr = trabajador.fechaNacimiento
        ? moment(trabajador.fechaNacimiento).format('YYYY-MM-DD')
        : null;
      const fechaIngresoStr = trabajador.fechaIngreso
        ? moment(trabajador.fechaIngreso).format('YYYY-MM-DD')
        : null;

      return {
        Nombre: trabajador.nombre,
        Edad: fechaNacimientoStr ? `${calcularEdad(fechaNacimientoStr)} años` : 'Desconocido',
        Sexo: trabajador.sexo,
        Escolaridad: trabajador.escolaridad,
        Puesto: trabajador.puesto,
        Antiguedad: fechaIngresoStr ? calcularAntiguedad(fechaIngresoStr) : 'Desconocido',
        Telefono: trabajador.telefono,
        EstadoCivil: trabajador.estadoCivil,
        NumeroEmpleado: trabajador.numeroEmpleado || ''
      };
    });

    // Crear un nuevo libro y hoja de trabajo
    const worksheet = xlsx.utils.json_to_sheet(trabajadoresData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

    // Convertir el libro a un buffer
    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }

  /**
   * Valida que el número de empleado sea único a nivel empresa
   * @param numeroEmpleado - Número de empleado a validar
   * @param idCentroTrabajo - ID del centro de trabajo
   * @throws BadRequestException si el número ya existe en la empresa
   */
  private async validateNumeroEmpleadoUniqueness(numeroEmpleado: string, idCentroTrabajo: string): Promise<void> {
    // Obtener el centro de trabajo para encontrar la empresa
    const centroTrabajo = await this.centroTrabajoModel.findById(idCentroTrabajo).exec();
    if (!centroTrabajo) {
      throw new BadRequestException('Centro de trabajo no encontrado');
    }

    // Buscar todos los centros de trabajo de la misma empresa
    const centrosEmpresa = await this.centroTrabajoModel.find({ 
      idEmpresa: centroTrabajo.idEmpresa 
    }).exec();
    
    const idsCentrosEmpresa = centrosEmpresa.map(ct => ct._id);

    // Verificar si ya existe un trabajador con ese número en la empresa
    const trabajadorExistente = await this.trabajadorModel.findOne({
      numeroEmpleado: numeroEmpleado,
      idCentroTrabajo: { $in: idsCentrosEmpresa }
    }).exec();

    if (trabajadorExistente) {
      throw new BadRequestException(`El número de empleado ${numeroEmpleado} ya está registrado`);
    }
  }
}
