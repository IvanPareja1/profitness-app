
// 'use client';

export interface BarcodeResult {
  code: string;
  format: string;
  confidence?: number;
  timestamp?: number;
  location?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export interface BarcodeConfig {
  video: HTMLVideoElement;
  onDetected: (result: BarcodeResult) => void;
  onError?: (error: Error) => void;
  continuous?: boolean;
  formats?: string[];
  scanArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

// Escáner de códigos de barras SIMPLIFICADO con enfoque optimizado
class OptimizedBarcodeScanner {
  private video: HTMLVideoElement;
  private onDetected: (result: BarcodeResult) => void;
  private onError?: (error: Error) => void;
  private animationId: number | null = null;
  private isScanning = false;
  private barcodeDetector: any = null;
  private zxingReader: any = null;
  private lastDetection = 0;
  private detectionCooldown = 800; // Reducido para mejor respuesta
  private useZXing = false;
  private continuous = true;
  private supportedFormats: string[];
  private consecutiveDetections = 0;
  private requiredConsecutive = 3; // Confirmaciones necesarias
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private scanArea?: { x: number; y: number; width: number; height: number };

  // PROPIEDADES SIMPLIFICADAS PARA ENFOQUE
  private currentTrack: MediaStreamTrack | null = null;
  private focusInterval: NodeJS.Timeout | null = null;

  constructor(config: BarcodeConfig) {
    this.video = config.video;
    this.onDetected = config.onDetected;
    this.onError = config.onError;
    this.continuous = config.continuous ?? true;
    this.scanArea = config.scanArea;
    this.supportedFormats = config.formats || [
      "ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"
    ];

    // Crear canvas optimizado
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("No se pudo crear contexto del canvas");
    }
    this.context = ctx;
  }

  async init(): Promise<void> {
    try {
      // Intentar BarcodeDetector primero
      if (typeof window !== 'undefined' && "BarcodeDetector" in window) {
        try {
          const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats();
          console.log("BarcodeDetector disponible con formatos:", supportedFormats);

          this.barcodeDetector = new (window as any).BarcodeDetector({
            formats: this.supportedFormats.filter((format) =>
              supportedFormats.includes(format)
            ),
          });

          this.useZXing = false;
          return;
        } catch (error) {
          console.warn("Error con BarcodeDetector:", error);
        }
      }

      // Fallback a ZXing
      console.log("Usando ZXing como fallback...");
      await this.initZXing();
    } catch (error) {
      console.error("Error inicializando scanner:", error);
      throw error;
    }
  }

  // MÉTODO SIMPLIFICADO PARA INICIALIZAR CÁMARA CON MEJOR ENFOQUE
  async setupCamera(): Promise<MediaStream> {
    try {
      console.log("Configurando cámara con enfoque optimizado...");

      // Configuración de cámara optimizada para códigos de barras
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Cámara trasera
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30 },
          // Configuraciones que ayudan al enfoque
          focusMode: 'continuous' as any,
          exposureMode: 'continuous' as any,
          whiteBalanceMode: 'continuous' as any
        } as MediaTrackConstraints
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentTrack = stream.getVideoTracks()[0];

      if (this.currentTrack) {
        // Aplicar configuraciones avanzadas de enfoque
        await this.optimizeCameraForBarcodes();
      }

      return stream;
    } catch (error) {
      console.error("Error configurando cámara:", error);
      throw error;
    }
  }

  // OPTIMIZACIÓN SIMPLIFICADA DE CÁMARA PARA CÓDIGOS DE BARRAS
  private async optimizeCameraForBarcodes(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      const capabilities = this.currentTrack.getCapabilities() as any;
      console.log("Capacidades disponibles:", capabilities);

      const constraints: any = {};

      // ENFOQUE CONTINUO (la configuración más importante)
      if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
        constraints.focusMode = 'continuous';
        console.log("✓ Enfoque continuo activado");
      } else if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
        // Distancia manual óptima para códigos de barras (30-50cm)
        constraints.focusMode = 'manual';
        constraints.focusDistance = 0.4; // Distancia óptima
        console.log("✓ Enfoque manual activado a 40cm");
      }

      // EXPOSICIÓN AUTOMÁTICA
      if (capabilities.exposureMode && capabilities.exposureMode.includes('continuous')) {
        constraints.exposureMode = 'continuous';
        console.log("✓ Exposición automática activada");
      }

      // BALANCE DE BLANCOS
      if (capabilities.whiteBalanceMode && capabilities.whiteBalanceMode.includes('continuous')) {
        constraints.whiteBalanceMode = 'continuous';
        console.log("✓ Balance de blancos automático activado");
      }

      // Aplicar todas las configuraciones
      if (Object.keys(constraints).length > 0) {
        await this.currentTrack.applyConstraints({
          advanced: [constraints]
        });
        console.log("Configuraciones aplicadas correctamente");
      }

      // Iniciar ajuste periódico del enfoque
      this.startPeriodicFocusOptimization();

    } catch (error) {
      console.warn("Algunas configuraciones no pudieron aplicarse:", error);
    }
  }

  // AJUSTE PERIÓDICO SIMPLIFICADO DEL ENFOQUE
  private startPeriodicFocusOptimization(): void {
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
    }

    // Cada 3 segundos, intentar reoptimizar el enfoque
    this.focusInterval = setInterval(async () => {
      if (!this.isScanning || !this.currentTrack) return;

      try {
        const capabilities = this.currentTrack.getCapabilities() as any;
        
        // Si tiene enfoque manual, probar distancias óptimas
        if (capabilities.focusMode && capabilities.focusMode.includes('manual')) {
          // Alternar entre distancias óptimas para códigos de barras
          const distances = [0.3, 0.4, 0.5]; // 30cm, 40cm, 50cm
          const randomDistance = distances[Math.floor(Math.random() * distances.length)];
          
          await this.currentTrack.applyConstraints({
            advanced: [{
              focusMode: 'manual',
              focusDistance: randomDistance
            } as any]
          });
        }
      } catch (error) {
        // Ignorar errores silenciosamente para no afectar el escaneo
      }
    }, 3000);
  }

  async initZXing(): Promise<void> {
    try {
      if (typeof window !== "undefined" && !(window as any).ZXing) {
        await this.loadZXingScript();
      }

      const ZXing = (window as any).ZXing;
      if (!ZXing) {
        throw new Error("No se pudo cargar ZXing");
      }

      this.zxingReader = new ZXing.BrowserMultiFormatReader();
      this.useZXing = true;
      console.log("ZXing inicializado correctamente");
    } catch (error) {
      console.error("Error inicializando ZXing:", error);
      throw error;
    }
  }

  private loadZXingScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js";
      script.async = true;

      script.onload = () => {
        console.log("ZXing cargado exitosamente");
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Error cargando ZXing"));
      };

      if (typeof document !== 'undefined') {
        document.head.appendChild(script);
      }
    });
  }

  start(): void {
    if (this.isScanning) return;

    this.isScanning = true;
    this.lastDetection = 0;
    this.consecutiveDetections = 0;

    console.log(`Iniciando scanner con: ${this.useZXing ? "ZXing" : "BarcodeDetector"}`);

    if (this.useZXing) {
      this.startZXingScanning();
    } else {
      this.startBarcodeDetectorScanning();
    }
  }

  stop(): void {
    if (!this.isScanning) return;

    this.isScanning = false;

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Limpiar intervalo de enfoque
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
      this.focusInterval = null;
    }

    this.currentTrack = null;
    this.consecutiveDetections = 0;

    console.log("Scanner detenido");
  }

  private startBarcodeDetectorScanning(): void {
    const scanLoop = () => {
      if (!this.isScanning) return;

      this.scanFrameWithBarcodeDetector().then(() => {
        if (this.isScanning && this.continuous) {
          this.animationId = requestAnimationFrame(scanLoop);
        }
      }).catch(() => {
        if (this.isScanning && this.continuous) {
          this.animationId = requestAnimationFrame(scanLoop);
        }
      });
    };

    scanLoop();
  }

  private startZXingScanning(): void {
    const scanWithZXing = () => {
      if (!this.isScanning) return;

      try {
        const imageData = this.preprocessFrame();
        if (!imageData) {
          setTimeout(scanWithZXing, 100);
          return;
        }

        // Verificar cooldown
        const now = Date.now();
        if (now - this.lastDetection < this.detectionCooldown) {
          setTimeout(scanWithZXing, 50);
          return;
        }

        if (this.zxingReader && this.zxingReader.decodeFromCanvas) {
          this.zxingReader.decodeFromCanvas(this.canvas)
            .then((result: any) => {
              if (result && this.isValidBarcode(result.text)) {
                const barcodeResult: BarcodeResult = {
                  code: result.text,
                  format: this.mapZXingFormat(result.format) || "unknown",
                  confidence: 0.9,
                  timestamp: now
                };

                this.processDetection(barcodeResult);
              }

              if (this.continuous) {
                setTimeout(scanWithZXing, 100);
              }
            })
            .catch(() => {
              if (this.continuous) {
                setTimeout(scanWithZXing, 150);
              }
            });
        }
      } catch (error) {
        if (this.onError) {
          this.onError(error as Error);
        }
        if (this.continuous) {
          setTimeout(scanWithZXing, 200);
        }
      }
    };

    scanWithZXing();
  }

  private async scanFrameWithBarcodeDetector(): Promise<void> {
    const imageData = this.preprocessFrame();
    if (!imageData) return;

    const now = Date.now();
    if (now - this.lastDetection < this.detectionCooldown) {
      return;
    }

    try {
      if (this.barcodeDetector) {
        const barcodes = await this.barcodeDetector.detect(this.canvas);

        for (const barcode of barcodes) {
          if (this.isValidBarcode(barcode.rawValue)) {
            const barcodeResult: BarcodeResult = {
              code: barcode.rawValue,
              format: barcode.format,
              confidence: 0.95,
              timestamp: now
            };

            this.processDetection(barcodeResult);
            break;
          }
        }
      }
    } catch (error) {
      // Si falla BarcodeDetector, cambiar a ZXing
      if (!this.useZXing) {
        console.log("Cambiando a ZXing por error en BarcodeDetector");
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

  // PRE-PROCESAMIENTO MEJORADO PARA MEJOR NITIDEZ
  private preprocessFrame(): ImageData | null {
    if (!this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return null;
    }

    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;

    // Usar área central optimizada para códigos de barras
    let scanWidth, scanHeight, scanX, scanY;

    if (this.scanArea) {
      scanX = Math.floor(this.scanArea.x * videoWidth);
      scanY = Math.floor(this.scanArea.y * videoHeight);
      scanWidth = Math.floor(this.scanArea.width * videoWidth);
      scanHeight = Math.floor(this.scanArea.height * videoHeight);
    } else {
      // Área central del 70% para mejor enfoque
      const cropRatio = 0.7;
      scanWidth = Math.floor(videoWidth * cropRatio);
      scanHeight = Math.floor(videoHeight * cropRatio);
      scanX = Math.floor((videoWidth - scanWidth) / 2);
      scanY = Math.floor((videoHeight - scanHeight) / 2);
    }

    this.canvas.width = scanWidth;
    this.canvas.height = scanHeight;

    // Configuraciones de canvas para mejor calidad
    this.context.imageSmoothingEnabled = false; // Importante para códigos
    this.context.imageSmoothingQuality = 'high';

    // Dibujar frame
    this.context.drawImage(
      this.video, 
      scanX, scanY, scanWidth, scanHeight,
      0, 0, scanWidth, scanHeight
    );

    // Aplicar mejoras para códigos de barras
    const imageData = this.context.getImageData(0, 0, scanWidth, scanHeight);
    const enhancedData = this.enhanceForBarcodes(imageData);

    this.context.putImageData(enhancedData, 0, 0);
    return enhancedData;
  }

  // MEJORAS ESPECÍFICAS PARA CÓDIGOS DE BARRAS
  private enhanceForBarcodes(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    for (let i = 0; i < data.length; i += 4) {
      // Convertir a escala de grises
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      
      // Aplicar contraste alto para códigos de barras
      const enhanced = gray > 128 ? 255 : 0;

      output[i] = enhanced;     // Red
      output[i + 1] = enhanced; // Green
      output[i + 2] = enhanced; // Blue
      output[i + 3] = 255;      // Alpha
    }

    return new ImageData(output, width, height);
  }

  private processDetection(result: BarcodeResult): void {
    this.consecutiveDetections++;

    // Confirmar después de detecciones consecutivas
    if (this.consecutiveDetections >= this.requiredConsecutive) {
      this.lastDetection = Date.now();
      console.log(`Código confirmado: ${result.code} (${result.format})`);

      this.onDetected(result);
      this.consecutiveDetections = 0;

      if (!this.continuous) {
        this.stop();
      }
    }
  }

  private isValidBarcode(code: string): boolean {
    if (!code || code.length < 6 || code.length > 18) {
      return false;
    }

    // Verificar que tenga suficientes números
    const numericRatio = (code.match(/\d/g) || []).length / code.length;
    return numericRatio >= 0.7;
  }

  private mapZXingFormat(zxingFormat: any): string {
    const formatMap: { [key: string]: string } = {
      EAN_13: "ean_13",
      EAN_8: "ean_8",
      UPC_A: "upc_a",
      UPC_E: "upc_e",
      CODE_128: "code_128",
      CODE_39: "code_39",
      QR_CODE: "qr_code"
    };

    return formatMap[zxingFormat?.toString()] || "unknown";
  }

  // Método público para obtener estado
  getStatus(): { method: string; scanning: boolean; lastDetection: number } {
    return {
      method: this.useZXing ? "ZXing" : "BarcodeDetector",
      scanning: this.isScanning,
      lastDetection: this.lastDetection
    };
  }

  // Método público para alternar flash si está disponible
  async toggleFlash(enable?: boolean): Promise<boolean> {
    if (!this.currentTrack) return false;

    try {
      const capabilities = this.currentTrack.getCapabilities() as any;
      if (!capabilities?.torch) return false;

      const currentSettings = this.currentTrack.getSettings() as any;
      const newState = enable !== undefined ? enable : !currentSettings.torch;

      await this.currentTrack.applyConstraints({
        advanced: [{ torch: newState } as any]
      });

      console.log(`Flash ${newState ? "activado" : "desactivado"}`);
      return newState;
    } catch (error) {
      console.warn("Error controlando flash:", error);
      return false;
    }
  }
}

// FUNCIONES PRINCIPALES SIMPLIFICADAS
export async function initializeBarcodeScanner(
  videoElement: HTMLVideoElement,
  onBarcodeDetected: (result: BarcodeResult) => void,
  onError?: (error: Error) => void,
  options?: {
    continuous?: boolean;
    formats?: string[];
    scanArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
): Promise<OptimizedBarcodeScanner> {
  const scanner = new OptimizedBarcodeScanner({
    video: videoElement,
    onDetected: onBarcodeDetected,
    onError: onError,
    continuous: options?.continuous ?? true,
    formats: options?.formats,
    scanArea: options?.scanArea,
  });

  try {
    // Configurar cámara con enfoque optimizado
    const stream = await scanner.setupCamera();
    videoElement.srcObject = stream;

    await new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => resolve();
    });

    await videoElement.play();
    console.log("Cámara iniciada con enfoque optimizado");

    await scanner.init();
    scanner.start();

    return scanner;
  } catch (error) {
    console.error("Error iniciando scanner:", error);
    throw error;
  }
}

export function stopBarcodeScanner(scanner?: OptimizedBarcodeScanner): void {
  if (scanner) {
    scanner.stop();
  }
}

// FUNCIONES DE PRODUCTOS (mantener las existentes)
export interface ProductInfo {
  product_name?: string;
  brands?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    'proteins_100g'?: number;
    'carbohydrates_100g'?: number;
    'fat_100g'?: number;
    'fiber_100g'?: number;
    'sugars_100g'?: number;
    'salt_100g'?: number;
  };
  source?: string;
}

