import { Body, Controller, Post, } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post('planes')
  async crearPlan(@Body() createPlanDto: CreatePlanDto) {
    return await this.pagosService.crearPlanSuscripcion(createPlanDto);
  }

  @Post('suscripciones')
  async crearSuscripcion(@Body() createSubscriptionDto: CreateSubscriptionDto) {
    return await this.pagosService.crearSuscripcion(createSubscriptionDto);
  }
}
