import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CentroTrabajo } from './entities/centros-trabajo.entity';
import { CreateCentrosTrabajoDto } from './dto/create-centros-trabajo.dto';
import { UpdateCentrosTrabajoDto } from './dto/update-centros-trabajo.dto';
import { normalizeCentroTrabajoData } from 'src/utils/normalization'

@Injectable()
export class CentrosTrabajoService {
  constructor(@InjectModel(CentroTrabajo.name) private centroTrabajoModel: Model<CentroTrabajo>) {}

  async create(createCentrosTrabajoDto: CreateCentrosTrabajoDto): Promise<CentroTrabajo> {
    const normalizedDto = normalizeCentroTrabajoData(createCentrosTrabajoDto);
    const createdCentroTrabajo = new this.centroTrabajoModel(normalizedDto);
    return await createdCentroTrabajo.save();
  }

  async findCentersByCompany(id: string): Promise<CentroTrabajo[]> {
    return await this.centroTrabajoModel.find({ idEmpresa: id }).exec();
  }

  async update(id: string, updateCentrosTrabajoDto: UpdateCentrosTrabajoDto): Promise<CentroTrabajo> {
    const normalizedDto = normalizeCentroTrabajoData(updateCentrosTrabajoDto);
    return await this.centroTrabajoModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.centroTrabajoModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
