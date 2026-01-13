import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export enum ConsentMethod {
  VERBAL = 'VERBAL',
  AUTOGRAFO = 'AUTOGRAFO',
}

export class CreateConsentimientoDiarioDto {
  @IsNotEmpty()
  @IsString()
  trabajadorId: string;

  @IsNotEmpty()
  @IsEnum(ConsentMethod)
  consentMethod: ConsentMethod;

  // Opcional: permite backfill histórico. Si no se envía, backend usa "hoy"
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dateKey debe estar en formato YYYY-MM-DD' })
  dateKey?: string;
}
