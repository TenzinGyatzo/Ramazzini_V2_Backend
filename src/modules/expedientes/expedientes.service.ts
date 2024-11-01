import { Injectable } from '@nestjs/common';
import { CreateAntidopingDto } from './dto/create-antidoping.dto';
import { UpdateAntidopingDto } from './dto/update-antidoping.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Antidoping } from './schemas/antidoping.schema';
import { Model } from 'mongoose';

@Injectable()
export class ExpedientesService {
  constructor(@InjectModel(Antidoping.name) private antidopingModel: Model<Antidoping>) {}

  async create(createAntidopingDto: CreateAntidopingDto): Promise<Antidoping> {
    const createdAntidoping = new this.antidopingModel(createAntidopingDto);
    return createdAntidoping.save();
  }

  async findAntidopings(trabajadorId: string): Promise<Antidoping[]> {
    return this.antidopingModel.find({ idTrabajador: trabajadorId }).exec();
  }

  async findOne(id: string) {
    return `This action returns a #${id} expediente`;
  }

  async update(id: string, updateAntidopingDto: UpdateAntidopingDto): Promise<Antidoping> {
    return await this.antidopingModel.findByIdAndUpdate(id, updateAntidopingDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.antidopingModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
