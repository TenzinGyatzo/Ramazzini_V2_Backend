import { IsString, IsNumber, IsBoolean, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class FreeTrialDto {
  @IsNumber()
  frequency: number;

  @IsString()
  frequency_type: string;
}

class AutoRecurringDto {
  @IsNumber()
  frequency: number;

  @IsString()
  frequency_type: string;

  @IsNumber()
  transaction_amount: number;

  @IsString()
  currency_id: string;

  @IsNumber()
  repetitions: number;

  @IsNumber()
  billing_day: number;

  @IsBoolean()
  billing_day_proportional: boolean;

  @ValidateNested()
  @Type(() => FreeTrialDto)
  free_trial: FreeTrialDto;
}

export class CreatePlanDto {
  @IsString()
  reason: string;

  @ValidateNested()
  @Type(() => AutoRecurringDto)
  auto_recurring: AutoRecurringDto;

  @IsString()
  back_url: string;
}
