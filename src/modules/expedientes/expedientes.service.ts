// Servicios para gestionar la data que se almacena en la base de datos
import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Antidoping } from './schemas/antidoping.schema';
import { AptitudPuesto } from './schemas/aptitud-puesto.schema';
import { Certificado } from './schemas/certificado.schema';
import { DocumentoExterno } from './schemas/documento-externo.schema';
import { ExamenVista } from './schemas/examen-vista.schema';
import { ExploracionFisica } from './schemas/exploracion-fisica.schema';
import { HistoriaClinica } from './schemas/historia-clinica.schema';
import { startOfDay, endOfDay } from 'date-fns';
import { FilesService } from '../files/files.service';
import { convertirFechaISOaDDMMYYYY } from 'src/utils/dates';
import path from 'path';

@Injectable()
export class ExpedientesService {
  private readonly models: Record<string, Model<any>>;
  private readonly dateFields: Record<string, string>;

  constructor(
    @InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>,
    @InjectModel(AptitudPuesto.name) private aptitudModel: Model<AptitudPuesto>,
    @InjectModel(Certificado.name) private certificadoModel: Model<Certificado>,
    @InjectModel(DocumentoExterno.name) private documentoExternoModel: Model<DocumentoExterno>,
    @InjectModel(ExamenVista.name) private examenVistaModel: Model<ExamenVista>,
    @InjectModel(ExploracionFisica.name) private exploracionFisicaModel: Model<ExploracionFisica>,
    @InjectModel(HistoriaClinica.name) private historiaClinicaModel: Model<HistoriaClinica>,
    private readonly filesService: FilesService
  ) {
    this.models = {
      antidoping: this.antidopingModel,
      aptitud: this.aptitudModel,
      certificado: this.certificadoModel,
      documentoExterno: this.documentoExternoModel,
      examenVista: this.examenVistaModel,
      exploracionFisica: this.exploracionFisicaModel,
      historiaClinica: this.historiaClinicaModel
    };

    this.dateFields = {
      antidoping: 'fechaAntidoping',
      aptitud: 'fechaAptitudPuesto',
      certificado: 'fechaCertificado',
      documentoExterno: 'fechaDocumento',
      examenVista: 'fechaExamenVista',
      exploracionFisica: 'fechaExploracionFisica',
      historiaClinica: 'fechaHistoriaClinica'
    };
  }

  async createOrUpdateDocument(documentType: string, createDto: any): Promise<any> {
    const model = this.models[documentType];
    let dateField = this.dateFields[documentType];

    if (!model || !dateField) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    const fecha = createDto[dateField];
    const trabajadorId = createDto.idTrabajador;

    if (!fecha) {
      throw new BadRequestException(`El campo ${dateField} es requerido para este documento`);
    }

    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }

    const startDate = startOfDay(new Date(fecha));
    const endDate = endOfDay(new Date(fecha));

    // Busca un documento existente para el tipo, trabajador y la fecha
    const existingDocument = await model.findOne({
      idTrabajador: trabajadorId,
      [dateField]: { $gte: startDate, $lte: endDate },
    }).exec();

    // console.log(`Buscando documento existente para tipo: ${documentType}, trabajador: ${trabajadorId}, fecha: ${fecha}`);

    if (existingDocument) {
      // console.log(`Documento encontrado, actualizando: ${existingDocument._id}`);
      // Si ya existe, actualízalo
      return model.findByIdAndUpdate(existingDocument._id, createDto, { new: true }).exec();
    }

