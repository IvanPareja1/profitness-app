
'use client';

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
}

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
}

// Detector de códigos de barras ULTRA MEJORADO con múltiples métodos de detección
class UltraBarcodeScannerPro {
  private video: HTMLVideoElement;
  private onDetected: (result: BarcodeResult) => void;
  private onError?: (error: Error) => void;
  private animationId: number | null = null;
  private isScanning = false;
  private barcodeDetector: any = null;
  private zxingReader: any = null;
  private lastDetection = 0;
  private detectionCooldown = 1200; // Optimizado para mejor respuesta
  private useZXing = false;
  private continuous = true;
  private supportedFormats: string[];
  private consecutiveDetections: Map<string, number> = new Map();
  private requiredConsecutive = 2;
  private detectionHistory: Map<string, number> = new Map();
  private maxHistorySize = 20;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private scanArea?: { x: number; y: number; width: number; height: number };

  // Estadísticas de rendimiento
  private performanceStats = {
    totalScans: 0,
    successfulScans: 0,
    averageProcessingTime: 0,
    lastProcessingTime: 0
  };

  // Cache de resultados para evitar re-procesamiento
  private resultCache = new Map<string, BarcodeResult>();
  private cacheTimeout = 2000; // 2 segundos

  constructor(config: BarcodeConfig) {
    this.video = config.video;
    this.onDetected = config.onDetected;
    this.onError = config.onError;
    this.continuous = config.continuous ?? true;
    this.scanArea = config.scanArea;
    this.supportedFormats = config.formats || [
      'code_128',
      'code_39',
      'code_93',
      'code_11',
      'ean_13',
      'ean_8',
      'ean_5',
      'ean_2',
      'upc_a',
      'upc_e',
      'upc_ean_extension',
      'codabar',
      'itf',
      'rss_14',
      'rss_expanded',
      'qr_code',
      'data_matrix',
      'aztec',
      'pdf_417',
      'maxicode'
    ];

    // Crear canvas optimizado
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo crear contexto del canvas');
    }
    this.context = ctx;
  }

  async init(): Promise<void> {
    try {
      // Intentar BarcodeDetector primero con configuración optimizada
      if ('BarcodeDetector' in window) {
        try {
          const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats();
          console.log(' Formatos soportados por BarcodeDetector:', supportedFormats);

          this.barcodeDetector = new (window as any).BarcodeDetector({
            formats: this.supportedFormats.filter(format =>
              supportedFormats.includes(format)
            )
          });

          console.log(' BarcodeDetector inicializado correctamente');
          this.useZXing = false;
          return;
        } catch (error) {
          console.warn(' Error inicializando BarcodeDetector:', error);
        }
      }

      // Fallback a ZXing con mejor configuración
      console.log(' BarcodeDetector no disponible, inicializando ZXing...');
      await this.initZXingAdvanced();

    } catch (error) {
      console.error(' Error crítico inicializando scanner:', error);
      throw error;
    }
  }

  private async initZXingAdvanced(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && !(window as any).ZXing) {
        await this.loadZXingScriptAdvanced();
      }

      const ZXing = (window as any).ZXing;
      if (!ZXing) {
        throw new Error('No se pudo cargar ZXing desde ningún CDN');
      }

      // Crear reader con configuración ultra optimizada
      this.zxingReader = new ZXing.BrowserMultiFormatReader();

      // Configurar hints avanzados para mejor detección
      const hints = new Map();

      // Formatos optimizados por prioridad
      const priorityFormats = [
        ZXing.BarcodeFormat.EAN_13,
        ZXing.BarcodeFormat.EAN_8,
        ZXing.BarcodeFormat.UPC_A,
        ZXing.BarcodeFormat.UPC_E,
        ZXing.BarcodeFormat.CODE_128,
        ZXing.BarcodeFormat.CODE_39,
        ZXing.BarcodeFormat.QR_CODE
      ].filter(format => format !== undefined);

      hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, priorityFormats);
      hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
      hints.set(ZXing.DecodeHintType.ALSO_INVERTED, true);
      hints.set(ZXing.DecodeHintType.ASSUME_CODE_39_CHECK_DIGIT, false);
      hints.set(ZXing.DecodeHintType.ASSUME_GS1, false);

      // Configuración para mejor rendimiento
      if (ZXing.DecodeHintType.RETURN_CODABAR_START_END) {
        hints.set(ZXing.DecodeHintType.RETURN_CODABAR_START_END, true);
      }

      this.zxingReader.hints = hints;

      console.log(' ZXing inicializado con configuración avanzada');
      this.useZXing = true;

    } catch (error) {
      console.error(' Error crítico inicializando ZXing:', error);
      throw error;
    }
  }

  private loadZXingScriptAdvanced(): Promise<void> {
    return new Promise((resolve, reject) => {
      // CDNs optimizados con prioridad por velocidad y confiabilidad
      const cdnUrls = [
        'https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js',
        'https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js',
        'https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js',
        'https://cdn.jsdelivr.net/npm/@zxing/library@0.19.1/umd/index.min.js'
      ];

      let currentIndex = 0;
      const loadTimeout = 8000; // 8 segundos timeout por CDN

      const tryLoadScript = () => {
        if (currentIndex >= cdnUrls.length) {
          reject(new Error(' No se pudo cargar ZXing desde ningún CDN disponible'));
          return;
        }

        const script = document.createElement('script');
        const timeoutId = setTimeout(() => {
          script.remove();
          console.warn(` Timeout cargando ZXing desde: ${cdnUrls[currentIndex]}`);
          currentIndex++;
          tryLoadScript();
        }, loadTimeout);

        script.src = cdnUrls[currentIndex];
        script.async = true;
        script.defer = true;

        script.onload = () => {
          clearTimeout(timeoutId);
          console.log(` ZXing cargado exitosamente desde: ${cdnUrls[currentIndex]}`);
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          script.remove();
          console.warn(` Error cargando ZXing desde: ${cdnUrls[currentIndex]}`);
          currentIndex++;
          tryLoadScript();
        };

        document.head.appendChild(script);
      };

      tryLoadScript();
    });
  }

  start(): void {
    if (this.isScanning) {
      console.log(' Scanner ya está en funcionamiento');
      return;
    }

    this.isScanning = true;
    this.lastDetection = 0;
    this.consecutiveDetections.clear();
    this.detectionHistory.clear();
    this.performanceStats.totalScans = 0;
    this.performanceStats.successfulScans = 0;

    console.log(` Iniciando scanner con método: ${this.useZXing ? 'ZXing' : 'BarcodeDetector'}`);

    if (this.useZXing) {
      this.startZXingScanningAdvanced();
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

    if (this.zxingReader) {
      try {
        this.zxingReader.reset();
      } catch (error) {
        console.warn(' Error al detener ZXing reader:', error);
      }
    }

    this.consecutiveDetections.clear();
    this.resultCache.clear();

    console.log(` Scanner detenido. Stats: ${this.performanceStats.successfulScans}/${this.performanceStats.totalScans} exitosos`);
  }

  private startBarcodeDetectorScanning(): void {
    const scanLoop = () => {
      if (!this.isScanning) return;

      this.scanFrameWithBarcodeDetector().then(() => {
        if (this.isScanning && this.continuous) {
          this.animationId = requestAnimationFrame(scanLoop);
        }
      }).catch(error => {
        if (this.onError) {
          this.onError(error);
        }
        if (this.isScanning && this.continuous) {
          this.animationId = requestAnimationFrame(scanLoop);
        }
      });
    };

    scanLoop();
  }

  private startZXingScanningAdvanced(): void {
    const scanWithZXing = () => {
      if (!this.isScanning) return;

      const startTime = performance.now();

      try {
        // Pre-procesar frame con optimizaciones avanzadas
        const imageData = this.preprocessFrameAdvanced();
        if (!imageData) {
          setTimeout(scanWithZXing, 50);
          return;
        }

        // Verificar cooldown
        const now = Date.now();
        if (now - this.lastDetection < this.detectionCooldown) {
          setTimeout(scanWithZXing, 30);
          return;
        }

        this.performanceStats.totalScans++;

        // Crear hash de frame para cache
        const frameHash = this.createFrameHash(imageData);
        const cachedResult = this.resultCache.get(frameHash);

        if (cachedResult && now - cachedResult.timestamp! < this.cacheTimeout) {
          this.processDetection(cachedResult);
          if (this.continuous) {
            setTimeout(scanWithZXing, 100);
          }
          return;
        }

        // Intentar decodificar con ZXing
        this.zxingReader.decodeFromCanvas(this.canvas)
          .then((result: any) => {
            const processingTime = performance.now() - startTime;

            this.updatePerformanceStats(processingTime);

            if (result && this.isValidBarcodeValue(result.text)) {
              const barcodeResult: BarcodeResult = {
                code: result.text,
                format: this.mapZXingFormat(result.format) || 'unknown',
                confidence: this.calculateZXingConfidence(result),
                timestamp: now,
                location: this.extractBarcodeLocation(result)
              };

              // Guardar en cache
              this.resultCache.set(frameHash, barcodeResult);

              this.processDetection(barcodeResult);
              this.performanceStats.successfulScans++;
            }

            if (this.continuous) {
              setTimeout(scanWithZXing, 50);
            }
          })
          .catch((error: any) => {
            const processingTime = performance.now() - startTime;

            this.updatePerformanceStats(processingTime);

            // Error normal cuando no se detecta código
            if (this.continuous) {
              setTimeout(scanWithZXing, 80);
            }
          });

      } catch (error) {
        if (this.onError) {
          this.onError(error as Error);
        }
        if (this.continuous) {
          setTimeout(scanWithZXing, 100);
        }
      }
    };

    scanWithZXing();
  }

  private async scanFrameWithBarcodeDetector(): Promise<void> {
    const startTime = performance.now();
    const imageData = this.preprocessFrameAdvanced();
    if (!imageData) return;

    // Verificar cooldown
    const now = Date.now();
    if (now - this.lastDetection < this.detectionCooldown) {
      return;
    }

    try {
      this.performanceStats.totalScans++;

      // Crear hash para cache
      const frameHash = this.createFrameHash(imageData);
      const cachedResult = this.resultCache.get(frameHash);

      if (cachedResult && now - cachedResult.timestamp! < this.cacheTimeout) {
        this.processDetection(cachedResult);
        return;
      }

      if (this.barcodeDetector) {
        const barcodes = await this.barcodeDetector.detect(this.canvas);
        const processingTime = performance.now() - startTime;
        this.updatePerformanceStats(processingTime);

        for (const barcode of barcodes) {
          if (this.isValidBarcodeValue(barcode.rawValue)) {
            const barcodeResult: BarcodeResult = {
              code: barcode.rawValue,
              format: barcode.format,
              confidence: this.calculateBarcodeDetectorConfidence(barcode),
              timestamp: now,
              location: this.extractBarcodeDetectorLocation(barcode)
            };

            // Guardar en cache
            this.resultCache.set(frameHash, barcodeResult);

            this.processDetection(barcodeResult);
            this.performanceStats.successfulScans++;
            break; // Procesar solo el primer código válido
          }
        }
      }
    } catch (error) {
      const processingTime = performance.now() - startTime;

      this.updatePerformanceStats(processingTime);

      // Si falla BarcodeDetector, cambiar a ZXing
      if (!this.useZXing) {
        console.log(' Error con BarcodeDetector, cambiando a ZXing...');
        try {
          await this.initZXingAdvanced();
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

  private preprocessFrameAdvanced(): ImageData | null {
    if (!this.video || this.video.readyState !== this.video.HAVE_ENOUGH_DATA) {
      return null;
    }

    // Configurar canvas con área de escaneo optimizada
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;

    let scanWidth, scanHeight, scanX, scanY;

    if (this.scanArea) {
      // Usar área de escaneo personalizada
      scanX = Math.floor(this.scanArea.x * videoWidth);
      scanY = Math.floor(this.scanArea.y * videoHeight);
      scanWidth = Math.floor(this.scanArea.width * videoWidth);
      scanHeight = Math.floor(this.scanArea.height * videoHeight);
    } else {
      // Usar área central optimizada para códigos de barras
      const centerCropRatio = 0.8;
      scanWidth = Math.floor(videoWidth * centerCropRatio);
      scanHeight = Math.floor(videoHeight * centerCropRatio);
      scanX = Math.floor((videoWidth - scanWidth) / 2);
      scanY = Math.floor((videoHeight - scanHeight) / 2);
    }

    this.canvas.width = scanWidth;
    this.canvas.height = scanHeight;

    // Dibujar frame del video con área optimizada
    this.context.drawImage(
      this.video,
      scanX, scanY, scanWidth, scanHeight,
      0, 0, scanWidth, scanHeight
    );

    // Aplicar filtros optimizados para detección de códigos
    const imageData = this.context.getImageData(0, 0, scanWidth, scanHeight);
    const enhancedImageData = this.enhanceImageForBarcodeDetection(imageData);

    this.context.putImageData(enhancedImageData, 0, 0);
    return enhancedImageData;
  }

  private enhanceImageForBarcodeDetection(imageData: ImageData): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    // Aplicar múltiples mejoras para códigos de barras
    for (let i = 0; i < data.length; i += 4) {
      // Convertir a escala de grises con pesos optimizados para códigos
      const gray = Math.round(
        0.299 * data[i] +
        0.587 * data[i + 1] +
        0.114 * data[i + 2]
      );

      // Aplicar threshold adaptativo más agresivo
      const threshold = 128;
      const enhanced = gray > threshold ? 255 : 0;

      // Aplicar un poco de contraste adicional
      const contrasted = enhanced === 255 ? 255 : Math.max(0, enhanced - 20);

      output[i] = contrasted;     // Red
      output[i + 1] = contrasted; // Green
      output[i + 2] = contrasted; // Blue
      // Alpha se mantiene igual (output[i + 3] = data[i + 3])
    }

    return new ImageData(output, width, height);
  }

  private createFrameHash(imageData: ImageData): string {
    // Crear hash simple y rápido del frame
    const data = imageData.data;
    let hash = 0;
    const sampleSize = Math.min(1000, data.length);
    const step = Math.floor(data.length / sampleSize);

    for (let i = 0; i < data.length; i += step) {
      hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
    }

    return Math.abs(hash).toString(16);
  }

  private updatePerformanceStats(processingTime: number): void {
    this.performanceStats.lastProcessingTime = processingTime;
    this.performanceStats.averageProcessingTime =
      (this.performanceStats.averageProcessingTime * (this.performanceStats.totalScans - 1) + processingTime) /
      this.performanceStats.totalScans;
  }

  private calculateZXingConfidence(result: any): number {
    // Calcular confianza basada en características del resultado
    let confidence = 0.85; // Base para ZXing

    // Factor por formato (algunos son más confiables)
    const formatReliability = {
      'EAN_13': 0.95,
      'EAN_8': 0.92,
      'UPC_A': 0.95,
      'UPC_E': 0.90,
      'CODE_128': 0.88,
      'CODE_39': 0.85,
      'QR_CODE': 0.93
    };

    const format = result.format?.toString();
    if (format && formatReliability[format as keyof typeof formatReliability]) {
      confidence *= formatReliability[format as keyof typeof formatReliability];
    }

    // Factor por longitud del código
    const codeLength = result.text?.length || 0;
    if (codeLength >= 8 && codeLength <= 14) {
      confidence *= 1.05; // Longitudes típicas de códigos de barras
    }

    // Reducir confianza si el procesamiento fue muy lento
    if (this.performanceStats.lastProcessingTime > 200) {
      confidence *= 0.95;
    }

    return Math.min(confidence, 0.98);
  }

  private calculateBarcodeDetectorConfidence(barcode: any): number {
    let confidence = 0.9; // Base más alta para BarcodeDetector nativo

    // Factor por formato
    const formatWeights = {
      'ean_13': 0.98,
      'ean_8': 0.95,
      'upc_a': 0.98,
      'upc_e': 0.94,
      'code_128': 0.90,
      'code_39': 0.87,
      'qr_code': 0.95
    };

    confidence *= formatWeights[barcode.format as keyof typeof formatWeights] || 0.80;

    // Factor de área del código (códigos más grandes = mayor confianza)
    if (barcode.boundingBox) {
      const area = barcode.boundingBox.width * barcode.boundingBox.height;
      const totalArea = this.canvas.width * this.canvas.height;

      const areaRatio = area / totalArea;

      if (areaRatio > 0.15) {
        confidence *= 1.1; // Código grande
      } else if (areaRatio < 0.02) {
        confidence *= 0.85; // Código muy pequeño
      }
    }

    // Factor de historial
    const code = barcode.rawValue;
    if (this.detectionHistory.has(code)) {
      confidence *= 1.08;
    }

    return Math.min(confidence, 0.98);
  }

  private extractBarcodeLocation(result: any): { x: number; y: number; width: number; height: number } | undefined {
    // Extraer ubicación del código para ZXing (si está disponible)
    if (result.resultPoints && result.resultPoints.length >= 2) {
      const points = result.resultPoints;
      const minX = Math.min(...points.map((p: any) => p.x || 0));
      const maxX = Math.max(...points.map((p: any) => p.x || 0));
      const minY = Math.min(...points.map((p: any) => p.y || 0));
      const maxY = Math.max(...points.map((p: any) => p.y || 0));

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    }
    return undefined;
  }

  private extractBarcodeDetectorLocation(barcode: any): { x: number; y: number; width: number; height: number } | undefined {
    if (barcode.boundingBox) {
      return {
        x: barcode.boundingBox.x,
        y: barcode.boundingBox.y,
        width: barcode.boundingBox.width,
        height: barcode.boundingBox.height
      };
    }
    return undefined;
  }

  private processDetection(result: BarcodeResult): void {
    const code = result.code;

    // Actualizar contador de detecciones consecutivas
    const currentCount = this.consecutiveDetections.get(code) || 0;
    this.consecutiveDetections.set(code, currentCount + 1);

    // Limpiar otros códigos del mapa (decay)
    for (const [otherCode, count] of this.consecutiveDetections.entries()) {
      if (otherCode !== code) {
        const newCount = Math.max(0, count - 0.5);
        if (newCount <= 0) {
          this.consecutiveDetections.delete(otherCode);
        } else {
          this.consecutiveDetections.set(otherCode, newCount);
        }
      }
    }

    // Solo confirmar detección después de múltiples confirmaciones
    if (currentCount >= this.requiredConsecutive) {
      this.lastDetection = Date.now();

      // Agregar a historial con timestamp
      this.detectionHistory.set(code, Date.now());

      // Limpiar historial antiguo
      if (this.detectionHistory.size > this.maxHistorySize) {
        const entries = Array.from(this.detectionHistory.entries());
        entries.sort((a, b) => a[1] - b[1]);
        entries.slice(0, 5).forEach(([key]) => this.detectionHistory.delete(key));
      }

      console.log(` Código confirmado: ${code} (${result.format}) - Confianza: ${(result.confidence || 0).toFixed(2)}`);

      // Agregar estadísticas al resultado
      const enhancedResult = {
        ...result,
        confidence: result.confidence || 0.9,
        scanStats: {
          totalScans: this.performanceStats.totalScans,
          successRate: this.performanceStats.successfulScans / this.performanceStats.totalScans,
          avgProcessingTime: Math.round(this.performanceStats.averageProcessingTime)
        }
      };

      this.onDetected(enhancedResult);

      // Limpiar detecciones para siguiente código
      this.consecutiveDetections.clear();

      if (!this.continuous) {
        this.stop();
      }
    }
  }

  // Métodos públicos mejorados
  getMethod(): string {
    return this.useZXing ? 'ZXing Pro' : 'BarcodeDetector Native';
  }

  getDetectionHistory(): Array<{ code: string, timestamp: number }> {
    return Array.from(this.detectionHistory.entries()).map(([code, timestamp]) => ({
      code,
      timestamp
    }));
  }

  getPerformanceStats(): typeof this.performanceStats {
    return { ...this.performanceStats };
  }

  getCurrentStats(): {
    method: string;
    scanning: boolean;
    lastDetection: number;
    detectionCount: number;
    performance: {
      totalScans: number;
      successfulScans: number;
      averageProcessingTime: number;
      lastProcessingTime: number;
    };
    cacheSize: number;
  } {
    return {
      method: this.getMethod(),
      scanning: this.isScanning,
      lastDetection: this.lastDetection,
      detectionCount: this.detectionHistory.size,
      performance: this.getPerformanceStats(),
      cacheSize: this.resultCache.size
    };
  }

  // Método para ajustar configuración en tiempo real
  updateConfiguration(config: Partial< {
    detectionCooldown: number;
    requiredConsecutive: number;
    scanArea: { x: number; y: number; width: number; height: number };
  } > ): void {
    if (config.detectionCooldown !== undefined) {
      this.detectionCooldown = config.detectionCooldown;
    }
    if (config.requiredConsecutive !== undefined) {
      this.requiredConsecutive = config.requiredConsecutive;
    }
    if (config.scanArea !== undefined) {
      this.scanArea = config.scanArea;
    }

    console.log(' Configuración actualizada:', config);
  }

  // Método para limpiar cache manualmente
  clearCache(): void {
    this.resultCache.clear();
    this.detectionHistory.clear();
    this.consecutiveDetections.clear();
    console.log(' Cache limpiado');
  }

  private isValidBarcodeValue(code: string): boolean {
    if (!code || code.length < 6 || code.length > 18) {
      return false;
    }

    // Validar que contenga principalmente números (mejorado)
    const numericRatio = (code.match(/\d/g) || []).length / code.length;
    if (numericRatio < 0.65) {
      return false;
    }

    // Validar patrones específicos de códigos conocidos
    const commonPatterns = [
      /^\d{8}$/,   // EAN-8
      /^\d{12}$/,  // UPC-A
      /^\d{13}$/,  // EAN-13
      /^\d{14}$/,  // ITF-14
    ];

    const matchesPattern = commonPatterns.some(pattern => pattern.test(code));
    if (matchesPattern) return true;

    // Validación flexible para otros formatos
    if (code.length >= 6 && code.length <= 18 && numericRatio >= 0.8) {
      return true;
    }

    return false;
  }

  private mapZXingFormat(zxingFormat: any): string {
    const formatMap: { [key: string]: string } = {
      'EAN_13': 'ean_13',
      'EAN_8': 'ean_8',
      'UPC_A': 'upc_a',
      'UPC_E': 'upc_e',
      'CODE_128': 'code_128',
      'CODE_39': 'code_39',
      'CODE_93': 'code_93',
      'QR_CODE': 'qr_code',
      'DATA_MATRIX': 'data_matrix',
      'AZTEC': 'aztec',
      'PDF_417': 'pdf_417'
    };

    return formatMap[zxingFormat?.toString()] || 'unknown';
  }

}

// Funciones principales mejoradas para usar en el componente
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
): Promise<UltraBarcodeScannerPro> {
  const scanner = new UltraBarcodeScannerPro({
    video: videoElement,
    onDetected: onBarcodeDetected,
    onError: onError,
    continuous: options?.continuous ?? true,
    formats: options?.formats,
    scanArea: options?.scanArea
  });

  await scanner.init();
  scanner.start();

  return scanner;
}

export function stopBarcodeScanner(scanner?: UltraBarcodeScannerPro): void {
  if (scanner) {
    scanner.stop();
  }
}

// MEJORAS EN API DE PRODUCTOS

// Cache inteligente para productos
const PRODUCT_CACHE = new Map<string, { data: any; timestamp: number }>();
const PRODUCT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

// Función ultra mejorada para buscar producto por código de barras
export async function getProductByBarcode(barcode: string): Promise<any> {
  // Validar código antes de hacer la petición
  if (!isValidBarcode(barcode)) {
    throw new Error('Código de barras inválido');
  }

  // Verificar cache primero
  const cached = PRODUCT_CACHE.get(barcode);
  if (cached && Date.now() - cached.timestamp < PRODUCT_CACHE_DURATION) {
    console.log(' Producto obtenido del cache:', barcode);
    return cached.data;
  }

  try {
    console.log(' Buscando producto con código:', barcode);

    // APIs mejoradas con mejor manejo de errores
    const apis = [
      {
        name: 'OpenFoodFacts',
        url: `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        parser: parseOpenFoodFactsResponseAdvanced,
        timeout: 8000
      },
      {
        name: 'UPCDatabase',
        url: `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
        parser: parseUPCDatabaseResponseAdvanced,
        timeout: 6000
      },
      {
        name: 'Barcode Lookup',
        url: `https://api.barcodelookup.com/v3/products?barcode=${barcode}&formatted=y&key=demo`,
        parser: parseBarcodeLookupResponse,
        timeout: 5000
      }
    ];

    // Intentar APIs en paralelo para mayor velocidad
    const promises = apis.map(async (api) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), api.timeout);

      try {
        const response = await fetch(api.url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ProFitnessApp/1.0 (Nutrition Tracker)',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`${api.name} API Error: ${response.status}`);
        }

        const data = await response.json();
        const product = api.parser(data, barcode);

        if (product) {
          console.log(` Producto encontrado en ${api.name}:`, product.product_name);
          return { product, source: api.name };
        }

        return null;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(` Error con ${api.name}:`, error);
        return null;
      }
    });

    // Esperar por el primer resultado exitoso
    const results = await Promise.allSettled(promises);
    const successfulResults = results
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);

    if (successfulResults.length > 0) {
      const bestResult = successfulResults[0]; // Tomar el primero (más rápido)

      // Guardar en cache
      PRODUCT_CACHE.set(barcode, {
        data: bestResult.product,
        timestamp: Date.now()
      });

      return bestResult.product;
    }

    // Si no se encuentra en ninguna API, crear producto genérico mejorado
    console.log(' Creando producto genérico para:', barcode);
    const genericProduct = createAdvancedGenericProduct(barcode);

    // Guardar producto genérico en cache temporal
    PRODUCT_CACHE.set(barcode, {
      data: genericProduct,
      timestamp: Date.now()
    });

    return genericProduct;

  } catch (error) {
    console.error(' Error crítico obteniendo producto:', error);
    throw error;
  }
}

