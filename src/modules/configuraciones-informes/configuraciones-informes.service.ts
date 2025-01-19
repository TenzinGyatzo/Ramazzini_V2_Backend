import { Injectable } from '@nestjs/common';
import { CreateConfiguracionesInformeDto } from './dto/create-configuraciones-informe.dto';
import { UpdateConfiguracionesInformeDto } from './dto/update-configuraciones-informe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ConfiguracionInforme } from './schemas/configuracion-informe.schema';
import { Model } from 'mongoose';
import { normalizeConfiguracionInformeData } from 'src/utils/normalization';

@Injectable()
export class ConfiguracionesInformesService {
  constructor(@InjectModel(ConfiguracionInforme.name) private configuracionInformeModel: Model<ConfiguracionInforme>) {}

  async create(createConfiguracionesInformeDto: CreateConfiguracionesInformeDto) {
    const normalizedDto = normalizeConfiguracionInformeData(createConfiguracionesInformeDto);
    const createdConfiguracionInforme = new this.configuracionInformeModel(normalizedDto);
    return createdConfiguracionInforme.save();
  }

  async findAll(): Promise<ConfiguracionInforme[]> {
    return this.configuracionInformeModel.find().exec();
  }

  async findOne(id: string): Promise<ConfiguracionInforme> {
    return this.configuracionInformeModel.findById(id).exec();
  }

  async update(id: string, updateConfiguracionesInformeDto: UpdateConfiguracionesInformeDto): Promise<ConfiguracionInforme> {
    const normalizedDto = normalizeConfiguracionInformeData(updateConfiguracionesInformeDto);
    return this.configuracionInformeModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.configuracionInformeModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
