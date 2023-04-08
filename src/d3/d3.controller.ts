import { Controller, Post, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import PDFCore from 'src/pdf-core';
import puppeteer from 'puppeteer';

class D3PDF extends PDFCore {
  async toPDF(): Promise<Buffer> {
    // Create a browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();
    await page.addScriptTag({
      path: process.cwd() + '/public/static/js/d3.v7.min.js'
    });
    // Open URL in current page
    await page.setContent(this.compiledHTML, {
      waitUntil: ['networkidle0']
    });

    //To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    // Download the PDF
    const pdf = await page.pdf(this.options);

    // Close the browser instance
    await page.close();
    await browser.close();

    return pdf;
  }
}

@Controller('d3')
export class D3Controller {
  @Post('pdf')
  async create(@Res({ passthrough: true }) res: Response) {
    const main = new D3PDF('dist/d3/templates/test', {
      displayHeaderFooter: false
    });
    await main.compile({});
    const PDFBuffer = await main.toPDF();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${new Date().getTime()}.pdf`
    });
    return new StreamableFile(PDFBuffer);
  }
}
