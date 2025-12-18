import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecomendacionItemDto {
  @IsString()
  @IsNotEmpty()
  hallazgo: string;

  @IsString()
  @IsNotEmpty()
  medidaPreventiva: string;
}

export class CreateInformePersonalizacionDto {
  @IsString()
  @IsNotEmpty()
  idEmpresa: string;

  @IsOptional()
  @IsString()
  idCentroTrabajo?: string;

  @IsOptional()
  @IsString()
  conclusiones?: string;

  @IsOptional()
  @IsEnum(['texto', 'tabla'])
  formatoRecomendaciones?: 'texto' | 'tabla';

  @IsOptional()
  @IsString()
  recomendacionesTexto?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecomendacionItemDto)
  recomendacionesTabla?: RecomendacionItemDto[];

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsString()
  @IsNotEmpty()
  updatedBy: string;
}

export class UpdateInformePersonalizacionDto {
  @IsOptional()
  @IsString()
  conclusiones?: string;

  @IsOptional()
  @IsEnum(['texto', 'tabla'])
  formatoRecomendaciones?: 'texto' | 'tabla';

  @IsOptional()
  @IsString()
  recomendacionesTexto?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecomendacionItemDto)
  recomendacionesTabla?: RecomendacionItemDto[];

  @IsString()
  @IsNotEmpty()
  updatedBy: string;
}
