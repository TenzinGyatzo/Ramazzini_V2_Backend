import { PartialType } from '@nestjs/swagger';
import { CreateEnfermeraFirmanteDto } from './create-enfermera-firmante.dto';

export class UpdateEnfermeraFirmanteDto extends PartialType(
  CreateEnfermeraFirmanteDto,
) {}
