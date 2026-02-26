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
  HttpException,
  HttpStatus,
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
import { randomUUID } from 'crypto';
import { EmailsService } from '../emails/emails.service';
import { AuditService } from '../audit/audit.service';
import { AuditActionType } from '../audit/constants/audit-action-type';
import { AuditEventClass } from '../audit/constants/audit-event-class';
import { getUserIdFromRequest } from '../../utils/auth-helpers';
import { LoginLockoutService } from './login-lockout.service';

interface JwtPayload {
  id: string;
}

const LOGIN_FAIL_REASON = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_NOT_VERIFIED: 'USER_NOT_VERIFIED',
  USER_LOCKED: 'USER_LOCKED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  LOCKOUT: 'LOCKOUT',
  UNKNOWN: 'UNKNOWN',
} as const;

type LoginFailReason =
  (typeof LOGIN_FAIL_REASON)[keyof typeof LOGIN_FAIL_REASON];
const RESOURCE_TYPE_USER = 'USER';

type LoginContext = 'PRIMARY_LOGIN' | 'SESSION_UNLOCK' | 'TOKEN_REFRESH';

@Controller('auth/users')
@ApiTags('Usuarios')
export class UsersController {
  private normalizeIds(values?: string[] | null): string[] {
    if (!values) return [];
    return Array.from(new Set(values.map(String))).sort();
  }