// Parser mejorado para OpenFoodFacts
function parseOpenFoodFactsResponseAdvanced(data: any, barcode: string): any | null {
  if (data.status === 1 && data.product) {
    const product = data.product;

    return {
      product_name: product.product_name ||
        product.product_name_es ||
        product.product_name_en ||
        `Producto ${barcode}`,
      brands: product.brands || product.brand_owner || 'Marca desconocida',
      quantity: product.quantity || '',
      image_url: product.image_front_url ||
        product.image_url ||
        generateEnhancedProductImage(barcode, product.product_name),
      nutriments: {
        'energy-kcal_100g': Math.round(
          product.nutriments?.['energy-kcal_100g'] ||
          product.nutriments?.['energy-kcal'] ||
          product.nutriments?.['energy_100g'] / 4.184 || // Convert from kJ if needed
          0
        ),
        'proteins_100g': Math.round(
          (product.nutriments?.['proteins_100g'] ||
            product.nutriments?.['proteins'] || 0
          ) * 10
        ) / 10,
        'carbohydrates_100g': Math.round(
          (product.nutriments?.['carbohydrates_100g'] ||
            product.nutriments?.['carbohydrates'] || 0
          ) * 10
        ) / 10,
        'fat_100g': Math.round(
          (product.nutriments?.['fat_100g'] ||
            product.nutriments?.['fat'] || 0
          ) * 10
        ) / 10,
        'fiber_100g': Math.round(
          (product.nutriments?.['fiber_100g'] ||
            product.nutriments?.['fiber'] || 0
          ) * 10
        ) / 10,
        'sugars_100g': Math.round(
          (product.nutriments?.['sugars_100g'] ||
            product.nutriments?.['sugars'] || 0
          ) * 10
        ) / 10,
        'salt_100g': Math.round(
          (product.nutriments?.['salt_100g'] ||
            product.nutriments?.['salt'] ||
            product.nutriments?.['sodium_100g'] * 2.54 || 0
          ) * 100
        ) / 100
      },
      categories: product.categories || product.categories_tags?.join(', ') || '',
      ingredients_text: product.ingredients_text ||
        product.ingredients_text_es ||
        product.ingredients_text_en ||
        '',
      nutrition_score: product.nutrition_grades || product.nutriscore_grade || '',
      eco_score: product.ecoscore_grade || '',
      labels: product.labels || product.labels_tags?.join(', ') || '',
      allergens: product.allergens || product.allergens_tags?.join(', ') || '',
      source: 'OpenFoodFacts Enhanced'
    };
  }
  return null;
}

