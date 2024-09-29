import { Injectable } from '@nestjs/common';
import { CreateCentrosTrabajoDto } from './dto/create-centros-trabajo.dto';
import { UpdateCentrosTrabajoDto } from './dto/update-centros-trabajo.dto';

@Injectable()
export class CentrosTrabajoService {
  create(createCentrosTrabajoDto: CreateCentrosTrabajoDto) {
    return 'This action adds a new centrosTrabajo';
  }

  findAll() {
    return `This action returns all centrosTrabajo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} centrosTrabajo`;
  }

  update(id: number, updateCentrosTrabajoDto: UpdateCentrosTrabajoDto) {
    return `This action updates a #${id} centrosTrabajo`;
  }

  remove(id: number) {
    return `This action removes a #${id} centrosTrabajo`;
  }
}
