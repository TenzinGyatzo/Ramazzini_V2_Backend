import { Module, Global, forwardRef } from '@nestjs/common';
import { NOM024ComplianceUtil } from '../../utils/nom024-compliance.util';
import { ProveedoresSaludModule } from '../proveedores-salud/proveedores-salud.module';

/**
 * NOM-024 Compliance Module
 * 
 * Provides utilities for conditional NOM-024 compliance enforcement.
 * This module is global so it can be used across the application.
 */
@Global()
@Module({
  imports: [forwardRef(() => ProveedoresSaludModule)],
  providers: [NOM024ComplianceUtil],
  exports: [NOM024ComplianceUtil],
})
export class NOM024ComplianceModule {}

