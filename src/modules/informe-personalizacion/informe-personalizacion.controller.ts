import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InformePersonalizacionService } from './informe-personalizacion.service';
import {
  CreateInformePersonalizacionDto,
  UpdateInformePersonalizacionDto,
} from './dto/informe-personalizacion.dto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
}

@Controller('api/informe-personalizacion')
export class InformePersonalizacionController {
  constructor(
    private readonly informePersonalizacionService: InformePersonalizacionService,
  ) {}

  // Middleware de autenticación
  private async authenticateUser(req: Request): Promise<string> {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException('Token de autorización requerido');
    }

    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      return decoded.id;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  @Post()
  async create(
    @Body() createDto: CreateInformePersonalizacionDto,
    @Req() req: Request,
  ) {
    const userId = await this.authenticateUser(req);
    createDto.createdBy = userId;
    createDto.updatedBy = userId;
    return this.informePersonalizacionService.create(createDto);
  }

  @Get('empresa/:idEmpresa')
  async findByEmpresa(
    @Param('idEmpresa') idEmpresa: string,
    @Req() req: Request,
  ) {
    await this.authenticateUser(req);
    return this.informePersonalizacionService.findByEmpresa(idEmpresa);
  }

  @Get('empresa/:idEmpresa/centro/:idCentroTrabajo')
  async findByEmpresaAndCentro(
    @Param('idEmpresa') idEmpresa: string,
    @Param('idCentroTrabajo') idCentroTrabajo: string,
    @Req() req: Request,
  ) {
    await this.authenticateUser(req);
    return this.informePersonalizacionService.findByEmpresaAndCentro(
      idEmpresa,
      idCentroTrabajo,
    );
  }

  @Get('empresa/:idEmpresa/centro')
  async findByEmpresaOnly(
    @Param('idEmpresa') idEmpresa: string,
    @Req() req: Request,
  ) {
    await this.authenticateUser(req);
    return this.informePersonalizacionService.findByEmpresaAndCentro(idEmpresa);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInformePersonalizacionDto,
    @Req() req: Request,
  ) {
    const userId = await this.authenticateUser(req);
    updateDto.updatedBy = userId;
    return this.informePersonalizacionService.update(id, updateDto);
  }

  @Put('upsert/empresa/:idEmpresa')
  async upsertByEmpresa(
    @Param('idEmpresa') idEmpresa: string,
    @Body() updateDto: UpdateInformePersonalizacionDto,
    @Req() req: Request,
  ) {
    const userId = await this.authenticateUser(req);
    updateDto.updatedBy = userId;
    return this.informePersonalizacionService.upsertByEmpresaAndCentro(
      idEmpresa,
      undefined,
      updateDto,
    );
  }

  @Put('upsert/empresa/:idEmpresa/centro/:idCentroTrabajo')
  async upsertByEmpresaAndCentro(
    @Param('idEmpresa') idEmpresa: string,
    @Param('idCentroTrabajo') idCentroTrabajo: string,
    @Body() updateDto: UpdateInformePersonalizacionDto,
    @Req() req: Request,
  ) {
    const userId = await this.authenticateUser(req);
    updateDto.updatedBy = userId;
    return this.informePersonalizacionService.upsertByEmpresaAndCentro(
      idEmpresa,
      idCentroTrabajo,
      updateDto,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    await this.authenticateUser(req);
    await this.informePersonalizacionService.delete(id);
    return { message: 'Personalización eliminada correctamente' };
  }
}
