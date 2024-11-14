import { Module } from '@nestjs/common';
import { InformesService } from './informes.service';
import { InformesController } from './informes.controller';
import { PrinterModule } from '../printer/printer.module';

@Module({
  controllers: [InformesController],
  providers: [InformesService],
  imports: [PrinterModule], 
})
export class InformesModule {}
