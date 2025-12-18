import { PartialType } from '@nestjs/swagger';
import { CreateDeteccionDto } from './create-deteccion.dto';

/**
 * Update Detección DTO
 * GIIS-B019 Screening/Detection - Allows partial updates but maintains validation rules
 */
export class UpdateDeteccionDto extends PartialType(CreateDeteccionDto) {}
