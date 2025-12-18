import { PartialType } from '@nestjs/mapped-types';
import { CreateCentrosTrabajoDto } from './create-centros-trabajo.dto';

export class UpdateCentrosTrabajoDto extends PartialType(
  CreateCentrosTrabajoDto,
) {}