export async function getProductByBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    console.log(`Buscando producto: ${barcode}`);

    if (!validateBarcodeFormat(barcode)) {
      throw new Error('Código de barras inválido');
    }

    // OpenFoodFacts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FitnessApp/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error('Producto no encontrado');
    }

    const data = await response.json();

    if (data.status === 1 && data.product) {
      return {
        product_name: data.product.product_name || data.product.generic_name,
        brands: data.product.brands,
        nutriments: data.product.nutriments,
        source: 'OpenFoodFacts'
      };
    }

    // Si no se encuentra, retornar datos básicos
    return {
      product_name: `Producto ${barcode}`,
      brands: 'Marca desconocida',
      nutriments: {
        'energy-kcal_100g': 0,
        'proteins_100g': 0,
        'carbohydrates_100g': 0,
        'fat_100g': 0,
        'fiber_100g': 0,
        'sugars_100g': 0,
        'salt_100g': 0
      },
      source: 'Sistema local'
    };

  } catch (error) {
    console.error('Error buscando producto:', error);
    throw error;
  }
}

export function validateBarcodeFormat(barcode: string): boolean {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }

  const cleanCode = barcode.trim().replace(/[^\d]/g, '');

  if (cleanCode.length < 8 || cleanCode.length > 14) {
    return false;
  }

  const validLengths = [8, 12, 13, 14];
  return validLengths.includes(cleanCode.length);
}

export function formatBarcode(rawCode: string): string {
  if (!rawCode) return '';
  return rawCode.trim().replace(/[^\d]/g, '');
}
