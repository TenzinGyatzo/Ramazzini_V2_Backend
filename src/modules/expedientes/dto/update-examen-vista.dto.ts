import { PartialType } from '@nestjs/mapped-types';
import { CreateExamenVistaDto } from './create-examen-vista.dto';

export class UpdateExamenVistaDto extends PartialType(CreateExamenVistaDto) {}
