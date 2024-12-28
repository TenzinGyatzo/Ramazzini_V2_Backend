import { Controller, Post, Body, BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserDocument } from './schemas/user.schema';
import { stat } from 'fs';

@Controller('api/users')
@ApiTags('Usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const { username, password } = createUserDto;

    // Evitar registros duplicados
    const userExists = await this.usersService.findByUsername(username);
    if (userExists) {
      throw new ConflictException('El usuario ya existe');
    }

    // Validar extensión del password
    const MIN_PASSWORD_LENGTH = 8;
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(`El password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }

    // Si todo está bien, registra el usuario
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginData: { username: string; password: string }) {
    const { username, password } = loginData;

    // Revisar que el usuario exista
    const user: UserDocument | null = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }

    // Comprobar el password utilizando el método definido en el esquema
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Aquí puedes retornar un token o algún otro dato según sea necesario
    return this.usersService.login(user);
  }
}
