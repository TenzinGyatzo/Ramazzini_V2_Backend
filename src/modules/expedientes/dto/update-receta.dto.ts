import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaDto } from './create-receta.dto';

export class UpdateRecetaDto extends PartialType(CreateRecetaDto) {}
