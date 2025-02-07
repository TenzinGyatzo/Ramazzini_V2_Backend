import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, PreApproval, PreApprovalPlan } from 'mercadopago';

@Injectable()
export class PagosService {
  private preApprovalPlan: PreApprovalPlan;
  private preApproval: PreApproval;

  constructor() {
    // Inicializamos el cliente de Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken:
        process.env.MERCADOPAGO_ACCESS_TOKEN ||
        'TEST-4969243530752080-020520-de02f3ec1ee5a61d843153966894f824-202557314',
    });

    // Inicializamos las APIs de PreApproval y PreApprovalPlan
    this.preApprovalPlan = new PreApprovalPlan(client);
    this.preApproval = new PreApproval(client);
  }

  // Método para crear un plan de suscripción
  async crearPlanSuscripcion(planData: any): Promise<any> {
    try {
      console.log('Datos del plan de suscripción enviados:', planData);
      
      const response = await this.preApprovalPlan.create({ body: planData });
      return response;
    } catch (error) {
      console.error('Error al crear el plan de suscripción:', error);
      throw new Error('No se pudo crear el plan de suscripción.');
    }
  }   

  // Método para crear una suscripción
  async crearSuscripcion(subscriptionData: any): Promise<any> {
    try {
      const response = await this.preApproval.create({
        body: subscriptionData,
      });
      return response;
    } catch (error) {
      console.error('Error al crear la suscripción:', error);
      throw new Error('No se pudo crear la suscripción.');
    }
  }
}
