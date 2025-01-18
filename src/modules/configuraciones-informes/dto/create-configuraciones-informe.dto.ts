import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, Matches, ValidateNested, IsEnum, IsMongoId } from 'class-validator';

const sexos = ['Masculino', 'Femenino'];

export class CreateConfiguracionesInformeDto {
    @IsString({ message: 'El sexo debe ser un string' })
    @IsNotEmpty({ message: 'El sexo no puede estar vacío' })
    @IsEnum(sexos, { message: 'El sexo debe ser Masculino o Femenino' })
    sexo: string;

    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    nombreMedicoFirmante: string;

    @IsString({ message: 'El numero de cédula profesional debe ser un string' })
    @IsNotEmpty({ message: 'El numero de cédula profesional no puede estar vacío' })
    numeroCedulaProfesional: string;

    
}
