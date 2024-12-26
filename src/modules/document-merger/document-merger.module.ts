import { Module } from '@nestjs/common';
import { DocumentMergerService } from './document-merger.service';
import { DocumentMergerController } from './document-merger.controller';

@Module({
  controllers: [DocumentMergerController],
  providers: [DocumentMergerService],
})
export class DocumentMergerModule {}
