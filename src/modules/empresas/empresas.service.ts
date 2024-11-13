import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { normalizeEmpresaData } from 'src/utils/normalization'

@Injectable()
export class EmpresasService {
  constructor(@InjectModel(Empresa.name) private empresaModel: Model<Empresa>) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const normalizedDto = normalizeEmpresaData(createEmpresaDto);
    const createdEmpresa = new this.empresaModel(normalizedDto);
    return createdEmpresa.save();
  }

  async findAll(): Promise<Empresa[]> { // Pruebas o Los Mochis
    return this.empresaModel.find({ baseOperaciones: 'Los Mochis' }).sort({ nombreComercial: 1 }).exec();
  }

  async findOne(id: string): Promise<Empresa> {
    return this.empresaModel.findById(id).exec();
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    const normalizedDto = normalizeEmpresaData(updateEmpresaDto);
    return this.empresaModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.empresaModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}


