import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentoExternoDto } from './create-documento-externo.dto';

export class UpdateDocumentoExternoDto extends PartialType(
  CreateDocumentoExternoDto,
) {}
