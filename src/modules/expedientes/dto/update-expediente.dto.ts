import { PartialType } from '@nestjs/mapped-types';
import { CreateExpedienteDto } from './create-expediente.dto';

export class UpdateExpedienteDto extends PartialType(CreateExpedienteDto) {}
