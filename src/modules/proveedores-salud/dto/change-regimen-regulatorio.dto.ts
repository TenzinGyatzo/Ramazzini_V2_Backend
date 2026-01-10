import { IsEnum, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChangeRegimenRegulatorioDto {
  @IsEnum(['SIRES_NOM024', 'SIN_REGIMEN'])
  @IsNotEmpty()
  regimenRegulatorio: 'SIRES_NOM024' | 'SIN_REGIMEN';

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}