import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaAclaratoriaDto } from './create-nota-aclaratoria.dto';

export class UpdateNotaAclaratoriaDto extends PartialType(
  CreateNotaAclaratoriaDto,
) {}
