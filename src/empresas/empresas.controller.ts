import { Body, Controller, Delete, Get, Patch, Post, Put, Query } from '@nestjs/common';
import { EmpresasService } from './empresas.service';

@Controller('empresas')
export class EmpresasController {
    constructor(private readonly empresasService: EmpresasService) {}

    @Get('/')
    getAllEmpresas(@Query() query: any) {
        console.log(query);
        return this.empresasService.getEmpresas();
    }

    @Post('/')
    createEmpresa(@Body() empresa: any) {
        return this.empresasService.createEmpresa(empresa);
    }

    @Put('/')
    updateEmpresa() {
        return this.empresasService.updateEmpresa();
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
