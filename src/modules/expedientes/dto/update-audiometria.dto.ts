import { PartialType } from '@nestjs/mapped-types';
import { CreateAudiometriaDto } from './create-audiometria.dto';

export class UpdateAudiometriaDto extends PartialType(CreateAudiometriaDto) {}
