import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Validator constraint for MX-only required fields
 *
 * IMPORTANT NOTE: This constraint is a placeholder that allows values to pass.
 * Actual conditional validation must be performed in the service layer using
 * NOM024ComplianceUtil.requiresNOM024Compliance() for full async functionality
 * and service injection support.
 *
 * This decorator serves primarily as documentation and metadata marking,
 * indicating that the field requires NOM-024 compliance for MX providers.
 */
@ValidatorConstraint({ name: 'requiredForMX', async: false })
export class RequiredForMXConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    // Always allow value to pass through class-validator
    // Actual validation should be done in service layer with NOM024ComplianceUtil
    // This prevents breaking non-MX providers during DTO validation
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const customMessage =
      (args.constraints && args.constraints[0]) || undefined;
    return (
      customMessage ||
      'Este campo es obligatorio para proveedores de salud en México (NOM-024)'
    );
  }
}

/**
 * Validator constraint for conditional validation based on MX compliance
 */
@ValidatorConstraint({ name: 'validateIfMX', async: false })
export class ValidateIfMXConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    // Always allow value to pass through class-validator
    // Actual validation should be done in service layer with NOM024ComplianceUtil
    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Este campo no cumple con los requisitos de validación NOM-024';
  }
}

/**
 * Decorator that marks a field as required only for MX providers (NOM-024 compliance)
 *
 * IMPORTANT: This decorator integrates with class-validator but always allows
 * values to pass during DTO validation. Actual conditional validation MUST be
 * performed in the service layer using NOM024ComplianceUtil for full async
 * functionality and service injection support.
 *
 * Usage in DTOs:
 * ```typescript
 * @RequiredForMX()
 * curp: string;
 * ```
 *
 * Usage in services (required for actual validation):
 * ```typescript
 * const requiresCompliance = await this.nom024Util.requiresNOM024Compliance(proveedorSaludId);
 * if (requiresCompliance && !dto.curp) {
 *   throw new BadRequestException('CURP es obligatorio para proveedores en México (NOM-024)');
 * }
 * ```
 *
 * @param validationOptions - Optional validation options including custom message
 */
export function RequiredForMX(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'requiredForMX',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: RequiredForMXConstraint,
    });
  };
}

/**
 * Decorator that applies validation only for MX providers
 *
 * IMPORTANT: For complex validations, prefer using NOM024ComplianceUtil
 * in the service layer for full async functionality.
 *
 * Usage:
 * ```typescript
 * @ValidateIfMX((value) => /^[A-Z]{4}\d{6}[HM][A-Z]{5}\d{2}$/.test(value))
 * curp: string;
 * ```
 *
 * Note: This decorator currently serves as documentation. For actual validation,
 * use NOM024ComplianceUtil in the service layer.
 *
 * @param validationFn - Validation function to apply for MX providers
 * @param validationOptions - Optional validation options
 */
export function ValidateIfMX(
  validationFn: (value: any, args: ValidationArguments) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateIfMX',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [validationFn],
      validator: ValidateIfMXConstraint,
    });
  };
}
