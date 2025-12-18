import { PartialType } from '@nestjs/mapped-types';
import { CreateExploracionFisicaDto } from './create-exploracion-fisica.dto';

export class UpdateExploracionFisicaDto extends PartialType(
  CreateExploracionFisicaDto,
) {}
