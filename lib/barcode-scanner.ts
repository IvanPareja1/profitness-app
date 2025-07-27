
// Configuración para escaneo de códigos de barras
export interface BarcodeResult {
  code: string;
  format: string;
}

// Tipos para QuaggaJS - Declaración global
declare global {
  interface QuaggaJSConfigObject {
    inputStream?: {
      name?: string;
      type?: string;
      target?: HTMLElement;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: string;
      };
    };
    decoder?: {
      readers?: string[];
    };
    locate?: boolean;
    frequency?: number;
    debug?: boolean;
    halfSample?: boolean;
  }

  interface QuaggaJSResultObject {
    codeResult?: {
      code?: string;
      format?: string;
    };
  }

  interface QuaggaJSStatic {
    init(config: QuaggaJSConfigObject, callback?: (err: any) => void): void;
    start(): void;
    stop(): void;
    onDetected(callback: (result: QuaggaJSResultObject) => void): void;
  }
}

// Función para inicializar el escáner de códigos de barras
export async function initializeBarcodeScanner(
  videoElement: HTMLVideoElement,
  onBarcodeDetected: (result: BarcodeResult) => void
): Promise<void> {
  try {
    // Importar QuaggaJS dinámicamente para evitar errores de SSR
    const QuaggaModule = await import('quagga');
    const Quagga = (QuaggaModule as any).default || QuaggaModule;

    // Configurar QuaggaJS
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoElement,
        constraints: {
          width: 375,
          height: 300,
          facingMode: "environment"
        }
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true,
      frequency: 1,
      debug: false,
      halfSample: true
    }, (err: any) => {
      if (err) {
        console.error('Error initializing barcode scanner:', err);
        return;
      }

      // Iniciar el escáner
      Quagga.start();

      // Escuchar por códigos detectados
      Quagga.onDetected((result: any) => {
        if (result && result.codeResult && result.codeResult.code) {
          onBarcodeDetected({
            code: result.codeResult.code,
            format: result.codeResult.format
          });
        }
      });
    });
  } catch (error) {
    console.error('Error loading barcode scanner:', error);
    throw error;
  }
}

// Función para detener el escáner
export function stopBarcodeScanner(): void {
  try {
    // Importar QuaggaJS dinámicamente
    import('quagga').then(QuaggaModule => {
      const Quagga = (QuaggaModule as any).default || QuaggaModule;
      if (Quagga) {
        Quagga.stop();
      }
    });
  } catch (error) {
    console.error('Error stopping barcode scanner:', error);
  }
}

// Función para buscar producto por código de barras en OpenFoodFacts
export async function getProductByBarcode(barcode: string): Promise<any> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);

    if (!response.ok) {
      throw new Error('Producto no encontrado');
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      const product = data.product;

      // Mapear a nuestro formato
      return {
        product_name: product.product_name || 'Producto desconocido',
        brands: product.brands || '',
        quantity: product.quantity || '',
        image_url: product.image_front_url || product.image_url || '',
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
    throw error;
  }
}

// Función para validar código de barras
export function isValidBarcode(code: string): boolean {
  // Validar longitud típica de códigos de barras
  if (code.length < 8 || code.length > 14) {
    return false;
  }

  // Validar que contenga solo números
  if (!(/^\d+$/.test(code))) {
    return false;
  }

  return true;
}
