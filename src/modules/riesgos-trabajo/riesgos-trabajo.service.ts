import { Injectable } from '@nestjs/common';
import { CreateRiesgosTrabajoDto } from './dto/create-riesgos-trabajo.dto';
import { UpdateRiesgosTrabajoDto } from './dto/update-riesgos-trabajo.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RiesgoTrabajo } from './schemas/riesgo-trabajo.schema';

@Injectable()
export class RiesgosTrabajoService {
  constructor(
    @InjectModel(RiesgoTrabajo.name) private RiesgoTrabajoModel: Model<RiesgoTrabajo>,
  ) {}

  async create(createRiesgosTrabajoDto: CreateRiesgosTrabajoDto) {
    try {
      const riesgoTrabajo = new this.RiesgoTrabajoModel(createRiesgosTrabajoDto);
      const savedRiesgoTrabajo = await riesgoTrabajo.save();
      return savedRiesgoTrabajo;
    } catch (error) {
      console.error('Error al guardar el riesgo de trabajo:', error);
      throw new Error('Error al guardar el riesgo de trabajo');
    }
  }

  findAll() {
    return `This action returns all riesgosTrabajo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} riesgosTrabajo`;
  }

  update(id: number, updateRiesgosTrabajoDto: UpdateRiesgosTrabajoDto) {
    return `This action updates a #${id} riesgosTrabajo`;
  }

  remove(id: number) {
    return `This action removes a #${id} riesgosTrabajo`;
  }
}
