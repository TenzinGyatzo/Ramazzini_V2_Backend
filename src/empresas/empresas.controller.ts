import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('empresas')
export class EmpresasController {
    constructor(private readonly empresasService: EmpresasService) {}

    @Get('/')
    getAllEmpresas(@Query() query: any) {
        console.log(query);
        return this.empresasService.getEmpresas();
    }

    @Get('/:id')
    getEmpresa(@Param('id') id: string) {
        return this.empresasService.getEmpresa(parseInt(id));
    }

    @Post('/')
    createEmpresa(@Body() empresa: CreateEmpresaDto) {
        return this.empresasService.createEmpresa(empresa);
    }

    @Put('/')
    updateEmpresa(@Body() empresa: UpdateEmpresaDto) {
        return this.empresasService.updateEmpresa(empresa);
    }

    @Patch('/')
    patchEmpresa() {
        return this.empresasService.patchEmpresa();
    }

    @Delete('/')
    deleteEmpresa() {
        return this.empresasService.deleteEmpresa();
    }
    
}
