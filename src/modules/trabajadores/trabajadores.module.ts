import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'
import { Trabajador, TrabajadorSchema } from './schemas/trabajador.schema'
import { TrabajadoresService } from './trabajadores.service';
import { TrabajadoresController } from './trabajadores.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trabajador.name, schema: TrabajadorSchema}])
  ],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService],
})
export class TrabajadoresModule {}
