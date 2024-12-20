// Servicios para gestionar la data que se almacena en la base de datos
import { Injectable, BadRequestException } from '@nestjs/common';
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
    @InjectModel(HistoriaClinica.name) private historiaClinicaModel: Model<HistoriaClinica>
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
      documentoExterno: 'fechaDocumentoExterno',
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

      // Manejar caso especial para documentos externos su campo de fecha es diferente
    if (documentType === 'documentoExterno') {
      dateField = 'fechaDocumento';
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

    const fecha = updateDto[dateField];
    const trabajadorId = updateDto.idTrabajador;

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

    if (existingDocument && existingDocument._id.toString() !== id) {
      throw new BadRequestException(
        `Ya existe un documento de tipo ${documentType} para la fecha ${fecha} y el trabajador ${trabajadorId}`
      );
    }

    // console.log(`Actualizando documento con ID: ${id}`);
    return model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async removeDocument(documentType: string, id: string): Promise<boolean> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
    const result = await model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
