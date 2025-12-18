import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { CatalogType } from '../interfaces/catalog-entry.interface';

export class ValidateCatalogDto {
  @IsString()
  code: string;

  @IsEnum(CatalogType)
  catalogType: CatalogType;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsNumber()
  age?: number;
}

export class SearchCatalogDto {
  @IsEnum(CatalogType)
  catalogType: CatalogType;

  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
