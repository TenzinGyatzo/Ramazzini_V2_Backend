import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {

    const { username, password, role } = createUserDto;
    // Evitar registros duplicados
    const userExists = await this.usersService.findByUsername(username);
    if (userExists) {
      throw new Error('El usuario ya existe');
    }

    // Validar extensión del password
    const MIN_PASSWORD_LENGTH = 8;
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      throw new Error(`El password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
    }

    
    return this.usersService.register(createUserDto);
  }

}
