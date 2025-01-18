import { Injectable } from '@nestjs/common';
import { CreateProveedoresSaludDto } from './dto/create-proveedores-salud.dto';
import { UpdateProveedoresSaludDto } from './dto/update-proveedores-salud.dto';

@Injectable()
export class ProveedoresSaludService {
  create(createProveedoresSaludDto: CreateProveedoresSaludDto) {
    return 'This action adds a new proveedoresSalud';
  }

  findAll() {
    return `This action returns all proveedoresSalud`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proveedoresSalud`;
  }

  update(id: number, updateProveedoresSaludDto: UpdateProveedoresSaludDto) {
    return `This action updates a #${id} proveedoresSalud`;
  }

  remove(id: number) {
    return `This action removes a #${id} proveedoresSalud`;
  }
}
