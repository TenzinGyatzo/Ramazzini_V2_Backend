import { Controller, Get } from '@nestjs/common';

@Controller('centros-trabajo')
export class CentrosTrabajoController {
    @Get('/:id')
    getCentrosTrabajo() {
        return 'Obteniendo todos los centros de trabajo'
    }
}
