import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaMedicaDto } from './create-nota-medica.dto';

export class UpdateNotaMedicaDto extends PartialType(CreateNotaMedicaDto) {}
