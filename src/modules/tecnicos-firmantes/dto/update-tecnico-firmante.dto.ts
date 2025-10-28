import { PartialType } from '@nestjs/swagger';
import { CreateTecnicoFirmanteDto } from './create-tecnico-firmante.dto';

export class UpdateTecnicoFirmanteDto extends PartialType(CreateTecnicoFirmanteDto) {}


