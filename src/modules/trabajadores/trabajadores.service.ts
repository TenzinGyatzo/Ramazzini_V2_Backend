import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trabajador } from './entities/trabajador.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { normalizeTrabajadorData } from 'src/utils/normalization'

@Injectable()
export class TrabajadoresService {
  constructor(@InjectModel(Trabajador.name) private trabajadorModel: Model<Trabajador>) {}

  async create(createTrabajadorDto: CreateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(createTrabajadorDto);
    const createdTrabajador = new this.trabajadorModel(normalizedDto);
    return await createdTrabajador.save();
  }

  async findWorkersByCenter(id: string): Promise<Trabajador[]> {
    return await this.trabajadorModel.find({ idCentroTrabajo: id }).exec();
  }

  async findOne(id: string): Promise<Trabajador> {
    return await this.trabajadorModel.findById(id).exec();
  }

  async update(id: string, updateTrabajadorDto: UpdateTrabajadorDto): Promise<Trabajador> {
    const normalizedDto = normalizeTrabajadorData(updateTrabajadorDto);
    return await this.trabajadorModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.trabajadorModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
