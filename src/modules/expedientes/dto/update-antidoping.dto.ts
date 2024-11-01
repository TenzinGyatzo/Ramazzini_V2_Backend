import { PartialType } from '@nestjs/mapped-types';
import { CreateAntidopingDto } from './create-antidoping.dto';

export class UpdateAntidopingDto extends PartialType(CreateAntidopingDto) {}
