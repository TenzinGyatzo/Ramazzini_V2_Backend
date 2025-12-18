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
  NotFoundException,
  Param,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { UpdateAssignmentsDto } from './dto/update-assignments.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserDocument } from './schemas/user.schema';
import { generateJWT } from 'src/utils/jwt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { EmailsService } from '../emails/emails.service';

interface JwtPayload {
  id: string;
}

@Controller('auth/users')
@ApiTags('Usuarios')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailsService: EmailsService,
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const { username, email, phone, country, password } = createUserDto;

    // Validar extensión del username
    const MIN_USERNAME_LENGTH = 5;
    if (username.trim().length < MIN_USERNAME_LENGTH) {
      throw new BadRequestException(
        `El username debe tener al menos ${MIN_USERNAME_LENGTH} caracteres`,
      );
    }

    // Evitar registros duplicados
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new ConflictException(`${email} ya está registrado en Ramazzini`);
    }

    // Validar extensión del password
    const MIN_PASSWORD_LENGTH = 8;
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `El password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      );
    }

    // Si todo está bien, registra el usuario
    const user = await this.usersService.register(createUserDto);

    this.emailsService.sendEmailVerification({
      username: user.username,
      email: user.email,
      token: user.token,
    });

    // Respuesta al cliente
    res.json({
      msg: 'El usuario se creó correctamente, revisa el email',
      user: {
        username: user.username,
        email: user.email,
      },
    });

    return user;
  }

  @Get('verify/:token')
  async verifyAccount(@Req() req: Request, @Res() res: Response) {
    const { token } = req.params;

    const user = await this.usersService.findByToken(token);
    if (!user) {
      const error = new Error('Hubo un error, token no válido');
      return res.status(401).json({ msg: error.message });
    }

    // Si el token es válido, confirmar la cuenta
    try {
      user.verified = true;
      user.token = '';
      await user.save();
      return res.json({ msg: 'Usuario confirmado correctamente' });
    } catch (error) {
      console.log(error);
    }
  }

  @Post('login')
  async login(
    @Body() loginData: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { email, password } = loginData;
    // Revisar que si sea un email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('El email ingresado no es válido');
    }

    // Revisar que el usuario exista
    const user: UserDocument | null =
      await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('El usuario no existe');
    }

    // Revisar si el usuario confirmo su cuenta
    if (!user.verified) {
      throw new UnauthorizedException(
        'Tu cuenta no ha sido confirmada aún, revisa tu email',
      );
    }

    // Revisar si la cuenta está activa
    if (!user.cuentaActiva) {
      throw new UnauthorizedException(
        'Tu cuenta ha sido suspendida. Contacta al administrador.',
      );
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

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }, @Res() res: Response) {
    const { email } = body;
    // Comprobar si existe el usuario
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      const error = new Error('El usuario no existe');
      return res.status(404).json({ msg: error.message });
    }

    try {
      user.token =
        Date.now().toString(32) + Math.random().toString(32).substring(2);
      const result = await user.save();

      this.emailsService.sendEmailPasswordReset({
        username: result.username,
        email: result.email,
        token: result.token,
      });

      res.json({ msg: 'Hemos enviado un email con las instrucciones' });
    } catch (error) {
      console.log(error);
    }
  }

  @Get('forgot-password/:token')
  async verifyPasswordResetToken(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    // Comprobar si existe el usuario
    const user = await this.usersService.findByToken(token);

    if (!user) {
      const error = new Error('Hubo un error, token no válido');
      return res.status(404).json({ msg: error.message });
    }

    res.json({ msg: 'Token válido' });
  }

  @Post('forgot-password/:token')
  async updatePassword(
    @Param('token') token: string,
    @Body() body: { password: string },
    @Res() res: Response,
  ) {
    // Comprobar si existe el usuario
    const user = await this.usersService.findByToken(token);

    if (!user) {
      const error = new Error('Hubo un error, token no válido');
      return res.status(404).json({ msg: error.message });
    }

    const { password } = body;
    try {
      user.token = '';
      user.password = password;
      await user.save();
      res.json({ msg: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.log(error);
    }
  }

  @Get('get-users/:idProveedorSalud')
  async getUsersByProveedorId(
    @Param('idProveedorSalud') idProveedorSalud: string,
    @Res() res: Response,
  ) {
    try {
      const users =
        await this.usersService.findByProveedorSaludId(idProveedorSalud);
      res.json(users);
    } catch (error) {
      console.log(error);
    }
  }

  @Delete('delete-user/:email')
  async removeUserByEmail(@Param('email') email: string, @Res() res: Response) {
    try {
      const user = await this.usersService.removeUserByEmail(email);
      res.json(user);
    } catch (error) {
      console.log(error);
    }
  }

  // Endpoints para estadísticas de productividad
  @Get('productividad/todos')
  async getAllProductivityStats(
    @Res() res: Response,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    try {
      const stats = await this.usersService.getAllProductivityStats(
        fechaInicio,
        fechaFin,
      );
      res.json(stats);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message:
          'Error al obtener estadísticas de productividad de todos los usuarios',
      });
    }
  }

  @Get('productividad/:idProveedorSalud')
  async getProductivityStatsByProveedor(
    @Param('idProveedorSalud') idProveedorSalud: string,
    @Res() res: Response,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    try {
      const stats = await this.usersService.getProductivityStatsByProveedor(
        idProveedorSalud,
        fechaInicio,
        fechaFin,
      );
      res.json(stats);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: 'Error al obtener estadísticas de productividad' });
    }
  }

  @Get('estadisticas/:userId')
  async getUserDetailedStats(
    @Param('userId') userId: string,
    @Res() res: Response,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    try {
      const stats = await this.usersService.getUserDetailedStats(
        userId,
        fechaInicio,
        fechaFin,
      );
      res.json(stats);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: 'Error al obtener estadísticas del usuario' });
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

  @Patch('permisos/:userId')
  async updateUserPermissions(
    @Param('userId') userId: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.updateUserPermissions(
        userId,
        updatePermissionsDto,
      );
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json({ msg: 'Permisos actualizados correctamente', user });
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  }

  @Patch('estado-cuenta/:userId')
  async toggleAccountStatus(
    @Param('userId') userId: string,
    @Body() body: { cuentaActiva: boolean },
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.toggleAccountStatus(
        userId,
        body.cuentaActiva,
      );
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      const estado = body.cuentaActiva ? 'reactivada' : 'suspendida';
      res.json({ msg: `Cuenta ${estado} correctamente`, user });
    } catch (error) {
      console.error('Error al cambiar estado de cuenta:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  }

  @Patch('asignaciones/:userId')
  async updateUserAssignments(
    @Param('userId') userId: string,
    @Body() updateAssignmentsDto: UpdateAssignmentsDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.updateUserAssignments(
        userId,
        updateAssignmentsDto,
      );
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json({ msg: 'Asignaciones actualizadas correctamente', user });
    } catch (error) {
      console.error('Error al actualizar asignaciones:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  }

  @Get('asignaciones/:userId/centros-trabajo')
  async getUserCentrosTrabajo(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const centrosTrabajo =
        await this.usersService.getUserCentrosTrabajo(userId);
      res.json(centrosTrabajo || []);
    } catch (error) {
      console.error('Error al obtener centros de trabajo del usuario:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  }

  @Get('asignaciones/:userId')
  async getUserAssignments(
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const user = await this.usersService.getUserAssignments(userId);
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      res.json({
        empresasAsignadas: user.empresasAsignadas || [],
        centrosTrabajoAsignados: user.centrosTrabajoAsignados || [],
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      res.status(500).json({ msg: 'Error interno del servidor' });
    }
  }
}
