import { PartialType } from '@nestjs/swagger';
import { CreateLesionDto } from './create-lesion.dto';

/**
 * Update Lesion DTO
 * Allows partial updates but maintains validation rules
 */
export class UpdateLesionDto extends PartialType(CreateLesionDto) {}

