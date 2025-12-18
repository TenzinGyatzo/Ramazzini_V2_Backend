import { PartialType } from '@nestjs/mapped-types';
import { CreateRiesgosTrabajoDto } from './create-riesgos-trabajo.dto';

export class UpdateRiesgosTrabajoDto extends PartialType(
  CreateRiesgosTrabajoDto,
) {}
