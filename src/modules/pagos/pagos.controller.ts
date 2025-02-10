import { Body, Controller, Param, Post, } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('crear-suscripcion')
  async crearSuscripcion(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.pagosService.crearSuscripcion(createSubscriptionDto);
  }

  @Post('eliminar-suscripcion/:id')
  async eliminarSuscripcion(@Param('id') id: string) {
    return await this.pagosService.eliminarSuscripcion(id);
  }

  @Post('pago-info')
  async recibirInformacionPago(@Body() body: any) {
    console.log('body:', body);
    return body;
  }
}
