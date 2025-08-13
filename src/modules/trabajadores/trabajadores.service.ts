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
      const result = {
        nombre: worker.nombre ? String(worker.nombre).trim() : '',
        fechaNacimiento: this.parseDate(worker.fechaNacimiento),
        sexo: worker.sexo ? String(worker.sexo).trim() : '',
        escolaridad: worker.escolaridad ? String(worker.escolaridad).trim() : '',
        puesto: worker.puesto ? String(worker.puesto).trim() : '',
        fechaIngreso: this.parseDate(worker.fechaIngreso),
        telefono: worker.telefono ? String(worker.telefono).trim() : '',
        estadoCivil: worker.estadoCivil ? String(worker.estadoCivil).trim() : '',
        numeroEmpleado: worker.numeroEmpleado ? String(worker.numeroEmpleado).trim() : '',
        agentesRiesgoActuales: worker.agentesRiesgoActuales || [],
        estadoLaboral: 'Activo', // ✅ VALOR FIJO: Todos los trabajadores importados tienen estado "Activo"
        idCentroTrabajo: worker.idCentroTrabajo,
        createdBy: worker.createdBy,
        updatedBy: worker.updatedBy,
              // Incluir valores originales para normalizaciones - solo cuando hay cambios reales
      sexoOriginal: worker.originalValues?.sexo && worker.originalValues.sexo !== (worker.sexo ? String(worker.sexo).trim() : '') ? worker.originalValues.sexo : undefined,
      escolaridadOriginal: worker.originalValues?.escolaridad && worker.originalValues.escolaridad !== (worker.escolaridad ? String(worker.escolaridad).trim() : '') ? worker.originalValues.escolaridad : undefined,
      estadoCivilOriginal: worker.originalValues?.estadoCivil && worker.originalValues.estadoCivil !== (worker.estadoCivil ? String(worker.estadoCivil).trim() : '') ? worker.originalValues.estadoCivil : undefined,
      // ✅ ELIMINADO: No se capturan valores originales del estado laboral
      telefonoOriginal: worker.originalValues?.telefono && worker.originalValues.telefono !== (worker.telefono ? String(worker.telefono).trim() : '') ? worker.originalValues.telefono : undefined
    };
        
    return result;
  }

  /**
   * Método auxiliar para parsear fechas de diferentes formatos
   * Maneja: string, Date, número de Excel, null, undefined
   */
  private parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // Si ya es un objeto Date válido, retornarlo
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    }
    
    // Si es un número (fecha serial de Excel)
    if (typeof dateValue === 'number') {
      // Las fechas de Excel son días desde el 1 de enero de 1900
      // Convertir a milisegundos y crear Date
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Si es string, intentar diferentes formatos
    if (typeof dateValue === 'string') {
      const trimmedValue = dateValue.trim();
      if (!trimmedValue) return null;
      
      // Intentar formato DD/MM/YYYY
      let momentDate = moment(trimmedValue, 'DD/MM/YYYY', true);
      if (momentDate.isValid()) {
        return momentDate.toDate();
      }
      
      // Intentar formato MM/DD/YYYY
      momentDate = moment(trimmedValue, 'MM/DD/YYYY', true);
      if (momentDate.isValid()) {
        return momentDate.toDate();
      }
      
      // Intentar formato YYYY-MM-DD
      momentDate = moment(trimmedValue, 'YYYY-MM-DD', true);
      if (momentDate.isValid()) {
        return momentDate.toDate();
      }
      
      // Intentar formato ISO
      momentDate = moment(trimmedValue);
      if (momentDate.isValid()) {
        return momentDate.toDate();
      }
      
      // Solo loguear si realmente no se pudo parsear
      console.warn(`[FECHA] No se pudo parsear la fecha: ${trimmedValue}`);
      return null;
    }
    
    // Para cualquier otro tipo, solo loguear si es un valor inesperado
    if (dateValue !== null && dateValue !== undefined) {
      console.warn(`[FECHA] Tipo de fecha no soportado: ${typeof dateValue}, valor: ${dateValue}`);
    }
    return null;
  }

  /**
   * Método para parsear fechas de Excel en múltiples formatos
   */
  private parseExcelDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // Si ya es un objeto Date válido, retornarlo
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      return dateValue;
    }
    
    // Si es un número (fecha serial de Excel)
    if (typeof dateValue === 'number') {
      // Manejar fechas seriales de Excel (días desde 1900-01-01)
      // Excel tiene un bug: considera 1900 como año bisiesto
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Si es string, intentar múltiples formatos
    if (typeof dateValue === 'string') {
      const trimmedValue = dateValue.trim();
      if (!trimmedValue) return null;
      
      // Lista de formatos comunes en Excel
      const formats = [
        'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD',
        'DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY/MM/DD',
        'DD.MM.YYYY', 'MM.DD.YYYY', 'YYYY.MM.DD',
        'DD/MM/YY', 'MM/DD/YY', 'YY-MM-DD',
        'DD-MM-YY', 'MM-DD-YY', 'YY/MM/DD'
      ];
      
      for (const format of formats) {
        const momentDate = moment(trimmedValue, format, true);
        if (momentDate.isValid()) {
          return momentDate.toDate();
        }
      }
      
      // Intentar parseo automático de moment
      const momentDate = moment(trimmedValue);
      if (momentDate.isValid()) {
        return momentDate.toDate();
      }
      
      // Intentar parsear como fecha ISO
      const isoDate = new Date(trimmedValue);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
      
      // Solo loguear si realmente no se pudo parsear
      console.warn(`[FECHA] No se pudo parsear la fecha de Excel: ${trimmedValue}`);
      return null;
    }
    
    // Para cualquier otro tipo, solo loguear si es un valor inesperado
    if (dateValue !== null && dateValue !== undefined) {
      console.warn(`[FECHA] Tipo de fecha de Excel no soportado: ${typeof dateValue}, valor: ${dateValue}`);
    }
    return null;
  }

  /**
   * ✅ SOLUCIÓN: Método para normalizar números de teléfono
   * Acepta formatos como: 6681702850, 668 170 28 50, (668) 1702850, etc.
   * Retorna solo los dígitos o null si el formato no es válido
   */
  private normalizePhoneNumber(phone: string): string | null {
    if (!phone || phone.trim() === '') return null;
    
    // Remover todos los caracteres no numéricos excepto espacios, paréntesis y guiones
    const cleaned = phone.replace(/[^\d\s\(\)\-]/g, '');
    
    // Verificar que solo contenga caracteres válidos
    if (!/^[\d\s\(\)\-]+$/.test(phone)) {
      return null;
    }
    
    // Remover espacios, paréntesis y guiones, dejando solo dígitos
    const digitsOnly = cleaned.replace(/[\s\(\)\-]/g, '');
    
    // Verificar que solo contenga dígitos
    if (!/^\d+$/.test(digitsOnly)) {
      return null;
    }
    
    return digitsOnly;
  }

  /**
   * Método para normalizar enumeraciones con variaciones de mayúsculas/minúsculas
   * y mapeos inteligentes para valores similares
   */
  private normalizeEnumValue(value: string, validValues: string[]): string | null {
    if (!value) return null;
    
    const trimmedValue = String(value).trim();
    if (!trimmedValue) return null;
    
    // 1. Búsqueda exacta (case-insensitive)
    const exactMatch = validValues.find(valid => 
      valid.toLowerCase() === trimmedValue.toLowerCase()
    );
    if (exactMatch) return exactMatch;
    
    // 2. Búsqueda con normalización de acentos y caracteres especiales
    const normalizedInput = this.normalizeString(trimmedValue);
    const normalizedMatch = validValues.find(valid => 
      this.normalizeString(valid) === normalizedInput
    );
    if (normalizedMatch) return normalizedMatch;
    
    // 3. Búsqueda parcial (para casos como "Soltero" vs "Soltero/a")
    const partialMatch = validValues.find(valid => {
      const normalizedValid = this.normalizeString(valid);
      const normalizedInputLower = normalizedInput.toLowerCase();
      
      // Buscar coincidencias parciales
      return normalizedValid.toLowerCase().includes(normalizedInputLower) ||
             normalizedInputLower.includes(normalizedValid.toLowerCase());
    });
    if (partialMatch) return partialMatch;
    
    // 4. Mapeos específicos para casos comunes
    const specificMappings = this.getSpecificMappings(trimmedValue, validValues);
    if (specificMappings) return specificMappings;
    
    // 5. Búsqueda fuzzy (para errores tipográficos menores)
    const fuzzyMatch = this.findFuzzyMatch(trimmedValue, validValues);
    if (fuzzyMatch) return fuzzyMatch;
    
    return null;
  }

  /**
   * Normaliza strings eliminando acentos y caracteres especiales
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Mapeos específicos para casos comunes de enumeraciones
   */
  private getSpecificMappings(input: string, validValues: string[]): string | null {
    const inputLower = input.toLowerCase();
    
    // Mapeos para sexo
    if (validValues.includes('Masculino') || validValues.includes('Femenino')) {
      const sexoMappings: Record<string, string> = {
        'm': 'Masculino',
        'masculino': 'Masculino',
        'hombre': 'Masculino',
        'varon': 'Masculino',
        'f': 'Femenino',
        'femenino': 'Femenino',
        'mujer': 'Femenino',
        'hembra': 'Femenino'
      };
      
      if (sexoMappings[inputLower]) return sexoMappings[inputLower];
    }
    
    // Mapeos para estado civil
    if (validValues.includes('Soltero/a') || validValues.includes('Casado/a')) {
      const estadoCivilMappings: Record<string, string> = {
        'soltero': 'Soltero/a',
        'soltera': 'Soltero/a',
        'soltero/a': 'Soltero/a',
        'casado': 'Casado/a',
        'casada': 'Casado/a',
        'casado/a': 'Casado/a',
        'union libre': 'Unión libre',
        'union': 'Unión libre',
        'separado': 'Separado/a',
        'separada': 'Separado/a',
        'separado/a': 'Separado/a',
        'divorciado': 'Divorciado/a',
        'divorciada': 'Divorciado/a',
        'divorciado/a': 'Divorciado/a',
        'viudo': 'Viudo/a',
        'viuda': 'Viudo/a',
        'viudo/a': 'Viudo/a'
      };
      
      if (estadoCivilMappings[inputLower]) return estadoCivilMappings[inputLower];
    }
    
    // Mapeos para escolaridad
    if (validValues.includes('Primaria') || validValues.includes('Secundaria')) {
      const escolaridadMappings: Record<string, string> = {
        'primaria': 'Primaria',
        'secundaria': 'Secundaria',
        'preparatoria': 'Preparatoria',
        'bachillerato': 'Preparatoria',
        'licenciatura': 'Licenciatura',
        'universidad': 'Licenciatura',
        'maestria': 'Maestría',
        'doctorado': 'Doctorado',
        'nula': 'Nula',
        'sin estudios': 'Nula'
      };
      
      if (escolaridadMappings[inputLower]) return escolaridadMappings[inputLower];
    }
    
    // Mapeos para estado laboral
    if (validValues.includes('Activo') || validValues.includes('Inactivo')) {
      const estadoLaboralMappings: Record<string, string> = {
        'activo': 'Activo',
        'trabajando': 'Activo',
        'empleado': 'Activo',
        'inactivo': 'Inactivo',
        'desempleado': 'Inactivo',
        'cesado': 'Inactivo',
        'renuncio': 'Inactivo'
      };
      
      if (estadoLaboralMappings[inputLower]) return estadoLaboralMappings[inputLower];
    }
    
    return null;
  }

  /**
   * Búsqueda fuzzy para encontrar coincidencias con errores tipográficos menores
   */
  private findFuzzyMatch(input: string, validValues: string[]): string | null {
    const inputLower = input.toLowerCase();
    
    // Calcular similitud con cada valor válido
    let bestMatch: string | null = null;
    let bestScore = 0;
    
    for (const valid of validValues) {
      const validLower = valid.toLowerCase();
      
      // Calcular similitud usando distancia de Levenshtein simplificada
      const score = this.calculateSimilarity(inputLower, validLower);
      
      if (score > bestScore && score > 0.7) { // Umbral de 70% de similitud
        bestScore = score;
        bestMatch = valid;
      }
    }
    
    return bestMatch;
  }

  /**
   * Calcula similitud entre dos strings (0.0 a 1.0)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    // Calcular distancia de Levenshtein simplificada
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calcula la distancia de Levenshtein entre dos strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Método para limpiar y normalizar datos antes de la validación
   * Maneja casos especiales como espacios en blanco, valores nulos, etc.
   */
  private cleanWorkerData(worker: any): any {
    const cleaned = { ...worker };
    
    // 🔍 CORRECCIÓN: Guardar valores originales ANTES de cualquier limpieza
    const originalValues = {
      sexo: worker.sexo, // Usar worker original, no cleaned
      escolaridad: worker.escolaridad,
      estadoCivil: worker.estadoCivil,
      // ✅ ELIMINADO: No se capturan valores originales del estado laboral
      telefono: worker.telefono && typeof worker.telefono === 'string' && worker.telefono.trim() !== '' ? worker.telefono : null
    };
    
    // Limpiar strings eliminando espacios y convirtiendo a string
    if (cleaned.nombre) cleaned.nombre = String(cleaned.nombre).trim();
    if (cleaned.sexo) cleaned.sexo = String(cleaned.sexo).trim();
    if (cleaned.escolaridad) cleaned.escolaridad = String(cleaned.escolaridad).trim();
    if (cleaned.puesto) cleaned.puesto = String(cleaned.puesto).trim();
    if (cleaned.telefono && typeof cleaned.telefono === 'string') cleaned.telefono = cleaned.telefono.trim();
    if (cleaned.estadoCivil) cleaned.estadoCivil = String(cleaned.estadoCivil).trim();
    if (cleaned.numeroEmpleado) cleaned.numeroEmpleado = String(cleaned.numeroEmpleado).trim();
    // ✅ ELIMINADO: No se procesa el estado laboral del Excel
    
    // Normalizar enumeraciones - solo loguear si hay cambios reales
    const sexos = ["Masculino", "Femenino"];
    if (cleaned.sexo) {
      const originalSexo = cleaned.sexo;
      const normalizedSexo = this.normalizeEnumValue(cleaned.sexo, sexos);
      if (normalizedSexo && normalizedSexo !== originalSexo) {
        cleaned.sexo = normalizedSexo;
        console.log(`[NORMALIZACIÓN] Sexo: "${originalSexo}" -> "${normalizedSexo}"`);
      }
    }
    
    const nivelesEscolaridad = ["Primaria", "Secundaria", "Preparatoria", "Licenciatura", "Maestría", "Doctorado", "Nula"];
    if (cleaned.escolaridad) {
      const originalEscolaridad = cleaned.escolaridad;
      const normalizedEscolaridad = this.normalizeEnumValue(cleaned.escolaridad, nivelesEscolaridad);
      if (normalizedEscolaridad && normalizedEscolaridad !== originalEscolaridad) {
        cleaned.escolaridad = normalizedEscolaridad;
        console.log(`[NORMALIZACIÓN] Escolaridad: "${originalEscolaridad}" -> "${normalizedEscolaridad}"`);
      }
    }
    
    const estadosCiviles = ["Soltero/a", "Casado/a", "Unión libre", "Separado/a", "Divorciado/a", "Viudo/a"];
    if (cleaned.estadoCivil) {
      const originalEstadoCivil = cleaned.estadoCivil;
      const normalizedEstadoCivil = this.normalizeEnumValue(cleaned.estadoCivil, estadosCiviles);
      if (normalizedEstadoCivil && normalizedEstadoCivil !== originalEstadoCivil) {
        cleaned.estadoCivil = normalizedEstadoCivil;
        console.log(`[NORMALIZACIÓN] Estado civil: "${originalEstadoCivil}" -> "${normalizedEstadoCivil}"`);
      }
    }
    
    // ✅ ELIMINADO: No se normaliza el estado laboral
    
    // Normalizar teléfono - solo si hay un cambio real
    if (cleaned.telefono && typeof cleaned.telefono === 'string' && cleaned.telefono.trim() !== '') {
      const originalTelefono = cleaned.telefono;
      const normalizedTelefono = this.normalizePhoneNumber(cleaned.telefono);
      
      // Solo normalizar si hay un cambio real y el resultado no es null
      if (normalizedTelefono && normalizedTelefono !== originalTelefono) {
        cleaned.telefono = normalizedTelefono;
        console.log(`[NORMALIZACIÓN] Teléfono: "${originalTelefono}" -> "${normalizedTelefono}"`);
      }
    }
    
    // Guardar valores originales en el objeto cleaned para uso posterior
    cleaned.originalValues = originalValues;
        
    // Manejar valores nulos o undefined
    if (cleaned.nombre === 'null' || cleaned.nombre === 'undefined' || cleaned.nombre === '') {
      cleaned.nombre = null;
    }
    if (cleaned.sexo === 'null' || cleaned.sexo === 'undefined' || cleaned.sexo === '') {
      cleaned.sexo = null;
    }
    if (cleaned.escolaridad === 'null' || cleaned.escolaridad === 'undefined' || cleaned.escolaridad === '') {
      cleaned.escolaridad = null;
    }
    if (cleaned.puesto === 'null' || cleaned.puesto === 'undefined' || cleaned.puesto === '') {
      cleaned.puesto = null;
    }
    if (cleaned.estadoCivil === 'null' || cleaned.estadoCivil === 'undefined' || cleaned.estadoCivil === '') {
      cleaned.estadoCivil = null;
    }
    
    // Limpiar fechas - convertir strings vacíos a null
    if (cleaned.fechaNacimiento === '' || cleaned.fechaNacimiento === 'null' || cleaned.fechaNacimiento === 'undefined') {
      cleaned.fechaNacimiento = null;
    }
    if (cleaned.fechaIngreso === '' || cleaned.fechaIngreso === 'null' || cleaned.fechaIngreso === 'undefined') {
      cleaned.fechaIngreso = null;
    }
    
    return cleaned;
  }

  /**
   * Método para validar y limpiar datos antes de procesarlos
   * Ayuda a identificar problemas temprano en la importación
   */
  private validateAndCleanWorkerData(worker: any): { isValid: boolean; errors: string[]; cleanedData: any } {
    const errors: string[] = [];
    const cleanedData = this.cleanWorkerData(worker);

    // Validar campos requeridos
    if (!worker.nombre || String(worker.nombre).trim() === '') {
      errors.push('El nombre es requerido');
    }

    if (!worker.fechaNacimiento) {
      errors.push('La fecha de nacimiento es requerida');
    } else {
      const parsedDate = this.parseExcelDate(worker.fechaNacimiento);
      if (!parsedDate) {
        errors.push(`Fecha de nacimiento inválida: ${worker.fechaNacimiento}`);
      } else {
        // ✅ SOLUCIÓN: Validar edad mínima de 15 años (edad mínima para laborar en México)
        const fechaNacimiento = new Date(parsedDate);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const mesNacimiento = fechaNacimiento.getMonth();
        const diaActual = hoy.getDate();
        const diaNacimiento = fechaNacimiento.getDate();
        
        // Ajustar edad si no ha cumplido años este año
        const edadReal = (mesActual < mesNacimiento) || (mesActual === mesNacimiento && diaActual < diaNacimiento) ? edad - 1 : edad;
        
        if (edadReal < 15) {
          errors.push(`Según el registro, el trabajador tiene ${edadReal} años. La edad mínima para laborar es 15 años. `);
        }
        
        // Validar que la fecha de nacimiento no sea en el futuro
        if (fechaNacimiento > hoy) {
          errors.push('La fecha de nacimiento no puede ser en el futuro');
        }
        
        cleanedData.fechaNacimiento = parsedDate;
      }
    }

    if (!worker.fechaIngreso) {
      errors.push('La fecha de ingreso es requerida');
    } else {
      const parsedDate = this.parseExcelDate(worker.fechaIngreso);
      if (!parsedDate) {
        errors.push(`Fecha de ingreso inválida: ${worker.fechaIngreso}`);
      } else {
        cleanedData.fechaIngreso = parsedDate;
      }
    }

    // Validar campos de enumeración (ya normalizados en cleanWorkerData)
    const sexos = ["Masculino", "Femenino"];
    if (!cleanedData.sexo || !sexos.includes(cleanedData.sexo)) {
      errors.push(`El sexo debe ser uno de: ${sexos.join(', ')}`);
    }

    const nivelesEscolaridad = ["Primaria", "Secundaria", "Preparatoria", "Licenciatura", "Maestría", "Doctorado", "Nula"];
    if (!cleanedData.escolaridad || !nivelesEscolaridad.includes(cleanedData.escolaridad)) {
      errors.push(`La escolaridad debe ser una de: ${nivelesEscolaridad.join(', ')}`);
    }

    const estadosCiviles = ["Soltero/a", "Casado/a", "Unión libre", "Separado/a", "Divorciado/a", "Viudo/a"];
    if (!cleanedData.estadoCivil || !estadosCiviles.includes(cleanedData.estadoCivil)) {
      errors.push(`El estado civil debe ser uno de: ${estadosCiviles.join(', ')}`);
    }

    // ✅ ELIMINADO: No se valida el estado laboral del Excel

    // Validar número de empleado si existe
    if (worker.numeroEmpleado) {
      const numeroEmpleado = String(worker.numeroEmpleado).trim();
      if (!/^[0-9]{1,7}$/.test(numeroEmpleado)) {
        errors.push('El número de empleado debe tener entre 1 y 7 dígitos numéricos');
      }
    }

    // ✅ SOLUCIÓN: Validar teléfono (opcional, pero si existe debe tener 10 dígitos)
    if (worker.telefono && typeof worker.telefono === 'string') {
      const telefonoNormalizado = this.normalizePhoneNumber(worker.telefono.trim());
      if (telefonoNormalizado) {
        if (telefonoNormalizado.length !== 10) {
          errors.push(`El teléfono debe tener exactamente 10 dígitos. Recibido: ${telefonoNormalizado.length} dígitos`);
        } else {
          // Guardar el teléfono normalizado
          cleanedData.telefono = telefonoNormalizado;
        }
      } else {
        errors.push('El formato del teléfono no es válido. Debe contener solo números, espacios, paréntesis y guiones');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      cleanedData
    };
  }

  // Método para importar trabajadores
  async importarTrabajadores(data: any[], idCentroTrabajo: string, createdBy: string) {
    const resultados = [];
    const startTime = Date.now();
    console.log(`[IMPORTACIÓN] 🚀 Iniciando importación de ${data.length} trabajadores`);
    
    for (const [index, worker] of data.entries()) {
        try {
            // Primero validar y limpiar los datos
            const validation = this.validateAndCleanWorkerData({
                ...worker,
                idCentroTrabajo,
                createdBy,
                updatedBy: createdBy
            });

            if (!validation.isValid) {
                console.error(`[ERROR] ${worker.nombre || 'Sin nombre'}: ${validation.errors.join(', ')}`);
                // ✅ SOLUCIÓN: Enviar datos procesados para que las fechas se muestren correctamente
                const processedData = this.processWorkerData(validation.cleanedData);
                resultados.push({ 
                    success: false, 
                    error: 'Hay errores de validación', // ✅ Resumen genérico para evitar redundancia
                    worker: processedData, // Usar datos procesados en lugar de datos originales
                    validationErrors: validation.errors
                });
                continue;
            }

            // Procesar los datos validados
            const processedWorker = this.processWorkerData(validation.cleanedData);

            const nuevoTrabajador = await this.create(processedWorker);
            
            // ✅ CORRECCIÓN: Incluir tanto el trabajador guardado como los datos procesados con valores originales
            const workerWithOriginals = {
                ...nuevoTrabajador.toObject(), // Convertir el documento de Mongoose a objeto plano
                // Agregar los campos originales para normalizaciones
                sexoOriginal: processedWorker.sexoOriginal,
                escolaridadOriginal: processedWorker.escolaridadOriginal,
                estadoCivilOriginal: processedWorker.estadoCivilOriginal,
                // ✅ ELIMINADO: No se incluyen valores originales del estado laboral
                telefonoOriginal: processedWorker.telefonoOriginal
            };
            
            resultados.push({ success: true, worker: workerWithOriginals });
            
        } catch (error) {
            console.error(`[ERROR] ${worker.nombre || 'Sin nombre'}: ${error.message}`);
            resultados.push({ 
                success: false, 
                error: error.message, 
                worker,
                processedData: this.processWorkerData({
                    ...worker,
                    idCentroTrabajo,
                    createdBy,
                    updatedBy: createdBy
                })
            });
        }
    }

    const hasErrors = resultados.some((r) => !r.success);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    if (hasErrors) {
        const exitosos = resultados.filter((r) => r.success).length;
        const fallidos = resultados.filter((r) => !r.success).length;
        console.log(`[IMPORTACIÓN] ⚠️ - Resultado mixto en ${duration}s: ${exitosos} exitosos, ${fallidos} fallidos de ${data.length} total`);
        return {
            message: 'Hubo errores durante la importación. Revisa los datos y asegúrate de usar el formato correcto.',
            data: resultados,  // ✅ TODOS los resultados (exitosos + fallidos)
            totalProcessed: data.length,
            successful: exitosos,
            failed: fallidos
        };
    }

    console.log(`[IMPORTACIÓN] ✅ - Completada exitosamente en ${duration}s. ${resultados.length} trabajadores importados`);
    return { 
        message: 'Trabajadores importados exitosamente', 
        data: resultados,
        totalProcessed: data.length,
        successful: resultados.length,
        failed: 0
    };
  }

  private buildFilePath(basePath: string, doc: any): string {
    
    if (!doc) {
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
        return '';
      }
      fullPath = `${basePath}/${doc.nombreDocumento} ${fecha}${doc.extension}`;
    } else {
      const tipoDocumento = documentTypes[modelName] || 'Documento';
      fullPath = `${basePath}/${tipoDocumento} ${fecha}.pdf`;
    }
  
    // Limpiar cualquier doble barra accidental en la ruta
    fullPath = fullPath.replace(/\/\//g, '/');
  
    return fullPath;
  }

  private async eliminarArchivosDeDocumentos(documentos: any[]): Promise<boolean> {
    if (documentos.length === 0) return true;
  
    console.log(`[ARCHIVOS] Verificando eliminación de ${documentos.length} archivos asociados...`);
  
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
  
      // Solo mostrar resumen final
      if (erroresEncontrados > 0) {
        console.log(`[ARCHIVOS] ⚠️ Eliminación completada con ${erroresEncontrados} errores de ${archivosAEliminar.length} archivos`);
      } else {
        console.log(`[ARCHIVOS] ✅ Eliminación exitosa de ${eliminacionesExitosas} archivos`);
      }
  
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
          const eliminacionExitosa = await this.eliminarArchivosDeDocumentos(documentos);
          if (!eliminacionExitosa) {
            throw new Error('Error eliminando archivos.');
          }
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
