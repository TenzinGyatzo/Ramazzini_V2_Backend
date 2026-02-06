import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'yearMonth debe tener formato YYYY-MM',
  })
  yearMonth: string;

  @IsOptional()
  @IsBoolean()
  onlyFinalized?: boolean;
}
