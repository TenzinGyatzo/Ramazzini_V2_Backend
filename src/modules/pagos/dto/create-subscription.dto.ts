import { IsEmail, IsString, IsNumber, ValidateNested, IsDateString } from 'class-validator';

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

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsNumber()
  transaction_amount: number;

  @IsString()
  currency_id: string;

  @ValidateNested()
  free_trial: FreeTrialDto;
}

export class CreateSubscriptionDto {
  @IsString()
  preapproval_plan_id: string;

  @IsString()
  reason: string;

  @IsString()
  external_reference: string;

  @IsEmail()
  payer_email: string;

  @IsString()
  card_token_id: string;

  @ValidateNested()
  auto_recurring: AutoRecurringDto;

  @IsString()
  back_url: string;

  @IsString()
  status: string;
}
