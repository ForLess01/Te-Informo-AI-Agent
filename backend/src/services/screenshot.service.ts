import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio para capturar screenshots de artículos web
 */
export class ScreenshotService {
  private browser: Browser | null = null;
  private screenshotsDir: string;

  constructor() {
    // Directorio para guardar screenshots
    this.screenshotsDir = path.join(process.cwd(), 'frontend', 'screenshots');
    
    // Crear directorio si no existe
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Inicializa el navegador
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      console.log('🌐 Iniciando navegador Puppeteer...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Captura screenshot de una URL
   */
  async captureScreenshot(url: string, filename?: string): Promise<string | null> {
    let page: Page | null = null;
    
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      // Configurar viewport
      await page.setViewport({ width: 1280, height: 800 });

      // Configurar user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navegar a la URL con timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      // Esperar un poco para que cargue el contenido
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar nombre de archivo único
      const screenshotFilename = filename || `screenshot_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const screenshotPath = path.join(this.screenshotsDir, screenshotFilename);

      // Capturar screenshot
      await page.screenshot({
        path: screenshotPath as `${string}.jpeg`,
        type: 'jpeg',
        quality: 80,
        fullPage: false // Solo la parte visible
      });

      console.log(`📸 Screenshot capturado: ${screenshotFilename}`);

      // Retornar ruta relativa para el frontend
      return `screenshots/${screenshotFilename}`;
    } catch (error: any) {
      console.error(`❌ Error capturando screenshot de ${url}:`, error.message);
      return null;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Captura screenshots de múltiples URLs en paralelo
   */
  async captureMultipleScreenshots(urls: string[]): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    // Limitar a 3 capturas simultáneas para no sobrecargar
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const promises = batch.map(url => this.captureScreenshot(url));
      const screenshots = await Promise.all(promises);
      
      batch.forEach((url, index) => {
        results.set(url, screenshots[index]);
      });
    }

    return results;
  }

  /**
   * Extrae contenido de texto de una página
   */
  async extractContent(url: string): Promise<string> {
    let page: Page | null = null;
    
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      // Extraer texto del artículo
      const content = await page.$eval('body', (body) => {
        return body.textContent?.trim().substring(0, 1000) || '';
      });

      return content;
    } catch (error: any) {
      console.error(`❌ Error extrayendo contenido de ${url}:`, error.message);
      return '';
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Cierra el navegador
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Navegador cerrado');
    }
  }

  /**
   * Limpia screenshots antiguos (más de 1 hora)
   */
  cleanOldScreenshots(): void {
    try {
      const files = fs.readdirSync(this.screenshotsDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.screenshotsDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < oneHourAgo) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Screenshot antiguo eliminado: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error limpiando screenshots:', error);
    }
  }
}

export default new ScreenshotService();
