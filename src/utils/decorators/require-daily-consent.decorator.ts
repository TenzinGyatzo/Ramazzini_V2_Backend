import { SetMetadata } from '@nestjs/common';

/**
 * Opciones para el decorador @RequireDailyConsent
 */
export interface RequireDailyConsentOptions {
  /**
   * Acción que se está intentando realizar
   * Ejemplos: 'create_document', 'export_giis', 'finalize_document'
   */
  action?: string;

  /**
   * Si true, no valida si no hay trabajadorId (skip validation)
   * Útil para endpoints que no siempre requieren trabajadorId
   */
  skipIfNoTrabajadorId?: boolean;
}

/**
 * Metadata key para el decorador
 */
export const REQUIRE_DAILY_CONSENT_KEY = 'requireDailyConsent';

/**
 * Decorador para marcar endpoints que requieren consentimiento informado diario
 * 
 * @example
 * @Post(':documentType/crear')
 * @UseGuards(DailyConsentGuard)
 * @RequireDailyConsent({ action: 'create_document' })
 * async createDocument(...) {
 *   // El guard ya validó el consentimiento antes de llegar aquí
 * }
 */
export const RequireDailyConsent = (options?: RequireDailyConsentOptions) =>
  SetMetadata(REQUIRE_DAILY_CONSENT_KEY, options || {});