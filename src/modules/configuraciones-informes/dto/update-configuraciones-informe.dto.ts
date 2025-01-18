import { PartialType } from '@nestjs/mapped-types';
import { CreateConfiguracionesInformeDto } from './create-configuraciones-informe.dto';

export class UpdateConfiguracionesInformeDto extends PartialType(CreateConfiguracionesInformeDto) {}
