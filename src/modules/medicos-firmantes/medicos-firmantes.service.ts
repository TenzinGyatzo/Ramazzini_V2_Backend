import { Injectable } from '@nestjs/common';
import { CreateMedicoFirmanteDto } from './dto/create-medico-firmante.dto';
import { UpdateMedicoFirmanteDto } from './dto/update-medico-firmante.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MedicoFirmante } from './schemas/medico-firmante.schema';
import { Model } from 'mongoose';
import { normalizeMedicoFirmanteData } from 'src/utils/normalization';

@Injectable()
export class MedicosFirmantesService {
  constructor(
    @InjectModel(MedicoFirmante.name)
    private medicoFirmanteModel: Model<MedicoFirmante>,
  ) {}

  async create(createMedicoFirmanteDto: CreateMedicoFirmanteDto) {
    const normalizedDto = normalizeMedicoFirmanteData(createMedicoFirmanteDto);
    const createdConfiguracionInforme = new this.medicoFirmanteModel(
      normalizedDto,
    );
    return createdConfiguracionInforme.save();
  }

  async findAll(): Promise<MedicoFirmante[]> {
    return this.medicoFirmanteModel.find().exec();
  }

  async findOne(id: string): Promise<MedicoFirmante> {
    return this.medicoFirmanteModel.findById(id).exec();
  }

  async findOneByUserId(idUser: string): Promise<MedicoFirmante> {
    return this.medicoFirmanteModel.findOne({ idUser }).exec();
  }

  async update(
    id: string,
    updateMedicoFirmanteDto: UpdateMedicoFirmanteDto,
  ): Promise<MedicoFirmante> {
    const normalizedDto = normalizeMedicoFirmanteData(updateMedicoFirmanteDto);
    return this.medicoFirmanteModel
      .findByIdAndUpdate(id, normalizedDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.medicoFirmanteModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
