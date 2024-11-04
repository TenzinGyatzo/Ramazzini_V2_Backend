import { PartialType } from '@nestjs/mapped-types';
import { CreateAptitudDto } from './create-aptitud.dto';

export class UpdateAptitudDto extends PartialType(CreateAptitudDto) {}
