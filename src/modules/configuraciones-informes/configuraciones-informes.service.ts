import { Injectable } from '@nestjs/common';
import { CreateConfiguracionesInformeDto } from './dto/create-configuraciones-informe.dto';
import { UpdateConfiguracionesInformeDto } from './dto/update-configuraciones-informe.dto';

@Injectable()
export class ConfiguracionesInformesService {
  create(createConfiguracionesInformeDto: CreateConfiguracionesInformeDto) {
    return 'This action adds a new configuracionesInforme';
  }

  findAll() {
    return `This action returns all configuracionesInformes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} configuracionesInforme`;
  }

  update(id: number, updateConfiguracionesInformeDto: UpdateConfiguracionesInformeDto) {
    return `This action updates a #${id} configuracionesInforme`;
  }

  remove(id: number) {
    return `This action removes a #${id} configuracionesInforme`;
  }
}
