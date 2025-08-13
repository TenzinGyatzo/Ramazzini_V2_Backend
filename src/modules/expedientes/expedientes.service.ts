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
import { NotaMedica } from './schemas/nota-medica.schema';
import { Receta } from './schemas/receta.schema';
import { startOfDay, endOfDay } from 'date-fns';
import { FilesService } from '../files/files.service';
import { convertirFechaISOaDDMMYYYY } from 'src/utils/dates';
import path from 'path';
import { parseISO } from 'date-fns';
import { Trabajador } from '../trabajadores/schemas/trabajador.schema';


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
    @InjectModel(NotaMedica.name) private notaMedicaModel: Model<NotaMedica>,
    @InjectModel(Receta.name) private recetaModel: Model<Receta>,
    @InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>,
    private readonly filesService: FilesService
  ) {
    this.models = {
      antidoping: this.antidopingModel,
      aptitud: this.aptitudModel,
      certificado: this.certificadoModel,
      documentoExterno: this.documentoExternoModel,
      examenVista: this.examenVistaModel,
      exploracionFisica: this.exploracionFisicaModel,
      historiaClinica: this.historiaClinicaModel,
      notaMedica: this.notaMedicaModel,
      receta: this.recetaModel
    };

    this.dateFields = {
      antidoping: 'fechaAntidoping',
      aptitud: 'fechaAptitudPuesto',
      certificado: 'fechaCertificado',
      documentoExterno: 'fechaDocumento',
      examenVista: 'fechaExamenVista',
      exploracionFisica: 'fechaExploracionFisica',
      historiaClinica: 'fechaHistoriaClinica',
      notaMedica: 'fechaNotaMedica',
      receta: 'fechaReceta'
    };
  }

  async createDocument(documentType: string, createDto: any): Promise<any> {
    const model = this.models[documentType];
  
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
  
    const createdDocument = new model(createDto);
    const savedDocument = await createdDocument.save();

    // ✅ Actualizar el updatedAt del trabajador
    if (createDto.idTrabajador) {
      await this.actualizarUpdatedAtTrabajador(createDto.idTrabajador);
    }
  
    return savedDocument;
  } 

  async updateOrCreateDocument(documentType: string, id: string, updateDto: any): Promise<any> {
    const model = this.models[documentType];
    const dateField = this.dateFields[documentType];
  
    if (!model || !dateField) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
  
    const newFecha = parseISO(updateDto[dateField]); // Convertimos a Date
    const trabajadorId = updateDto.idTrabajador;
  
    if (!newFecha) {
      throw new BadRequestException(`El campo ${dateField} es requerido para este documento`);
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }
  
    const existingDocument = await model.findById(id).exec();
  
    if (!existingDocument) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }
  
    const oldFecha = new Date(existingDocument[dateField]);
  
    let result;
    if (newFecha.toISOString() !== oldFecha.toISOString()) {
      const newDocumentData = { ...updateDto };
      delete newDocumentData._id;
  
      const newDocument = new model(newDocumentData);
      result = await newDocument.save();
    } else {
      // Limpieza especial para antidoping
      if (documentType === 'antidoping') {
        const allDrugs = [
          'marihuana', 'cocaina', 'anfetaminas', 'metanfetaminas',
          'opiaceos', 'benzodiacepinas', 'fenciclidina', 'metadona',
          'barbituricos', 'antidepresivosTriciclicos',
        ];
  
        const unsetFields = Object.fromEntries(
          allDrugs.filter((campo) => !(campo in updateDto)).map((campo) => [campo, ""])
        );
  
        if (Object.keys(unsetFields).length > 0) {
          await model.updateOne({ _id: id }, { $unset: unsetFields });
        }
      }
  
      result = await model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    }
  
    // ✅ Actualizar el updatedAt del trabajador
    await this.actualizarUpdatedAtTrabajador(trabajadorId);
  
    return result;
  }

  async uploadDocument(createDto: any): Promise<any> {
    const model = this.models['documentoExterno'];
  
    const fechaDocumento = createDto.fechaDocumento;
    const nombreDocumento = createDto.nombreDocumento;
    const trabajadorId = createDto.idTrabajador;
  
    if (!fechaDocumento) {
      throw new BadRequestException(`El campo fechaDocumento es requerido para este documento`);
    }
  
    if (!nombreDocumento) {
      throw new BadRequestException('El campo nombreDocumento es requerido');
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }
  
    // ✅ SIEMPRE crear una nueva entidad para evitar archivos huérfanos
    // Esto permite que cada archivo tenga su propio registro y se pueda gestionar individualmente
    const createdDocument = new model(createDto);
    const result = await createdDocument.save();
  
    // ✅ Actualizar el updatedAt del trabajador
    await this.actualizarUpdatedAtTrabajador(trabajadorId);
  
    return result;
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
  
  async upsertDocumentoExterno(id: string | null, updateDto: any): Promise<any> {
    const model = this.models.documentoExterno;
    const dateField = 'fechaDocumento';
  
    if (!model) {
      throw new BadRequestException('El modelo documentoExterno no está definido');
    }
  
    const newFecha = updateDto[dateField];
    const trabajadorId = updateDto.idTrabajador;
    const newNombreDocumento = updateDto.nombreDocumento;
  
    if (!newFecha) {
      throw new BadRequestException(`El campo ${dateField} es requerido para este documento`);
    }
  
    if (!trabajadorId) {
      throw new BadRequestException('El campo idTrabajador es requerido');
    }

    let result;
  
    const existingDocument = id ? await model.findById(id).exec() : null;
  
    if (existingDocument) {
      const oldFecha = existingDocument[dateField];
      const oldNombreDocumento = existingDocument.nombreDocumento;
      const oldExtension = existingDocument.extension;
      const rutaDocumento = existingDocument.rutaDocumento;
  
      // Detectar cambios en fecha o nombre del documento
      if (newFecha !== oldFecha || newNombreDocumento !== oldNombreDocumento) {
        try {
          // Construir el nombre del archivo anterior
          const formattedOldFecha = convertirFechaISOaDDMMYYYY(oldFecha).replace(/\//g, '-');
          const oldFileName = `${oldNombreDocumento} ${formattedOldFecha}${oldExtension}`;
          const oldFilePath = path.join(rutaDocumento, oldFileName);
  
          // Construir el nuevo nombre del archivo
          const formattedNewFecha = convertirFechaISOaDDMMYYYY(newFecha).replace(/\//g, '-');
          const newFileName = `${newNombreDocumento} ${formattedNewFecha}${oldExtension}`;
          const newFilePath = path.join(rutaDocumento, newFileName);
  
          // console.log(`[DEBUG] Renombrando archivo: ${oldFilePath} -> ${newFilePath}`);
  
          // Renombrar el archivo
          await this.filesService.renameFile(oldFilePath, newFilePath);
  
          // Actualizar los campos en el DTO
          updateDto.nombreDocumento = newNombreDocumento;
          updateDto.fechaDocumento = newFecha;
        } catch (error) {
          console.error(`[ERROR] Error al renombrar el archivo: ${error.message}`);
        }
      }
  
      // Actualizar el documento existente
      result = await model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
    } else {
      const newDocument = new model(updateDto);
      result = await newDocument.save();
    }
  
    // ✅ Actualizar el updatedAt del trabajador
    await this.actualizarUpdatedAtTrabajador(trabajadorId);

    return result;
  }  

  async removeDocument(documentType: string, id: string): Promise<boolean> {
    // console.log(`[DEBUG] Inicio de removeDocument - documentType: ${documentType}, id: ${id}`);
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }

    const document = await model.findById(id).exec();
    if (!document) {
      throw new BadRequestException(`Documento con ID ${id} no encontrado`);
    }

    try {
      let fullPath = '';
      if(documentType === 'documentoExterno') {
        fullPath = document.rutaDocumento;
        if (!fullPath.includes('.pdf') || !fullPath.includes('.png') || !fullPath.includes('.jpg') || !fullPath.includes('.jpeg')) {
          const fechaField = this.dateFields[documentType];
          const fecha = convertirFechaISOaDDMMYYYY(document[fechaField]).replace(/\//g, '-');
          const fileName = `${document.nombreDocumento} ${fecha}${document.extension}`
          fullPath = path.join(document.rutaDocumento, fileName);
        }  
      } else {
        fullPath = document.rutaPDF;
        if (!fullPath.includes('.pdf')) {
          const fechaField = this.dateFields[documentType];
          const fecha = convertirFechaISOaDDMMYYYY(document[fechaField]).replace(/\//g, '-');
          const fileName = formatDocumentName(documentType, fecha); 
          fullPath = path.join(document.rutaPDF, fileName);
        }
      }

      // console.log(`[DEBUG] Intentando eliminar archivo PDF: ${fullPath}`);
      await this.filesService.deleteFile(fullPath); // Usar FilesService
    } catch (error) {
      // console.error(`[ERROR] Error al eliminar el archivo PDF: ${error.message}`);
    }

    const result = await model.findByIdAndDelete(id).exec();
    return result !== null;
  } 
  
  private async actualizarUpdatedAtTrabajador(trabajadorId: string) {
    if (!trabajadorId) return;
    await this.trabajadorModel.findByIdAndUpdate(trabajadorId, { updatedAt: new Date() });
  }

}

function formatDocumentName(documentType: string, fecha: string): string {
  // Separar palabras (asumiendo camelCase, guiones bajos, y preservando espacios existentes)
  const words = documentType
    .split(/(?=[A-Z])|_/g) // Separar por camelCase o guiones bajos
    .flatMap(word => word.split(/\s+/)) // Dividir por espacios múltiples y limpiar
    .filter(word => word.trim() !== ''); // Eliminar palabras vacías
  // Capitalizar la primera letra de cada palabra
  const capitalized = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  // Unir las palabras con un espacio y agregar la fecha
  return `${capitalized.join(' ')} ${fecha}.pdf`;
}