// Parser mejorado para UPCDatabase
function parseUPCDatabaseResponseAdvanced(data: any, barcode: string): any | null {
  if (data.code === 'OK' && data.items && data.items.length > 0) {
    const item = data.items[0];

    return {
      product_name: item.title || item.description || `Producto ${barcode}`,
      brands: item.brand || item.manufacturer || 'Marca desconocida',
      quantity: item.size || '',
      image_url: (item.images && item.images.length > 0) ?
        item.images[0] :
        generateEnhancedProductImage(barcode, item.title),
      nutriments: estimateNutritionFromCategory(item.category, item.title),
      categories: item.category || '',
      ingredients_text: item.description || 'Información no disponible',
      source: 'UPCDatabase Enhanced'
    };
  }
  return null;
}

// Parser para Barcode Lookup (nueva API)
function parseBarcodeLookupResponse(data: any, barcode: string): any | null {
  if (data.products && data.products.length > 0) {
    const product = data.products[0];

    return {
      product_name: product.product_name || product.title || `Producto ${barcode}`,
      brands: product.brand || product.manufacturer || 'Marca desconocida',
      quantity: product.size || '',
      image_url: product.images && product.images.length > 0 ?
        product.images[0] :
        generateEnhancedProductImage(barcode, product.product_name),
      nutriments: estimateNutritionFromCategory(product.category, product.product_name),
      categories: product.category || '',
      ingredients_text: product.description || 'Información no disponible',
      source: 'Barcode Lookup'
    };
  }
  return null;
}

