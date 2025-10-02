import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoriaOtologicaDto } from './create-historia-otologica.dto';

export class UpdateHistoriaOtologicaDto extends PartialType(CreateHistoriaOtologicaDto) {}
