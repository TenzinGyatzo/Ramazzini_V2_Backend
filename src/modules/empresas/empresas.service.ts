import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresasService {
  constructor(@InjectModel(Empresa.name) private empresaModel: Model<Empresa>) {}

  async create(createEmpresaDto: CreateEmpresaDto): Promise<Empresa> {
    const createdEmpresa = new this.empresaModel(createEmpresaDto);
    return createdEmpresa.save();
  }

  async findAll(): Promise<Empresa[]> {
    return this.empresaModel.find({ baseOperaciones: 'Pruebas' }).exec();
  }

  async findOne(id: string): Promise<Empresa> {
    return this.empresaModel.findById(id).exec();
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto): Promise<Empresa> {
    return this.empresaModel.findByIdAndUpdate(id, updateEmpresaDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Empresa> {
    return this.empresaModel.findByIdAndDelete(id).exec();
  }
}