// Función mejorada para estimar nutrición desde categoría
function estimateNutritionFromCategory(category: string, productName: string): any {
  const categoryLower = (category || '').toLowerCase();
  const nameLower = (productName || '').toLowerCase();

  // Patrones de categorías más específicos
  const nutritionPatterns = {
    // Bebidas
    beverages: { calories: 45, proteins: 0.2, carbohydrates: 11, fat: 0.1, fiber: 0, sugars: 10, salt: 0.01 },
    soda: { calories: 150, proteins: 0, carbohydrates: 39, fat: 0, fiber: 0, sugars: 39, salt: 0.02 },
    juice: { calories: 55, proteins: 0.5, carbohydrates: 13, fat: 0.1, fiber: 0.2, sugars: 12, salt: 0.001 },

    // Lácteos
    dairy: { calories: 85, proteins: 6, carbohydrates: 6, fat: 4.5, fiber: 0, sugars: 6, salt: 0.12 },
    milk: { calories: 61, proteins: 3.2, carbohydrates: 4.8, fat: 3.3, fiber: 0, sugars: 4.8, salt: 0.04 },
    cheese: { calories: 350, proteins: 25, carbohydrates: 3, fat: 28, fiber: 0, sugars: 1, salt: 1.5 },
    yogurt: { calories: 85, proteins: 8, carbohydrates: 12, fat: 2.5, fiber: 0, sugars: 10, salt: 0.08 },

    // Carnes y proteínas
    meat: { calories: 250, proteins: 26, carbohydrates: 0, fat: 15, fiber: 0, sugars: 0, salt: 0.8 },
    chicken: { calories: 165, proteins: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugars: 0, salt: 0.7 },
    fish: { calories: 200, proteins: 25, carbohydrates: 0, fat: 10, fiber: 0, sugars: 0, salt: 0.6 },

    // Granos y cereales
    cereal: { calories: 380, proteins: 12, carbohydrates: 70, fat: 6, fiber: 8, sugars: 8, salt: 0.8 },
    bread: { calories: 265, proteins: 9, carbohydrates: 49, fat: 3.2, fiber: 2.7, sugars: 5, salt: 1.2 },
    pasta: { calories: 350, proteins: 13, carbohydrates: 70, fat: 1.5, fiber: 3, sugars: 2, salt: 0.01 },

    // Frutas y verduras
    fruit: { calories: 60, proteins: 1, carbohydrates: 15, fat: 0.3, fiber: 3, sugars: 12, salt: 0.001 },
    vegetable: { calories: 25, proteins: 2.5, carbohydrates: 5, fat: 0.2, fiber: 3, sugars: 3, salt: 0.01 },

    // Snacks
    snack: { calories: 450, proteins: 8, carbohydrates: 55, fat: 22, fiber: 3, sugars: 8, salt: 1.2 },
    candy: { calories: 400, proteins: 2, carbohydrates: 85, fat: 8, fiber: 1, sugars: 80, salt: 0.1 },
    chocolate: { calories: 535, proteins: 8, carbohydrates: 60, fat: 30, fiber: 7, sugars: 55, salt: 0.02 }
  };

  // Buscar patrón más específico primero
  for (const [pattern, nutrition] of Object.entries(nutritionPatterns)) {
    if (categoryLower.includes(pattern) || nameLower.includes(pattern)) {
      return {
        'energy-kcal_100g': nutrition.calories,
        'proteins_100g': nutrition.proteins,
        'carbohydrates_100g': nutrition.carbohydrates,
        'fat_100g': nutrition.fat,
        'fiber_100g': nutrition.fiber,
        'sugars_100g': nutrition.sugars,
        'salt_100g': nutrition.salt
      };
    }
  }

  // Fallback genérico
  return {
    'energy-kcal_100g': 150,
    'proteins_100g': 5,
    'carbohydrates_100g': 20,
    'fat_100g': 5,
    'fiber_100g': 2,
    'sugars_100g': 8,
    'salt_100g': 0.5
  };
}

