import { Body, Controller, Get, Param, Post, Put, } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('crear-suscripcion')
  async crearSuscripcion(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.pagosService.crearSuscripcion(createSubscriptionDto);
  }

  @Get('obtener-suscripcion-api/:id')
  async obtenerSuscripcionDeAPI(@Param('id') id: string) {
    return await this.pagosService.obtenerSuscripcionDeAPI(id);
  }

  @Get('obtener-suscripcion-db/:id')
  async obtenerSuscripcionDeBaseDatos(@Param('id') id: string) {
    return await this.pagosService.obtenerSuscripcionDeBaseDatos(id);
  }

  @Post('webhook-mercadopago')
  async recibirInformacionPago(@Body() body: any) {
    console.log('Webhook de Mercado Pago:', body);

    const eventType = body.type; // subscription_preapproval or authorized_payment
    const eventId = body.data.id; // ID del recurso asociado al evento

    try {
      if (eventType === 'subscription_preapproval') {
        // Crear una suscripción en la base de datos
        await this.pagosService.procesarPreapproval(eventId);
      } else if (eventType === 'subscription_authorized_payment') {
        // Procesar un pago autorizado
        await this.pagosService.procesarAuthorizedPayment(eventId);
      } else {
        console.log('Tipo de evento no manejado:', eventType);
      }
      
    } catch (error) {
      console.error('Error al procesar el webhook:', error);
    }

    return { message: 'Webhook recibido correctamente.' };
  }
}
