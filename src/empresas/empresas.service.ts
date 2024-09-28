import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

export interface Empresa {
    nombreComercial: string;
    razonSocial: string;
    rfc: string;
}

@Injectable()
export class EmpresasService {

    private empresas = []

    getEmpresas() {
        return this.empresas
    }

    getEmpresa(id: number) {
        const empresaFound = this.empresas.find(empresa => empresa.id === id)

        if(!empresaFound) {
            return new NotFoundException('No se encontro la empresa')
        }
    }

    createEmpresa(empresa: CreateEmpresaDto) {
        console.log(empresa);
        this.empresas.push({
            ...empresa,
            id: this.empresas.length + 1
        });
        return empresa
    }

    updateEmpresa(empresa: UpdateEmpresaDto) {
        console.log(empresa);
        return 'Actualizando empresa';
    }

    patchEmpresa() {
        return 'Actualizando parte de empresa';
    }

    deleteEmpresa() {
        return 'Eliminando empresa';
    }
}
