import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * CEX NOM-024: La presión sistólica debe ser mayor o igual a la diastólica cuando ambas > 0.
 */
@ValidatorConstraint({ name: 'sistolicaMayorIgualDiastolica', async: false })
export class SistolicaMayorIgualDiastolicaConstraint
  implements ValidatorConstraintInterface
{
  validate(_value: unknown, args: ValidationArguments): boolean {
    const obj = args.object as {
      tensionArterialSistolica?: number;
      tensionArterialDiastolica?: number;
    };
    const sistolica = Number(obj.tensionArterialSistolica);
    const diastolica = Number(obj.tensionArterialDiastolica);
    if (sistolica <= 0 || diastolica <= 0) return true;
    return sistolica >= diastolica;
  }

  defaultMessage(): string {
    return 'La presión sistólica debe ser mayor o igual a la diastólica';
  }
}