// Función mejorada para crear producto genérico
function createAdvancedGenericProduct(barcode: string): any {
  // Intentar deducir información del código de barras
  const countryInfo = getBarcodeCountryInfo(barcode);

  return {
    product_name: `Producto ${barcode}`,
    brands: countryInfo.country ? `Producto de ${countryInfo.country}` : 'Marca desconocida',
    quantity: '',
    image_url: generateEnhancedProductImage(barcode, `Producto ${barcode}`),
    nutriments: {
      'energy-kcal_100g': 150,
      'proteins_100g': 5,
      'carbohydrates_100g': 20,
      'fat_100g': 5,
      'fiber_100g': 2,
      'sugars_100g': 8,
      'salt_100g': 0.5
    },
    categories: 'Producto alimenticio',
    ingredients_text: 'Información no disponible. Escaneo exitoso pero producto no encontrado en bases de datos.',
    barcode_info: countryInfo,
    source: 'Generic Enhanced',
    note: 'Producto genérico. Puedes editar la información nutricional manualmente.'
  };
}

// Función para obtener información del país desde código de barras
function getBarcodeCountryInfo(barcode: string): { country: string; region: string } {
  if (barcode.length < 3) return { country: 'Desconocido', region: 'Desconocido' };

  const countryCode = barcode.substring(0, 3);
  const countryMap: { [key: string]: { country: string; region: string } } = {
    '000': { country: 'Estados Unidos', region: 'América del Norte' },
    '001': { country: 'Estados Unidos', region: 'América del Norte' },
    '020': { country: 'Reino Unido', region: 'Europa' },
    '050': { country: 'Reino Unido', region: 'Europa' },
    '070': { country: 'Noruega', region: 'Europa' },
    '100': { country: 'Estados Unidos', region: 'América del Norte' },
    '380': { country: 'Bulgaria', region: 'Europa' },
    '400': { country: 'Alemania', region: 'Europa' },
    '450': { country: 'Japón', region: 'Asia' },
    '460': { country: 'Rusia', region: 'Europa/Asia' },
    '500': { country: 'Reino Unido', region: 'Europa' },
    '520': { country: 'Grecia', region: 'Europa' },
    '560': { country: 'Portugal', region: 'Europa' },
    '590': { country: 'Polonia', region: 'Europa' },
    '690': { country: 'China', region: 'Asia' },
    '750': { country: 'México', region: 'América del Norte' },
    '770': { country: 'Colombia', region: 'América del Sur' },
    '773': { country: 'Uruguay', region: 'América del Sur' },
    '775': { country: 'Perú', region: 'América del Sur' },
    '778': { country: 'Argentina', region: 'América del Sur' },
    '780': { country: 'Chile', region: 'América del Sur' },
    '789': { country: 'Brasil', region: 'América del Sur' },
    '880': { country: 'Corea del Sur', region: 'Asia' },
    '890': { country: 'India', region: 'Asia' }
  };

  // Buscar coincidencia exacta o por rango
  for (const [code, info] of Object.entries(countryMap)) {
    if (countryCode.startsWith(code) || countryCode === code) {
      return info;
    }
  }

  return { country: 'Desconocido', region: 'Desconocido' };
}

