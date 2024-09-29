import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LoggerMiddleware } from './logger/logger.middleware';
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})

export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // EJEMPLO 1 - Aplica a todas las rutas de este controlador
    // consumer.apply(LoggerMiddleware).forRoutes(UsersController);
    
    // EJEMPLO 2 - Aplica a las rutas con el prefijo users
    // consumer.apply(LoggerMiddleware).forRoutes('users'); 
    
    // EJEMPLO 3 - Aplica a las rutas con el prefijo users y el método GET
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: 'users', method: RequestMethod.GET }
      )
      .apply(AuthMiddleware) // Aplica un segundo middleware
      .forRoutes('users'); // A las rutas con prefijo users
  }
}
