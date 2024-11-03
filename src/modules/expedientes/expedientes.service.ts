import { Injectable } from '@nestjs/common';
import { CreateAntidopingDto } from './dto/create-antidoping.dto';
import { UpdateAntidopingDto } from './dto/update-antidoping.dto';
import { CreateAptitudDto } from './dto/create-aptitud.dto';
import { UpdateAptitudDto } from './dto/update-aptitud.dto';
import { CreateCertificadoDto } from './dto/create-certificado.dto';
import { UpdateCertificadoDto } from './dto/update-certificado.dto';
import { CreateDocumentoExternoDto } from './dto/create-documento-externo.dto';
import { UpdateDocumentoExternoDto } from './dto/update-documento-externo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Antidoping } from './schemas/antidoping.schema';
import { Aptitud } from './schemas/aptitud.schema';
import { Certificado } from './schemas/certificado.schema';
import { DocumentoExterno } from './schemas/documento-externo.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExpedientesService {
  constructor(
    @InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>,
    @InjectModel(Aptitud.name) private aptitudModel: Model<Aptitud>,
    @InjectModel(Certificado.name) private certificadoModel: Model<Certificado>,
    @InjectModel(DocumentoExterno.name) private documentoExternoModel: Model<DocumentoExterno>,
  ) {}

  // Servicios Antidopings
  async createAntidoping(createAntidopingDto: CreateAntidopingDto): Promise<Antidoping> {
    const createdAntidoping = new this.antidopingModel(createAntidopingDto);
    return createdAntidoping.save();
  }

  async findAntidopings(trabajadorId: string): Promise<Antidoping[]> {
    return this.antidopingModel.find({ idTrabajador: trabajadorId }).exec();
  }

  async updateAntidoping(id: string, updateAntidopingDto: UpdateAntidopingDto): Promise<Antidoping> {
    return await this.antidopingModel.findByIdAndUpdate(id, updateAntidopingDto, { new: true }).exec();
  }

  async removeAntidoping(id: string): Promise<boolean> {
    const result = await this.antidopingModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  // Servicios Aptitudes al Puesto
  async createAptitud(createAptitudDto: CreateAptitudDto): Promise<Aptitud> {
    const createdAptitud = new this.aptitudModel(createAptitudDto);
    return createdAptitud.save();
  }

  async findAptitudes(trabajadorId: string): Promise<Aptitud[]> {
    return this.aptitudModel.find({ idTrabajador: trabajadorId }).exec();
  }

  async updateAptitud(id: string, updateAptitudDto: UpdateAptitudDto): Promise<Aptitud> {
    return await this.aptitudModel.findByIdAndUpdate(id, updateAptitudDto, { new: true }).exec();
  }

  async removeAptitud(id: string): Promise<boolean> {
    const result = await this.aptitudModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  // Servicios Certificados Médicos
  async createCertificado(createCertificadoDto: CreateCertificadoDto): Promise<Certificado> {
    const createdCertificado = new this.certificadoModel(createCertificadoDto);
    return createdCertificado.save();
  }

  async findCertificados(trabajadorId: string): Promise<Certificado[]> {
    return this.certificadoModel.find({ idTrabajador: trabajadorId }).exec();
  }

  async updateCertificado(id: string, updateCertificadoDto: UpdateCertificadoDto): Promise<Certificado> {
    return await this.certificadoModel.findByIdAndUpdate(id, updateCertificadoDto, { new: true }).exec();
  }

  async removeCertificado(id: string): Promise<boolean> {
    const result = await this.certificadoModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  // Servicios Documentos Externos
  async uploadDocumentoExterno(uploadDocumentoExternoDto: CreateDocumentoExternoDto): Promise<DocumentoExterno> {
    const uploadedDocumentoExterno = new this.documentoExternoModel(uploadDocumentoExternoDto);
    return uploadedDocumentoExterno.save();
  }

  async findDocumentosExternos(trabajadorId: string): Promise<DocumentoExterno[]> {
    return this.documentoExternoModel.find({ idTrabajador: trabajadorId }).exec();
  }

  async updateDocumentoExterno(id: string, updateDocumentoExternoDto: UpdateDocumentoExternoDto): Promise<DocumentoExterno> {
    return await this.documentoExternoModel.findByIdAndUpdate(id, updateDocumentoExternoDto, { new: true }).exec();
  }

  async removeDocumentoExterno(id: string): Promise<boolean> {
    const result = await this.documentoExternoModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
