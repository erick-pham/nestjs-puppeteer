import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import { AppService } from './app.service';
import * as puppeteer from 'puppeteer';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test')
  async getSample(@Res({ passthrough: true }) res: Response) {
    // Create a browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();

    // Website URL to export as pdf
    const website_url = 'https://docs.nestjs.com';

    // Open URL in current page
    await page.goto(website_url, { waitUntil: 'networkidle0' });

    //To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    // Downlaod the PDF
    const pdf = await page.pdf({
      path: 'result.pdf',
      margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
      printBackground: true,
      format: 'A4',
    });

    // Close the browser instance
    await page.close();
    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${new Date().getTime()}.pdf`,
    });
    return new StreamableFile(pdf);
  }

  @Get('/api/generate-pdf')
  async generatePDF(@Res({ passthrough: true }) res: Response) {
    // Create a browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();

    //Get HTML content from HTML file
    const html = fs.readFileSync(
      path.resolve(__dirname, '../.tmp', 'index.html'),
      'utf-8',
    );

    // Open URL in current page
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    //To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    // Downlaod the PDF
    const pdf = await page.pdf({
      margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
      printBackground: true,
      format: 'A4',
    });

    // Close the browser instance
    await page.close();
    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${new Date().getTime()}.pdf`,
    });
    return new StreamableFile(pdf);
  }
}
