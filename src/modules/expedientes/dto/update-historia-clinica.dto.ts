import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoriaClinicaDto } from './create-historia-clinica.dto';

export class UpdateHistoriaClinicaDto extends PartialType(CreateHistoriaClinicaDto) {}
