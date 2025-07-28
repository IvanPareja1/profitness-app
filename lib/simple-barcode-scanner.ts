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
  private lastDetection = 0;
  private detectionCooldown = 2000; // 2 segundos entre detecciones

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
        console.log('BarcodeDetector inicializado correctamente');
      } else {
        console.log('BarcodeDetector no disponible, usando método alternativo');
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
    this.lastDetection = 0;
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
      if (this.isScanning) {
        this.animationId = requestAnimationFrame(() => this.scanLoop());
      }
    }).catch(error => {
      // Solo mostrar errores importantes
      if (error.message && !error.message.includes('not enough data')) {
        console.warn('Error en escaneo:', error.message);
      }
      if (this.isScanning) {
        this.animationId = requestAnimationFrame(() => this.scanLoop());
      }
    });
  }

  private async scanFrame(): Promise<void> {
    if (!this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return;
    }

    // Verificar cooldown
    const now = Date.now();
    if (now - this.lastDetection < this.detectionCooldown) {
      return;
    }

    try {
      if (this.barcodeDetector) {
        // Usar BarcodeDetector API si está disponible
        const barcodes = await this.barcodeDetector.detect(this.video);

        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          if (this.isValidBarcodeValue(barcode.rawValue)) {
            this.lastDetection = now;
            this.onDetected({
              code: barcode.rawValue,
              format: barcode.format
            });
          }
        }
      }
      // Remover el método alternativo que generaba códigos demo
    } catch (error) {
      // Silenciar errores menores
      if (error instanceof Error && error.message.includes('not supported')) {
        // Ignorar errores de soporte
        return;
      }
      throw error;
    }
  }

  private isValidBarcodeValue(code: string): boolean {
    // Validar que el código tenga el formato correcto
    if (!code || code.length < 8 || code.length > 14) {
      return false;
    }

    // Verificar que solo contenga números
    if (!/^\d+$/.test(code)) {
      return false;
    }

    // Evitar códigos demo o de prueba
    const demoCodes = [
      '7501000123456',
      '7501001234567',
      '7501002345678',
      '7501003456789',
      '7501004567890'
    ];

    return !demoCodes.includes(code);
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
  // Validar código antes de hacer la petición
  if (!isValidBarcode(barcode)) {
    throw new Error('Código de barras inválido');
  }

  try {
    console.log('Buscando producto con código:', barcode);
    
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;

      // Verificar que el producto tenga información nutricional
      if (!product.nutriments) {
        throw new Error('Producto encontrado pero sin información nutricional');
      }

      console.log('Producto encontrado:', product.product_name);

      return {
        product_name: product.product_name || 'Producto desconocido',
        brands: product.brands || '',
        quantity: product.quantity || '',
        image_url: product.image_front_url || product.image_url || `https://readdy.ai/api/search-image?query=food%20product%20package%20realistic&width=200&height=200&seq=barcode_${barcode}&orientation=squarish`,
        nutriments: {
          'energy-kcal_100g': Math.round(product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0),
          'proteins_100g': Math.round((product.nutriments?.['proteins_100g'] || product.nutriments?.['proteins'] || 0) * 10) / 10,
          'carbohydrates_100g': Math.round((product.nutriments?.['carbohydrates_100g'] || product.nutriments?.['carbohydrates'] || 0) * 10) / 10,
          'fat_100g': Math.round((product.nutriments?.['fat_100g'] || product.nutriments?.['fat'] || 0) * 10) / 10,
          'fiber_100g': Math.round((product.nutriments?.['fiber_100g'] || product.nutriments?.['fiber'] || 0) * 10) / 10
        },
        categories: product.categories || '',
        ingredients_text: product.ingredients_text || ''
      };
    } else {
      throw new Error('Producto no encontrado en la base de datos');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Crear mensaje de error más específico
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else if (error.message.includes('HTTP')) {
        throw new Error('Error del servidor. Intenta más tarde.');
      } else {
        throw new Error(error.message);
      }
    } else {
      throw new Error('Error desconocido al buscar el producto');
    }
  }
}

// Función para validar código de barras
export function isValidBarcode(code: string): boolean {
  if (!code || code.length < 8 || code.length > 14) {
    return false;
  }

  if (!/^\d+$/.test(code)) {
    return false;
  }

  // Evitar códigos demo
  const demoCodes = [
    '7501000123456',
    '7501001234567',
    '7501002345678',
    '7501003456789',
    '7501004567890'
  ];

  return !demoCodes.includes(code);
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