import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateAssignmentsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  empresasAsignadas: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  centrosTrabajoAsignados: string[];
}
