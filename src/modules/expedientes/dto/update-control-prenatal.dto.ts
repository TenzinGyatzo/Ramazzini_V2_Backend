import { PartialType } from '@nestjs/mapped-types';
import { CreateControlPrenatalDto } from './create-control-prenatal.dto';

export class UpdateControlPrenatalDto extends PartialType(CreateControlPrenatalDto) {}
