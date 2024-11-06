// expedientes.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Antidoping } from './schemas/antidoping.schema';
import { Aptitud } from './schemas/aptitud.schema';
import { Certificado } from './schemas/certificado.schema';
import { DocumentoExterno } from './schemas/documento-externo.schema';

@Injectable()
export class ExpedientesService {
  private readonly models: Record<string, Model<any>>;

  constructor(
    @InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>,
    @InjectModel(Aptitud.name) private aptitudModel: Model<Aptitud>,
    @InjectModel(Certificado.name) private certificadoModel: Model<Certificado>,
    @InjectModel(DocumentoExterno.name) private documentoExternoModel: Model<DocumentoExterno>
  ) {
    this.models = {
      antidoping: this.antidopingModel,
      aptitud: this.aptitudModel,
      certificado: this.certificadoModel,
      documentoExterno: this.documentoExternoModel,
    };
  }

  async createDocument(documentType: string, createDto: any): Promise<any> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
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

  async updateDocument(documentType: string, id: string, updateDto: any): Promise<any> {
    const model = this.models[documentType];
    if (!model) {
      throw new BadRequestException(`Tipo de documento ${documentType} no soportado`);
    }
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