/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs';
import * as path from 'path';
import handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { PDFOptions } from 'puppeteer';

export class PDFCore {
  options = null;
  template = null;
  compiledHTML = null;
  data = null;
  handlebar = handlebars;

  constructor(template: string, options?: PDFOptions) {
    this.template = template;
    this.options = {
      ...options,
      format: 'A4',
      preferCSSPageSize: true,
      printBackground: true,
      margin: {
        top: '1cm',
        bottom: '1cm',
        left: '1cm',
        right: '1cm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div></div>'
    };

    this.registerHelper();
    this.registerStyle();
  }

  resolvePath(type: string) {
    if (type === 'helpers') {
      return path.join(__dirname, `${this.template}/helpers.js`);
    }

    if (type === 'style') {
      return path.join(__dirname, `${this.template}/style.hbs`);
    }

    if (type === 'content') {
      return path.join(__dirname, `${this.template}/hbs/content.hbs`);
    }

    if (type === 'header') {
      return path.join(__dirname, `${this.template}/hbs/header.hbs`);
    }

    if (type === 'footer') {
      return path.join(__dirname, `${this.template}/hbs/footer.hbs`);
    }

    throw new Error('FILE_NOT_FOUND');
  }

  registerHelper() {
    const helpers = require(this.resolvePath('helpers'));

    Object.keys(helpers).forEach((key) =>
      this.handlebar.registerHelper(key, helpers[key])
    );
  }

  registerStyle() {
    this.handlebar.registerPartial(
      'local_style',
      fs.readFileSync(this.resolvePath('style'), 'utf-8')
    );
  }

  compile(data: any) {
    const html = fs.readFileSync(this.resolvePath('content'), 'utf8');
    this.compiledHTML = this.handlebar.compile(html)(data);

    if (this.options.displayHeaderFooter) {
      const header = fs.readFileSync(this.resolvePath('header'), 'utf8');
      const footer = fs.readFileSync(this.resolvePath('footer'), 'utf8');
      this.options.headerTemplate = this.handlebar.compile(header)(data);
      this.options.footerTemplate = this.handlebar.compile(footer)(data);
    }
  }

  toHTML() {
    return {
      compiledHTML: this.compiledHTML,
      headerTemplate: this.options.headerTemplate,
      footerTemplate: this.options.footerTemplate
    };
  }

  async toPDF(): Promise<Buffer> {
    // Create a browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();

    // Open URL in current page
    await page.setContent(this.compiledHTML, { waitUntil: 'domcontentloaded' });

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

export default PDFCore;
