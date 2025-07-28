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

// Detector de códigos de barras simple usando BarcodeDetector API y ZXing como respaldo
class SimpleBarcodeScanner {
  private video: HTMLVideoElement;
  private onDetected: (result: BarcodeResult) => void;
  private onError?: (error: Error) => void;
  private animationId: number | null = null;
  private isScanning = false;
  private barcodeDetector: any = null;
  private zxingReader: any = null;
  private lastDetection = 0;
  private detectionCooldown = 2000; // 2 segundos entre detecciones
  private useZXing = false;

  constructor(config: BarcodeConfig) {
    this.video = config.video;
    this.onDetected = config.onDetected;
    this.onError = config.onError;
  }

  async init(): Promise<void> {
    try {
      // Intentar inicializar BarcodeDetector primero
      if ('BarcodeDetector' in window) {
        this.barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
        });
        console.log('BarcodeDetector inicializado correctamente');
        this.useZXing = false;
      } else {
        console.log('BarcodeDetector no disponible, usando ZXing como respaldo');
        await this.initZXing();
      }
    } catch (error) {
      console.error('Error inicializando BarcodeDetector:', error);
      console.log('Cambiando a ZXing como respaldo');
      await this.initZXing();
    }
  }

  private async initZXing(): Promise<void> {
    try {
      // Cargar ZXing desde CDN
      if (typeof window !== 'undefined' && !(window as any).ZXing) {
        await this.loadZXingScript();
      }

      const ZXing = (window as any).ZXing;
      if (ZXing) {
        // Crear reader para múltiples formatos
        this.zxingReader = new ZXing.BrowserMultiFormatReader();
        console.log('ZXing inicializado correctamente');
        this.useZXing = true;
      } else {
        throw new Error('No se pudo cargar ZXing');
      }
    } catch (error) {
      console.error('Error inicializando ZXing:', error);
      throw error;
    }
  }

  private loadZXingScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js';
      script.onload = () => {
        console.log('ZXing script cargado');
        resolve();
      };
      script.onerror = () => {
        console.error('Error cargando ZXing script');
        reject(new Error('Error cargando ZXing script'));
      };
      document.head.appendChild(script);
    });
  }

  start(): void {
    if (this.isScanning) return;

    this.isScanning = true;
    this.lastDetection = 0;
    
    if (this.useZXing) {
      this.startZXingScanning();
    } else {
      this.scanLoop();
    }
  }

  stop(): void {
    this.isScanning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.zxingReader) {
      try {
        this.zxingReader.reset();
      } catch (error) {
        console.warn('Error al detener ZXing reader:', error);
      }
    }
  }

  private startZXingScanning(): void {
    if (!this.zxingReader || !this.video) return;

    const scanWithZXing = () => {
      if (!this.isScanning) return;

      // Verificar cooldown
      const now = Date.now();
      if (now - this.lastDetection < this.detectionCooldown) {
        setTimeout(scanWithZXing, 100);
        return;
      }

      try {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
          // Crear canvas para capturar frame
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            
            // Intentar decodificar con ZXing
            this.zxingReader.decodeFromCanvas(canvas)
              .then((result: any) => {
                if (result && this.isValidBarcodeValue(result.text)) {
                  this.lastDetection = now;
                  this.onDetected({
                    code: result.text,
                    format: result.format || 'unknown'
                  });
                } else {
                  // Continuar escaneando si no hay resultado válido
                  setTimeout(scanWithZXing, 100);
                }
              })
              .catch((error: any) => {
                // Error normal cuando no se detecta código, continuar escaneando
                setTimeout(scanWithZXing, 100);
              });
          }
        } else {
          setTimeout(scanWithZXing, 100);
        }
      } catch (error) {
        if (this.onError) {
          this.onError(error as Error);
        }
        setTimeout(scanWithZXing, 100);
      }
    };

    scanWithZXing();
  }

  private scanLoop(): void {
    if (!this.isScanning) return;

    this.scanFrame().then(() => {
      if (this.isScanning) {
        this.animationId = requestAnimationFrame(() => this.scanLoop());
      }
    }).catch(error => {
      if (this.onError) {
        this.onError(error);
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
    } catch (error) {
      // Si falla BarcodeDetector, intentar con ZXing
      if (!this.useZXing) {
        console.log('Error con BarcodeDetector, intentando con ZXing...');
        try {
          await this.initZXing();
          this.stop();
          this.start();
        } catch (zxingError) {
          throw error;
        }
      } else {
        throw error;
      }
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

    return true;
  }

  getMethod(): string {
    return this.useZXing ? 'ZXing' : 'BarcodeDetector';
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
      throw new Error('Producto no encontrado');
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
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