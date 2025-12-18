import { PartialType } from '@nestjs/mapped-types';
import { CreateCertificadoExpeditoDto } from './create-certificado-expedito.dto';

export class UpdateCertificadoExpeditoDto extends PartialType(
  CreateCertificadoExpeditoDto,
) {}
