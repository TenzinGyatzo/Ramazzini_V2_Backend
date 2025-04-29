import { Injectable } from '@nestjs/common';
import { CreateRiesgosTrabajoDto } from './dto/create-riesgos-trabajo.dto';
import { UpdateRiesgosTrabajoDto } from './dto/update-riesgos-trabajo.dto';

@Injectable()
export class RiesgosTrabajoService {
  create(createRiesgosTrabajoDto: CreateRiesgosTrabajoDto) {
    return 'This action adds a new riesgosTrabajo';
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
