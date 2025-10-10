import { Injectable } from '@nestjs/common';
import { CreateEnfermeraFirmanteDto } from './dto/create-enfermera-firmante.dto';
import { UpdateEnfermeraFirmanteDto } from './dto/update-enfermera-firmante.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EnfermeraFirmante } from './schemas/enfermera-firmante.schema';
import { Model } from 'mongoose';
import { normalizeEnfermeraFirmanteData } from 'src/utils/normalization';

@Injectable()
export class EnfermerasFirmantesService {
  constructor(@InjectModel(EnfermeraFirmante.name) private enfermeraFirmanteModel: Model<EnfermeraFirmante>) {}

  async create(createEnfermeraFirmanteDto: CreateEnfermeraFirmanteDto) {
    const normalizedDto = normalizeEnfermeraFirmanteData(createEnfermeraFirmanteDto);
    const createdConfiguracionInforme = new this.enfermeraFirmanteModel(normalizedDto);
    return createdConfiguracionInforme.save();
  }

  async findAll(): Promise<EnfermeraFirmante[]> {
    return this.enfermeraFirmanteModel.find().exec();
  }

  async findOne(id: string): Promise<EnfermeraFirmante> {
    return this.enfermeraFirmanteModel.findById(id).exec();
  }

  async findOneByUserId(idUser: string): Promise<EnfermeraFirmante> {
    return this.enfermeraFirmanteModel.findOne({ idUser }).exec();
  }

  async update(id: string, updateEnfermeraFirmanteDto: UpdateEnfermeraFirmanteDto): Promise<EnfermeraFirmante> {
    const normalizedDto = normalizeEnfermeraFirmanteData(updateEnfermeraFirmanteDto);
    return this.enfermeraFirmanteModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.enfermeraFirmanteModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}

