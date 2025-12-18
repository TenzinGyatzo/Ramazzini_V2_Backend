import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidAudiometryValue', async: false })
export class IsValidAudiometryValueConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'number') {
      return false;
    }

    // Valores válidos: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110
    const validValues = [];
    for (let i = -10; i <= 110; i += 5) {
      validValues.push(i);
    }

    return validValues.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'El valor debe ser uno de los siguientes: -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110';
  }
}