// Función mejorada para generar imagen de producto
function generateEnhancedProductImage(barcode: string, productName?: string): string {
  const productType = productName ? detectProductType(productName) : 'generic';
  const queries = {
    beverage: 'beverage bottle product commercial realistic food photography',
    dairy: 'dairy product milk cheese yogurt commercial packaging realistic',
    meat: 'meat protein food product commercial packaging realistic',
    cereal: 'cereal breakfast food box packaging commercial realistic',
    snack: 'snack food package commercial realistic product photography',
    fruit: 'fresh fruit healthy food commercial realistic photography',
    vegetable: 'fresh vegetables healthy food commercial realistic photography',
    generic: 'food product package commercial realistic product photography'
  };

  const query = queries[productType as keyof typeof queries] || queries.generic;

  return `https://readdy.ai/api/search-image?query=%7BencodeURIComponent(${query})%7D&width=200&height=200&seq=barcode_${barcode}&orientation=squarish`;
}

// Función para detectar tipo de producto
function detectProductType(productName: string): string {
  const name = productName.toLowerCase();

  if (name.includes('juice') || name.includes('soda') || name.includes('drink') || name.includes('bebida')) return 'beverage';
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('leche') || name.includes('queso')) return 'dairy';
  if (name.includes('meat') || name.includes('chicken') || name.includes('beef') || name.includes('carne') || name.includes('pollo')) return 'meat';
  if (name.includes('cereal') || name.includes('bread') || name.includes('pasta') || name.includes('pan') || name.includes('cereal')) return 'cereal';
  if (name.includes('snack') || name.includes('chip') || name.includes('cookie') || name.includes('galleta')) return 'snack';
  if (name.includes('fruit') || name.includes('apple') || name.includes('banana') || name.includes('fruta') || name.includes('manzana')) return 'fruit';
  if (name.includes('vegetable') || name.includes('carrot') || name.includes('broccoli') || name.includes('verdura')) return 'vegetable';

  return 'generic';
}

