import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserDocument } from './schemas/user.schema';
import { generateJWT } from 'src/utils/jwt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
}

@Controller('auth/users')
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
      throw new BadRequestException(
        `El password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
    }

    // Si todo está bien, registra el usuario
    return this.usersService.register(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginData: { username: string; password: string },
    @Res() res: Response,
  ) {
    const { username, password } = loginData;
    // Revisar que el usuario exista
    const user: UserDocument | null =
      await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }

    // Comprobar el password utilizando el método definido en el esquema
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    } else {
      const token = generateJWT(user._id);
      res.json({ token });
      // return token;
    }
  }

  // Área Privada - Requiere un JWT
  @Get('user')
  async authMiddleware(@Req() req: Request, @Res() res: Response) {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      console.log('No Authorization header found');
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

      if (!decoded.id) {
        throw new BadRequestException('El ID proporcionado no es válido');
      }

      const user = await this.usersService.findById(
        decoded.id,
        '-password -token -__v',
      );
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      res.json(user);
    } catch (error) {
      res.status(401).json({ msg: error.message });
    }
  }

}
