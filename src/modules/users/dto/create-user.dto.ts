import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

const role = ['administrador', 'medico', 'medico especialista', 'enfermero(a)', 'observer'];

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(role)
    role: string;

    @IsMongoId()
    @IsNotEmpty()
    idProveedorSalud: string;
}