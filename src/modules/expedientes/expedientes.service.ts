import { Injectable } from '@nestjs/common';
import { CreateExpedienteDto } from './dto/create-expediente.dto';
import { UpdateExpedienteDto } from './dto/update-expediente.dto';

@Injectable()
export class ExpedientesService {
  create(createExpedienteDto: CreateExpedienteDto) {
    return 'This action adds a new expediente';
  }

  findAll() {
    return `This action returns all expedientes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} expediente`;
  }

  update(id: number, updateExpedienteDto: UpdateExpedienteDto) {
    return `This action updates a #${id} expediente`;
  }

  remove(id: number) {
    return `This action removes a #${id} expediente`;
  }
}