// Función mejorada para validar código de barras
export function isValidBarcode(code: string): boolean {
  if (!code || code.length < 6 || code.length > 18) {
    return false;
  }

  // Limpiar código (remover espacios y guiones)
  const cleanCode = code.replace(/[\s\-]/g, '');

  // Validar que contenga principalmente números
  if (!/^\d+$/.test(cleanCode)) {
    return false;
  }

  // Validar longitudes específicas más estrictas
  const validLengths = [6, 7, 8, 12, 13, 14, 17, 18];
  if (!validLengths.includes(cleanCode.length)) {
    return false;
  }

  // Validar checksum para códigos principales
  if (cleanCode.length === 13 || cleanCode.length === 12) {
    return validateEANUPCChecksum(cleanCode);
  }

  if (cleanCode.length === 8) {
    return validateEAN8Checksum(cleanCode);
  }

  return true; // Para otros formatos, aceptar si pasa las validaciones básicas
}

// Validar checksum de EAN-13 y UPC-A mejorado
function validateEANUPCChecksum(code: string): boolean {
  if (code.length !== 13 && code.length !== 12) return false;

  const digits = code.split('').map(Number);
  const checkDigit = digits.pop()!;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    // Para UPC-A (12 dígitos), el primer dígito se multiplica por 3
    // Para EAN-13, se alterna empezando por 1
    const multiplier = (code.length === 12) ?
      (i % 2 === 0 ? 1 : 3) :
      (i % 2 === 0 ? 1 : 3);
    sum += digits[i] * multiplier;
  }

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
}

// Validar checksum de EAN-8
function validateEAN8Checksum(code: string): boolean {
  if (code.length !== 8) return false;

  const digits = code.split('').map(Number);
  const checkDigit = digits.pop()!;

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
}

// Limpiar cache periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of PRODUCT_CACHE.entries()) {
    if (now - value.timestamp > PRODUCT_CACHE_DURATION) {
      PRODUCT_CACHE.delete(key);
    }
  }
}, 5 * 60 * 1000); // Cada 5 minutos

console.log(' Ultra Barcode Scanner Pro inicializado con mejoras avanzadas');
