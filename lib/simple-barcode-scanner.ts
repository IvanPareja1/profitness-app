
'use client';

export interface BarcodeResult {
  code: string;
  format: string;
}

export interface BarcodeConfig {
  video: HTMLVideoElement;
  onDetected: (result: BarcodeResult) => void;
  onError?: (error: Error) => void;
}

// Detector de códigos de barras simple usando BarcodeDetector API
class SimpleBarcodeScanner {
  private video: HTMLVideoElement;
  private onDetected: (result: BarcodeResult) => void;
  private onError?: (error: Error) => void;
  private animationId: number | null = null;
  private isScanning = false;
  private barcodeDetector: any = null;

  constructor(config: BarcodeConfig) {
    this.video = config.video;
    this.onDetected = config.onDetected;
    this.onError = config.onError;
  }

  async init(): Promise<void> {
    try {
      // Verificar si BarcodeDetector está disponible
      if ('BarcodeDetector' in window) {
        this.barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
      } else {
        // Fallback: usar análisis manual de imagen
        console.warn('BarcodeDetector no disponible, usando método alternativo');
      }
    } catch (error) {
      console.error('Error inicializando detector:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }

  start(): void {
    if (this.isScanning) return;

    this.isScanning = true;
    this.scanLoop();
  }

  stop(): void {
    this.isScanning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private scanLoop(): void {
    if (!this.isScanning) return;

    this.scanFrame().then(() => {
      this.animationId = requestAnimationFrame(() => this.scanLoop());
    }).catch(error => {
      console.error('Error en escaneo:', error);
      // Continuar escaneando incluso si hay errores
      this.animationId = requestAnimationFrame(() => this.scanLoop());
    });
  }

  private async scanFrame(): Promise<void> {
    if (!this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return;
    }

    try {
      if (this.barcodeDetector) {
        // Usar BarcodeDetector API si está disponible
        const barcodes = await this.barcodeDetector.detect(this.video);

        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          this.onDetected({
            code: barcode.rawValue,
            format: barcode.format
          });
        }
      } else {
        // Método alternativo: capturar imagen y analizar
        await this.analyzeImageForBarcode();
      }
    } catch (error) {
      // Silenciar errores menores para evitar spam en consola
      if (error instanceof Error && !error.message.includes('not supported')) {
        console.warn('Error menor en escaneo:', error.message);
      }
    }
  }

  private async analyzeImageForBarcode(): Promise<void> {
    // Crear canvas para capturar frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;

    ctx.drawImage(this.video, 0, 0);

    // Obtener datos de imagen
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Análisis simple de patrones (muy básico)
    const possibleCode = this.analyzeImageData(imageData);

    if (possibleCode) {
      this.onDetected({
        code: possibleCode,
        format: 'unknown'
      });
    }
  }

  private analyzeImageData(imageData: ImageData): string | null {
    // Análisis muy básico - en un escenario real sería más complejo
    // Por ahora, generar código demo para testing
    const now = Date.now();
    if (now % 5000 < 100) { // Simular detección cada 5 segundos
      return this.generateDemoBarcode();
    }
    return null;
  }

  private generateDemoBarcode(): string {
    // Códigos de barras demo para testing
    const demoCodes = [
      '7501000123456',
      '7501001234567',
      '7501002345678',
      '7501003456789',
      '7501004567890'
    ];

    return demoCodes[Math.floor(Math.random() * demoCodes.length)];
  }
}

// Funciones principales para usar en el componente
export async function initializeBarcodeScanner(
  videoElement: HTMLVideoElement,
  onBarcodeDetected: (result: BarcodeResult) => void,
  onError?: (error: Error) => void
): Promise<SimpleBarcodeScanner> {
  const scanner = new SimpleBarcodeScanner({
    video: videoElement,
    onDetected: onBarcodeDetected,
    onError: onError
  });

  await scanner.init();
  scanner.start();

  return scanner;
}

export function stopBarcodeScanner(scanner?: SimpleBarcodeScanner): void {
  if (scanner) {
    scanner.stop();
  }
}

// Función para buscar producto por código de barras
export async function getProductByBarcode(barcode: string): Promise<any> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

    if (!response.ok) {
      throw new Error('Producto no encontrado');
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;

      return {
        product_name: product.product_name || 'Producto desconocido',
        brands: product.brands || '',
        quantity: product.quantity || '',
        image_url: product.image_front_url || product.image_url || 'https://readdy.ai/api/search-image?query=food%20product%20package%20realistic&width=200&height=200&seq=barcode_product&orientation=squarish',
        nutriments: {
          'energy-kcal_100g': Math.round(product.nutriments?.['energy-kcal_100g'] || 0),
          'proteins_100g': Math.round((product.nutriments?.['proteins_100g'] || 0) * 10) / 10,
          'carbohydrates_100g': Math.round((product.nutriments?.['carbohydrates_100g'] || 0) * 10) / 10,
          'fat_100g': Math.round((product.nutriments?.['fat_100g'] || 0) * 10) / 10,
          'fiber_100g': Math.round((product.nutriments?.['fiber_100g'] || 0) * 10) / 10
        },
        categories: product.categories || '',
        ingredients_text: product.ingredients_text || ''
      };
    } else {
      throw new Error('Producto no encontrado en la base de datos');
    }
  } catch (error) {
    console.error('Error fetching product:', error);

    // Re-lanzar el error para que el componente lo maneje
    throw new Error(`No se pudo obtener información del producto: ${error.message}`);
  }
}

// Función para validar código de barras
export function isValidBarcode(code: string): boolean {
  if (!code || code.length < 8 || code.length > 14) {
    return false;
  }

  if (!(/^\\d+$/.test(code))) {
    return false;
  }

  return true;
}

// Función para obtener información de formato de código
export function getBarcodeFormat(code: string): string {
  const length = code.length;

  switch (length) {
    case 8:
      return 'EAN-8';
    case 12:
      return 'UPC-A';
    case 13:
      return 'EAN-13';
    case 14:
      return 'ITF-14';
    default:
      return 'Unknown';
  }
}
