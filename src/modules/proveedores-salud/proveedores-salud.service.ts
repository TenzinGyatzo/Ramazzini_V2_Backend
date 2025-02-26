import { Injectable } from '@nestjs/common';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from './dto/update-proveedores-salud.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ProveedorSalud } from './schemas/proveedor-salud.schema';
import { Model } from 'mongoose';
import { normalizeProveedorSaludData } from 'src/utils/normalization';

@Injectable()
export class ProveedoresSaludService {
  constructor(@InjectModel(ProveedorSalud.name) private proveedoresSaludModel: Model<ProveedorSalud>) {}

  async create(createProveedoresSaludDto: CreateProveedoresSaludDto): Promise<ProveedorSalud> {
    const normalizedDto = normalizeProveedorSaludData(createProveedoresSaludDto);
    const createdProveedorSalud = new this.proveedoresSaludModel(normalizedDto);
    return createdProveedorSalud.save();
  }

  async findAll(): Promise<ProveedorSalud[]> {
    return this.proveedoresSaludModel.find().exec();
  }

  async findOne(id: string): Promise<ProveedorSalud> {
    return this.proveedoresSaludModel.findById(id).exec();
  }

  // **Método para actualizar un proveedor de salud**
  /* async update(id: string, updateProveedoresSaludDto: UpdateProveedoresSaludDto): Promise<ProveedorSalud> {
    const normalizedDto = normalizeProveedorSaludData(updateProveedoresSaludDto);
    return this.proveedoresSaludModel.findByIdAndUpdate(id, normalizedDto, { new: true }).exec();
  } */

  // **Método para actualizar los campos de uno por uno**
  async update(id: string, updateProveedoresSaludDto: UpdateProveedoresSaludDto): Promise<ProveedorSalud> {
    const proveedor = await this.proveedoresSaludModel.findById(id);
  
    if (!proveedor) {
      throw new Error('Proveedor de salud no encontrado');
    }
  
    // Actualizar solo los campos proporcionados en el DTO
    Object.keys(updateProveedoresSaludDto).forEach(key => {
      if (updateProveedoresSaludDto[key] !== undefined) {
        proveedor[key] = updateProveedoresSaludDto[key];
      }
    });
  
    return proveedor.save();
  }
  
  async remove(id: string): Promise<boolean> {
    const result = await this.proveedoresSaludModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
