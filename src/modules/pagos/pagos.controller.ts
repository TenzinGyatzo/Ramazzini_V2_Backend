import { Body, Controller, Post, } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('suscripciones')
  async crearSuscripcion(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.pagosService.crearSuscripcion(createSubscriptionDto);
  }

  @Post('pago-info')
  async recibirInformacionPago(@Body() body: any) {
    console.log('body:', body);
    return body;
  }
}
