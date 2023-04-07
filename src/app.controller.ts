import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import * as puppeteer from 'puppeteer';
import type { Response } from 'express';
import PDFCore from './pdf-core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test')
  async getSample(@Res({ passthrough: true }) res: Response) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const website_url = 'https://docs.nestjs.com';
    await page.goto(website_url, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    // Download the PDF
    const pdf = await page.pdf({
      margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
      printBackground: true,
      format: 'A4'
    });

    // Close the browser instance
    await page.close();
    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${new Date().getTime()}.pdf`
    });
    return new StreamableFile(pdf);
  }

  @Get('/api/generate-pdf')
  async generatePDF(@Res({ passthrough: true }) res: Response) {
    const template = 'templates/my-report';
    const pdfCore = new PDFCore(template);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const payload = require(`${__dirname}/${template}/data.json`);

    pdfCore.compile(payload);

    const PDFBuffer = await pdfCore.toPDF();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${new Date().getTime()}.pdf`
    });
    return new StreamableFile(PDFBuffer);
  }
}
