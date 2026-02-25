import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePermissionsDto {
  @IsBoolean()
  @IsOptional()
  gestionarEmpresas?: boolean;

  @IsBoolean()
  @IsOptional()
  gestionarCentrosTrabajo?: boolean;

  @IsBoolean()
  @IsOptional()
  gestionarTrabajadores?: boolean;

  @IsBoolean()
  @IsOptional()
  gestionarDocumentosDiagnostico?: boolean;

  @IsBoolean()
  @IsOptional()
  gestionarDocumentosEvaluacion?: boolean;

  @IsBoolean()
  @IsOptional()
  gestionarDocumentosExternos?: boolean;

  @IsBoolean()
  @IsOptional()
  gestionarOtrosDocumentos?: boolean;

  @IsBoolean()
  @IsOptional()
  accesoCompletoEmpresasCentros?: boolean;

  @IsBoolean()
  @IsOptional()
  accesoDashboardSalud?: boolean;

  @IsBoolean()
  @IsOptional()
  accesoRiesgosTrabajo?: boolean;
}
