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
  private filesService: FilesService) {}

  async create(createTrabajadorDto: CreateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(createTrabajadorDto);
    try {
      const createdTrabajador = new this.trabajadorModel(normalizedDto);
      const savedTrabajador = await createdTrabajador.save();
      return savedTrabajador;
    } catch (error) {
      console.error('Error al guardar el trabajador:', error); // Depuración: Error al guardar
      throw error; // Re-lanzar el error para manejarlo en el controlador
    }
  }
  
  async findWorkersByCenter(id: string): Promise<Trabajador[]> {
    return await this.trabajadorModel.find({ idCentroTrabajo: id }).exec();
  }

  async findWorkersWithHistoriaDataByCenter(centroId: string): Promise<any[]> {
    const trabajadores = await this.trabajadorModel.find({ idCentroTrabajo: centroId }).lean();
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
  
    // COMBINAR
    const resultado = trabajadores.map(trabajador => {
      const id = trabajador._id.toString();
  
      const historia = historiasMap.get(id);
      const aptitud = aptitudesMap.get(id);
      const exploracion = exploracionesMap.get(id);
  
      return {
        ...trabajador,
        historiaClinicaResumen: historia
          ? {
              diabeticosPP: historia.diabeticosPP ?? null,
              alergicos: historia.alergicos ?? null,
              hipertensivosPP: historia.hipertensivosPP ?? null,
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
      };
    });
  
    return resultado;
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

  /* async findWorkersWithHistoriaDataByCenter(centroId: string): Promise<any[]> {
    const trabajadores = await this.trabajadorModel.find({ idCentroTrabajo: centroId }).lean();
    const trabajadoresIds = trabajadores.map(t => t._id);
  
    // Buscar todas las historias clínicas de los trabajadores en una sola consulta
    const historias = await this.historiaClinicaModel
      .find({ idTrabajador: { $in: trabajadoresIds } })
      .lean();
  
    // Agrupar historias por idTrabajador y quedarte con la más reciente
    const historiasMap = new Map<string, any>();

    for (const historia of historias) {
      const id = historia.idTrabajador.toString();
      const actual = historiasMap.get(id);

      if (
        !actual ||
        new Date(historia.fechaHistoriaClinica) > new Date(actual.fechaHistoriaClinica)
      ) {
        historiasMap.set(id, historia);
      }
    }
  
    // Combinar trabajadores + resumen de historia
    const resultado = trabajadores.map(trabajador => {
      const historia = historiasMap.get(trabajador._id.toString());
  
      return {
        ...trabajador,
        historiaClinicaResumen: historia
          ? {
              diabeticosPP: historia.diabeticosPP ?? null,
              alergicos: historia.alergicos ?? null,
              hipertensivosPP: historia.hipertensivosPP ?? null,
              accidenteLaboral: historia.accidenteLaboral ?? null,
            }
          : null,
      };
    });
  
    return resultado;
  }   */

  async findOne(id: string): Promise<Trabajador> {
    return await this.trabajadorModel.findById(id).exec();
  }

  async update(id: string, updateTrabajadorDto: UpdateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(updateTrabajadorDto);
    return await this.trabajadorModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
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
        hijos: worker.hijos || 0,
        estadoLaboral: worker.estadoLaboral ? String(worker.estadoLaboral).trim() : 'Activo',
        idCentroTrabajo: worker.idCentroTrabajo,
        createdBy: worker.createdBy,
        updatedBy: worker.updatedBy
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
        Hijos: trabajador.hijos
      };
    });

    // Crear un nuevo libro y hoja de trabajo
    const worksheet = xlsx.utils.json_to_sheet(trabajadoresData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Trabajadores');

    // Convertir el libro a un buffer
    return xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  }
}
