import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentMergerService } from './document-merger.service';

@Controller('document-merger')
export class DocumentMergerController {
  constructor(private readonly DocumentMergerService: DocumentMergerService) {}

  @Post('merge')
  async mergePdf(
    @Body('filePaths') filePaths: string[],
    @Res() res: Response,
  ): Promise<void> {
    const mergedPdf = await this.DocumentMergerService.mergeFiles(filePaths);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
    });
    res.send(mergedPdf);
  }
}
