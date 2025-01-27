import { PartialType } from '@nestjs/swagger';
import { CreateMedicoFirmanteDto } from './create-medico-firmante.dto';

export class UpdateMedicoFirmanteDto extends PartialType(CreateMedicoFirmanteDto) {}
