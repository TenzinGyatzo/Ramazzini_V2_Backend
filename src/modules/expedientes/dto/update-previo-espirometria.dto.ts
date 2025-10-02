import { PartialType } from '@nestjs/mapped-types';
import { CreatePrevioEspirometriaDto } from './create-previo-espirometria.dto';

export class UpdatePrevioEspirometriaDto extends PartialType(CreatePrevioEspirometriaDto) {}
