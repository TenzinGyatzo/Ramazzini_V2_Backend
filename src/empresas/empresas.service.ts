import { Injectable } from '@nestjs/common';

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

    createEmpresa(empresa: any) {
        console.log(empresa);
        this.empresas.push(empresa);
        return empresa
    }

    updateEmpresa() {
        return 'Actualizando empresa';
    }

    patchEmpresa() {
        return 'Actualizando parte de empresa';
    }

    deleteEmpresa() {
        return 'Eliminando empresa';
    }
}
