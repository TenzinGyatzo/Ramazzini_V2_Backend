import { IsEmail, IsOptional } from 'class-validator';

class FreeTrialDto {
  @IsOptional()
  frequency: number;

  @IsOptional()
  frequency_type: string;
}

class AutoRecurringDto {
  @IsOptional()
  frequency: number;

  @IsOptional()
  frequency_type: string;

  @IsOptional()
  start_date: string;

  @IsOptional()
  end_date: string;

  @IsOptional()
  transaction_amount: number;

  @IsOptional()
  currency_id: string;

  @IsOptional()
  free_trial: FreeTrialDto;
}

export class CreateSubscriptionDto {
  @IsOptional()
  preapproval_plan_id: string;

  @IsOptional()
  reason: string;

  @IsOptional()
  external_reference: string;

  @IsOptional()
  @IsEmail()
  payer_email: string;

  @IsOptional()
  card_token_id: string;

  @IsOptional()
  auto_recurring: AutoRecurringDto;

  @IsOptional()
  back_url: string;

  @IsOptional()
  status: string;
}