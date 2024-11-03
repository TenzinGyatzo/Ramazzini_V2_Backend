import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificadoDto } from './create-certificado.dto';

export class UpdateCertificadoDto extends PartialType(CreateCertificadoDto) {}