  private diffPermissionChanges(
    before: Record<string, boolean> = {},
    after: Record<string, boolean> = {},
  ) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const addedPermissions: string[] = [];
    const removedPermissions: string[] = [];
    for (const key of keys) {
      const beforeVal = Boolean(before[key]);
      const afterVal = Boolean(after[key]);
      if (!beforeVal && afterVal) addedPermissions.push(key);
      if (beforeVal && !afterVal) removedPermissions.push(key);
    }
    return { addedPermissions, removedPermissions };
  }

  private diffAssignments(beforeIds: string[], afterIds: string[]) {
    const beforeSet = new Set(beforeIds);
    const afterSet = new Set(afterIds);
    const added: string[] = [];
    const removed: string[] = [];
    for (const id of afterSet) {
      if (!beforeSet.has(id)) added.push(id);
    }
    for (const id of beforeSet) {
      if (!afterSet.has(id)) removed.push(id);
    }
    return { added, removed };
  }
  constructor(
    private readonly usersService: UsersService,
    private readonly emailsService: EmailsService,
    private readonly auditService: AuditService,
    private readonly loginLockoutService: LoginLockoutService,
  ) {}

  private getRequestContext(req: Request) {
    return {
      ip: req?.ip ?? null,
      userAgent: req?.get?.('user-agent') ?? null,
    };
  }

  private buildLoginFailPayload(
    usernameAttempted: string,
    reason: LoginFailReason,
    req: Request,
    context: {
      loginContext: LoginContext;
      sid?: string | null;
      inactivityTimeoutMinutes?: number;
      lockedAt?: string;
      unlockedAt?: string;
    },
  ) {
    const { ip, userAgent } = this.getRequestContext(req);
    return {
      usernameAttempted,
      reason,
      loginContext: context.loginContext,
      ...(context.sid ? { sid: context.sid } : {}),
      ...(context.inactivityTimeoutMinutes != null
        ? { inactivityTimeoutMinutes: context.inactivityTimeoutMinutes }
        : {}),
      ...(context.lockedAt ? { lockedAt: context.lockedAt } : {}),
      ...(context.unlockedAt ? { unlockedAt: context.unlockedAt } : {}),
      ip,
      userAgent,
    };
  }

  private buildLoginSuccessPayload(
    req: Request,
    context: {
      loginContext: LoginContext;
      sid?: string | null;
      inactivityTimeoutMinutes?: number;
      lockedAt?: string;
      unlockedAt?: string;
    },
  ) {
    const { ip, userAgent } = this.getRequestContext(req);
    return {
      authMethod: 'password',
      loginContext: context.loginContext,
      ...(context.sid ? { sid: context.sid } : {}),
      ...(context.inactivityTimeoutMinutes != null
        ? { inactivityTimeoutMinutes: context.inactivityTimeoutMinutes }
        : {}),
      ...(context.lockedAt ? { lockedAt: context.lockedAt } : {}),
      ...(context.unlockedAt ? { unlockedAt: context.unlockedAt } : {}),
      ip,
      userAgent,
    };
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
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

    // Phase 5: audit USER_INVITATION_SENT — actor = quien envía la invitación (admin con JWT) o el propio usuario (autoregistro)
    const proveedorSaludId =
      (user as any).idProveedorSalud?.toString?.() ?? null;
    let actorId: string | null = (user as any)._id?.toString?.() ?? null;
    try {
      if (req?.headers?.authorization?.startsWith?.('Bearer ')) {
        actorId = getUserIdFromRequest(req);
      }
    } catch {
      // Sin JWT = autoregistro; actorId ya es el usuario creado
    }
    await this.auditService.record({
      proveedorSaludId,
      actorId,
      actionType: AuditActionType.USER_INVITATION_SENT,
      resourceType: RESOURCE_TYPE_USER,
      resourceId: (user as any)._id?.toString?.() ?? null,
      payload: {
        email: user.email,
        username: user.username,
        role: (user as any).role ?? null,
      },
      eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
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
      // Phase 5: audit USER_ACTIVATED
      const proveedorSaludId =
        (user as any).idProveedorSalud?.toString?.() ?? null;
      const userIdStr = (user as any)._id?.toString?.() ?? null;
      await this.auditService.record({
        proveedorSaludId,
        actorId: userIdStr,
        actionType: AuditActionType.USER_ACTIVATED,
        resourceType: RESOURCE_TYPE_USER,
        resourceId: userIdStr,
        payload: {
          email: user.email,
          username: user.username,
          role: (user as any).role ?? null,
        },
        eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
      });
      return res.json({ msg: 'Usuario confirmado correctamente' });
    } catch (error) {
      console.log(error);
    }
  }

  @Post('login')
  async login(
    @Body()
    loginData: {
      email: string;
      password: string;
      loginContext?: LoginContext;
      sid?: string;
      inactivityTimeoutMinutes?: number;
      lockedAt?: string;
      unlockedAt?: string;
    },
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const {
      email,
      password,
      loginContext,
      sid,
      inactivityTimeoutMinutes,
      lockedAt,
      unlockedAt,
    } = loginData;
    const resolvedContext: LoginContext = loginContext ?? 'PRIMARY_LOGIN';
    const isSessionUnlock = resolvedContext === 'SESSION_UNLOCK';
    const actionTypeFail = isSessionUnlock
      ? AuditActionType.SESSION_UNLOCK_FAIL
      : AuditActionType.LOGIN_FAIL;
    const actionTypeSuccess = isSessionUnlock
      ? AuditActionType.SESSION_UNLOCK_SUCCESS
      : AuditActionType.LOGIN_SUCCESS;
    // Revisar que si sea un email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('El email ingresado no es válido');
    }

    // Bloqueo temporal tras 5 intentos fallidos
    const lockoutStatus =
      await this.loginLockoutService.getLockoutStatus(email);
    if (lockoutStatus.locked && lockoutStatus.retryAfterSeconds != null) {
      const minutes = Math.ceil(lockoutStatus.retryAfterSeconds / 60);
      // Resolver usuario para auditoría (mismo actorId/proveedorSaludId que en el resto del login)
      const userForAudit = await this.usersService.findByEmail(email);
      const proveedorSaludIdForAudit = userForAudit
        ? await this.usersService.getIdProveedorSaludByUserId(
            String((userForAudit as any)._id),
          )
        : null;
      const actorIdForAudit = userForAudit
        ? (userForAudit as any)._id.toString()
        : 'ANONYMOUS';
      await this.auditService
        .record({
          proveedorSaludId: proveedorSaludIdForAudit,
          actorId: actorIdForAudit,
          actionType: AuditActionType.LOGIN_BLOCKED,
          resourceType: 'AUTH',
          resourceId: userForAudit
            ? (userForAudit as any)._id.toString()
            : null,
          payload: this.buildLoginFailPayload(
            email,
            LOGIN_FAIL_REASON.LOCKOUT,
            req,
            {
              loginContext: resolvedContext,
              sid: sid ?? null,
              inactivityTimeoutMinutes,
              lockedAt,
              unlockedAt,
            },
          ),
          eventClass: AuditEventClass.CLASS_2_SOFT_FAIL,
        })
        .catch(() => {});
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Demasiados intentos fallidos. Intente de nuevo en ${minutes} minuto${minutes !== 1 ? 's' : ''}.`,
          retryAfterSeconds: lockoutStatus.retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Revisar que el usuario exista
    const user: UserDocument | null =
      await this.usersService.findByEmail(email);
    if (!user) {
      await this.loginLockoutService.recordFailedAttempt(email);
      await this.auditService
        .record({
          proveedorSaludId: null,
          actorId: null,
          actionType: actionTypeFail,
          resourceType: 'AUTH',
          resourceId: null,
          payload: this.buildLoginFailPayload(
            email,
            LOGIN_FAIL_REASON.USER_NOT_FOUND,
            req,
            {
              loginContext: resolvedContext,
              sid: sid ?? null,
              inactivityTimeoutMinutes,
              lockedAt,
              unlockedAt,
            },
          ),
          eventClass: AuditEventClass.CLASS_2_SOFT_FAIL,
        })
        .catch(() => {});
      throw new UnauthorizedException('El usuario no existe');
    }

    // idProveedorSalud desde BD (lean) para auditoría/proveedor
    const proveedorSaludId =
      await this.usersService.getIdProveedorSaludByUserId(
        String((user as any)._id),
      );

    // Revisar si el usuario confirmo su cuenta
    if (!user.verified) {
      await this.loginLockoutService.recordFailedAttempt(email);
      await this.auditService
        .record({
          proveedorSaludId,
          actorId: user._id.toString(),
          actionType: actionTypeFail,
          resourceType: 'AUTH',
          resourceId: user._id.toString(),
          payload: this.buildLoginFailPayload(
            email,
            LOGIN_FAIL_REASON.USER_NOT_VERIFIED,
            req,
            {
              loginContext: resolvedContext,
              sid: sid ?? null,
              inactivityTimeoutMinutes,
              lockedAt,
              unlockedAt,
            },
          ),
          eventClass: AuditEventClass.CLASS_2_SOFT_FAIL,
        })
        .catch(() => {});
      throw new UnauthorizedException(
        'Tu cuenta no ha sido confirmada aún, revisa tu email',
      );
    }

    // Revisar si la cuenta está activa
    if (!user.cuentaActiva) {
      await this.loginLockoutService.recordFailedAttempt(email);
      await this.auditService
        .record({
          proveedorSaludId,
          actorId: user._id.toString(),
          actionType: actionTypeFail,
          resourceType: 'AUTH',
          resourceId: user._id.toString(),
          payload: this.buildLoginFailPayload(
            email,
            LOGIN_FAIL_REASON.USER_LOCKED,
            req,
            {
              loginContext: resolvedContext,
              sid: sid ?? null,
              inactivityTimeoutMinutes,
              lockedAt,
              unlockedAt,
            },
          ),
          eventClass: AuditEventClass.CLASS_2_SOFT_FAIL,
        })
        .catch(() => {});
      throw new UnauthorizedException(
        'Tu cuenta ha sido suspendida. Contacta al administrador.',
      );
    }

    // Comprobar el password utilizando el método definido en el esquema
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      await this.loginLockoutService.recordFailedAttempt(email);
      await this.auditService
        .record({
          proveedorSaludId,
          actorId: user._id.toString(),
          actionType: actionTypeFail,
          resourceType: 'AUTH',
          resourceId: user._id.toString(),
          payload: this.buildLoginFailPayload(
            email,
            LOGIN_FAIL_REASON.INVALID_CREDENTIALS,
            req,
            {
              loginContext: resolvedContext,
              sid: sid ?? null,
              inactivityTimeoutMinutes,
              lockedAt,
              unlockedAt,
            },
          ),
          eventClass: AuditEventClass.CLASS_2_SOFT_FAIL,
        })
        .catch(() => {});
      throw new UnauthorizedException('Contraseña incorrecta');
    }
    await this.loginLockoutService.clearLockout(email);
    const token = generateJWT(user._id);
    const sidToReturn =
      resolvedContext === 'PRIMARY_LOGIN' ? randomUUID() : (sid ?? null);
    res.json({ token, ...(sidToReturn ? { sid: sidToReturn } : {}) });
    await this.auditService
      .record({
        proveedorSaludId,
        actorId: user._id.toString(),
        actionType: actionTypeSuccess,
        resourceType: 'AUTH',
        resourceId: user._id.toString(),
        payload: this.buildLoginSuccessPayload(req, {
          loginContext: resolvedContext,
          sid: sidToReturn,
          inactivityTimeoutMinutes,
          lockedAt,
          unlockedAt,
        }),
        eventClass: AuditEventClass.CLASS_2_SOFT_FAIL,
      })
      .catch(() => {});
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
      // Phase 5: audit USER_PASSWORD_CHANGED (user changing own password)
      const proveedorSaludId =
        (user as any).idProveedorSalud?.toString?.() ?? null;
      const userIdStr = (user as any)._id?.toString?.() ?? null;
      await this.auditService.record({
        proveedorSaludId,
        actorId: userIdStr,
        actionType: AuditActionType.USER_PASSWORD_CHANGED,
        resourceType: RESOURCE_TYPE_USER,
        resourceId: userIdStr,
        payload: { userId: userIdStr },
        eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
      });
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
  async removeUserByEmail(
    @Param('email') email: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      const existingUser = await this.usersService.findByEmail(email);
      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const snapshot = {
        email: existingUser.email,
        username: existingUser.username,
        role: (existingUser as any).role ?? null,
      };
      const resourceId = (existingUser as any)._id?.toString?.() ?? null;
      const user = await this.usersService.removeUserByEmail(email);
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const actorId = getUserIdFromRequest(req);
      const actorProveedorSaludId =
        await this.usersService.getIdProveedorSaludByUserId(actorId);
      await this.auditService.record({
        proveedorSaludId: actorProveedorSaludId ?? null,
        actorId,
        actionType: AuditActionType.USER_DELETED,
        resourceType: RESOURCE_TYPE_USER,
        resourceId,
        payload: snapshot,
        eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
      });
      res.json(user);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log(error);
      res.status(500).json({ msg: 'Error al eliminar usuario' });
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
    @Req() req: Request,
  ) {
    try {
      const actorId = getUserIdFromRequest(req);
      const actorProveedorSaludId =
        await this.usersService.getIdProveedorSaludByUserId(actorId);
      if (!actorProveedorSaludId) {
        throw new BadRequestException(
          'Proveedor de salud del actor no resuelto',
        );
      }

      const targetUser = await this.usersService.findById(
        userId,
        'idProveedorSalud role permisos',
      );
      if (!targetUser) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      const targetProveedorId = targetUser.idProveedorSalud?.toString?.();
      if (!targetProveedorId || targetProveedorId !== actorProveedorSaludId) {
        throw new UnauthorizedException('Acceso fuera del proveedor de salud');
      }

      const user = await this.usersService.updateUserPermissions(
        userId,
        updatePermissionsDto,
      );
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      const beforePerms =
        (targetUser as any).permisos?.toObject?.() ??
        (targetUser as any).permisos ??
        {};
      const afterPerms =
        (user as any).permisos?.toObject?.() ?? (user as any).permisos ?? {};
      const { addedPermissions, removedPermissions } =
        this.diffPermissionChanges(beforePerms, afterPerms);

      await this.auditService.record({
        proveedorSaludId: actorProveedorSaludId,
        actorId,
        actionType: AuditActionType.ADMIN_ROLES_PERMISSIONS,
        resourceType: RESOURCE_TYPE_USER,
        resourceId: userId,
        payload: {
          actionScope: 'PERMISSIONS',
          targetUserId: userId,
          addedPermissions,
          removedPermissions,
          targetRole: (user as any).role ?? (targetUser as any).role ?? null,
        },
        eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
      });
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
    @Req() req: Request,
  ) {
    try {
      const user = await this.usersService.toggleAccountStatus(
        userId,
        body.cuentaActiva,
      );
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      const actorId = getUserIdFromRequest(req);
      const actorProveedorSaludId =
        await this.usersService.getIdProveedorSaludByUserId(actorId);
      const actionType = body.cuentaActiva
        ? AuditActionType.USER_REACTIVATED
        : AuditActionType.USER_SUSPENDED;
      await this.auditService.record({
        proveedorSaludId: actorProveedorSaludId ?? null,
        actorId,
        actionType,
        resourceType: RESOURCE_TYPE_USER,
        resourceId: userId,
        payload: {
          email: user.email,
          username: user.username,
          role: (user as any).role ?? null,
        },
        eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
      });
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
    @Req() req: Request,
  ) {
    try {
      const actorId = getUserIdFromRequest(req);
      const actorProveedorSaludId =
        await this.usersService.getIdProveedorSaludByUserId(actorId);
      if (!actorProveedorSaludId) {
        throw new BadRequestException(
          'Proveedor de salud del actor no resuelto',
        );
      }

      const targetUser = await this.usersService.findById(
        userId,
        'idProveedorSalud empresasAsignadas centrosTrabajoAsignados',
      );
      if (!targetUser) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      const targetProveedorId = targetUser.idProveedorSalud?.toString?.();
      if (!targetProveedorId || targetProveedorId !== actorProveedorSaludId) {
        throw new UnauthorizedException('Acceso fuera del proveedor de salud');
      }

      const beforeEmpresas = this.normalizeIds(
        (targetUser as any).empresasAsignadas ?? [],
      );
      const beforeCentros = this.normalizeIds(
        (targetUser as any).centrosTrabajoAsignados ?? [],
      );

      const user = await this.usersService.updateUserAssignments(
        userId,
        updateAssignmentsDto,
      );
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }

      const afterEmpresas = this.normalizeIds(
        (user as any).empresasAsignadas ?? [],
      );
      const afterCentros = this.normalizeIds(
        (user as any).centrosTrabajoAsignados ?? [],
      );

      const empresasDiff = this.diffAssignments(beforeEmpresas, afterEmpresas);
      const centrosDiff = this.diffAssignments(beforeCentros, afterCentros);
      const empresasChanged =
        empresasDiff.added.length > 0 || empresasDiff.removed.length > 0;
      const centrosChanged =
        centrosDiff.added.length > 0 || centrosDiff.removed.length > 0;
      const changed = empresasChanged || centrosChanged;

      await this.auditService.record({
        proveedorSaludId: actorProveedorSaludId,
        actorId,
        actionType: AuditActionType.ADMIN_USER_ASSIGNMENTS,
        resourceType: RESOURCE_TYPE_USER,
        resourceId: userId,
        payload: {
          actionScope: 'ASSIGNMENTS',
          targetUserId: userId,
          changed,
          empresasChanged,
          centrosChanged,
          empresasCountBefore: beforeEmpresas.length,
          empresasCountAfter: afterEmpresas.length,
          centrosCountBefore: beforeCentros.length,
          centrosCountAfter: afterCentros.length,
          empresasIdsAdded: empresasDiff.added,
          empresasIdsRemoved: empresasDiff.removed,
          centrosIdsAdded: centrosDiff.added,
          centrosIdsRemoved: centrosDiff.removed,
        },
        eventClass: AuditEventClass.CLASS_1_HARD_FAIL,
      });
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
