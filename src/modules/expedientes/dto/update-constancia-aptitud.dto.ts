import { PartialType } from '@nestjs/mapped-types';
import { CreateConstanciaAptitudDto } from './create-constancia-aptitud.dto';

export class UpdateConstanciaAptitudDto extends PartialType(CreateConstanciaAptitudDto) {}