    // console.log('No se encontró documento existente, creando uno nuevo');
    // Si no existe, crea uno nuevo
    const createdDocument = new model(createDto);
    return createdDocument.save();
  }

  async uploadDocument(createDto: any): Promise<any> {
    const model = this.models['documentoExterno'];
  
    const fechaDocumento = createDto.fechaDocumento;
    const nombreDocumento = createDto.nombreDocumento;
    const trabajadorId = createDto.idTrabajador;
  
    if (!fechaDocumento) {
      throw new BadRequestException(`El campo ${fechaDocumento} es requerido para este documento`);
    }

    if (!nombreDocumento) {
      throw new BadRequestException('El campo nombreDocumento es requerido');
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }

    const startDate = startOfDay(new Date(fechaDocumento));
    const endDate = endOfDay(new Date(fechaDocumento));
  
    // Busca un documento existente para el trabajador y la fecha
    const existingDocument = await model.findOne({
      idTrabajador: trabajadorId,
      fechaDocumento: { $gte: startDate, $lte: endDate },
      nombreDocumento: nombreDocumento
    }).exec();
  
    if (existingDocument) {
      // Si ya existe, actualízalo
      return model.findByIdAndUpdate(existingDocument._id, createDto, { new: true }).exec();
    }
  
    // Si no existe, crea uno nuevo
    const createdDocument = new model(createDto);
    return createdDocument.save();
  } 

  async findDocuments(documentType: string, trabajadorId: string): Promise<any[]> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
    return model.find({ idTrabajador: trabajadorId }).exec();
  }

  async findDocument(documentType: string, id: string): Promise<any> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
    return model.findById(id).exec();
  }

  async updateDocument(documentType: string, id: string, updateDto: any): Promise<any> {
    const model = this.models[documentType];
    const dateField = this.dateFields[documentType];
  
    if (!model || !dateField) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
  
    const newFecha = updateDto[dateField];
    const trabajadorId = updateDto.idTrabajador;
  
    if (!newFecha) {
      throw new BadRequestException(`El campo ${dateField} es requerido para este documento`);
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }
  
    const startDate = startOfDay(new Date(newFecha));
    const endDate = endOfDay(new Date(newFecha));
  
    // Busca un documento existente para el tipo, trabajador y la nueva fecha
    const conflictingDocument = await model.findOne({
      idTrabajador: trabajadorId,
      [dateField]: { $gte: startDate, $lte: endDate },
    }).exec();
  
    if (conflictingDocument && conflictingDocument._id.toString() !== id) {
      throw new BadRequestException(
        `Ya existe un documento de tipo ${documentType} para la fecha ${newFecha} y el trabajador ${trabajadorId}`
      );
    }
  
    // Busca el documento existente para verificar si la fecha cambió
    const existingDocument = await model.findById(id).exec();
    if (!existingDocument) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }
  
    const oldFecha = existingDocument[dateField];
    const rutaPDF = existingDocument.rutaPDF;
  
    if (newFecha !== oldFecha) {
      try {
        // Construir la ruta del archivo anterior
        const formattedOldFecha = convertirFechaISOaDDMMYYYY(oldFecha).replace(/\//g, '-');
        const oldFileName = formatDocumentName(documentType, formattedOldFecha);
        const oldFilePath = path.join(rutaPDF, oldFileName);
  
        console.log(`[DEBUG] Eliminando archivo anterior: ${oldFilePath}`);
        await this.filesService.deleteFile(oldFilePath); // Usa FilesService para eliminar el archivo
      } catch (error) {
        console.error(`[ERROR] Error al eliminar el archivo anterior: ${error.message}`);
      }
    }
  
    // Actualizar el documento con los nuevos datos
    return model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async removeDocument(documentType: string, id: string): Promise<boolean> {
    console.log(`[DEBUG] Inicio de removeDocument - documentType: ${documentType}, id: ${id}`);
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    const document = await model.findById(id).exec();
    if (!document) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }

    try {
      let fullPath = document.rutaPDF;
      if (!fullPath.includes('.pdf')) {
        const fechaField = this.dateFields[documentType];
        const fecha = convertirFechaISOaDDMMYYYY(document[fechaField]).replace(/\//g, '-');
        const fileName = formatDocumentName(documentType, fecha);
        fullPath = path.join(document.rutaPDF, fileName);
      }

      console.log(`[DEBUG] Intentando eliminar archivo PDF: ${fullPath}`);
      await this.filesService.deleteFile(fullPath); // Usar FilesService
    } catch (error) {
      console.error(`[ERROR] Error al eliminar el archivo PDF: ${error.message}`);
    }

    const result = await model.findByIdAndDelete(id).exec();
    return result !== null;
  }
  
}

function formatDocumentName(documentType: string, fecha: string): string {
  // Separar palabras (asumiendo camelCase o guiones bajos como delimitadores)
  const words = documentType.split(/(?=[A-Z])|_/g);
  // Capitalizar la primera letra de cada palabra
  const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  // Unir las palabras con un espacio y agregar la fecha
  return `${capitalized.join(' ')} ${fecha}.pdf`;
}