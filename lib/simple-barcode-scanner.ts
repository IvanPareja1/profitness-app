
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

// Detector de códigos de barras ULTRA MEJORADO con enfoque automático avanzado
class UltraBarcodeScannerPro {
  private video: HTMLVideoElement;
  private onDetected: (result: BarcodeResult) => void;
  private onError?: (error: Error) => void;
  private animationId: number | null = null;
  private isScanning = false;
  private barcodeDetector: any = null;
  private zxingReader: any = null;
  private lastDetection = 0;
  private detectionCooldown = 1200;
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

  // NUEVAS PROPIEDADES PARA ENFOQUE AUTOMÁTICO AVANZADO
  private mediaStream: MediaStream | null = null;
  private currentTrack: MediaStreamTrack | null = null;
  private autoFocusInterval: NodeJS.Timeout | null = null;
  private focusCapabilities: MediaTrackCapabilities | null = null;
  private lastSharpnessScore = 0;
  private sharpnessHistory: number[] = [];
  private focusOptimizationActive = false;
  private manualFocusDistance = 0.3;

  // Estadísticas de rendimiento
  private performanceStats = {
    totalScans: 0,
    successfulScans: 0,
    averageProcessingTime: 0,
    lastProcessingTime: 0,
  };

  // Cache de resultados para evitar re-procesamiento
  private resultCache = new Map<string, BarcodeResult>();
  private cacheTimeout = 2000;

  constructor(config: BarcodeConfig) {
    this.video = config.video;
    this.onDetected = config.onDetected;
    this.onError = config.onError;
    this.continuous = config.continuous ?? true;
    this.scanArea = config.scanArea;
    this.supportedFormats = config.formats || [
      "code_128",
      "code_39",
      "code_93",
      "code_11",
      "ean_13",
      "ean_8",
      "ean_5",
      "ean_2",
      "upc_a",
      "upc_e",
      "upc_ean_extension",
      "codabar",
      "itf",
      "rss_14",
      "rss_expanded",
      "qr_code",
      "data_matrix",
      "aztec",
      "pdf_417",
      "maxicode",
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
      // Intentar BarcodeDetector primero con configuración optimizada
      if (typeof window !== 'undefined' && "BarcodeDetector" in window) {
        try {
          const supportedFormats = await (window as any).BarcodeDetector.getSupportedFormats();
          console.log("Formatos soportados por BarcodeDetector:", supportedFormats);

          this.barcodeDetector = new (window as any).BarcodeDetector({
            formats: this.supportedFormats.filter((format) =>
              supportedFormats.includes(format)
            ),
          });

          console.log("BarcodeDetector inicializado correctamente");
          this.useZXing = false;
          return;
        } catch (error) {
          console.warn("Error inicializando BarcodeDetector:", error);
        }
      }

      // Fallback a ZXing con mejor configuración
      console.log("BarcodeDetector no disponible, inicializando ZXing...");
      await this.initZXingAdvanced();
    } catch (error) {
      console.error("Error crítico inicializando scanner:", error);
      throw error;
    }
  }

  // MÉTODO MEJORADO PARA INICIALIZAR CÁMARA CON ENFOQUE AUTOMÁTICO
  async initializeCameraWithAutoFocus(): Promise<MediaStream> {
    try {
      console.log("Inicializando cámara con enfoque automático avanzado...");

      // CONFIGURACIÓN ULTRA AVANZADA DE CÁMARA CON ENFOQUE AUTOMÁTICO
      const advancedConstraints: MediaStreamConstraints = {
        video: {
          facingMode: "environment",
          width: {
            ideal: 1920,
            min: 1280,
          },
          height: {
            ideal: 1080,
            min: 720,
          },
          frameRate: {
            ideal: 30,
            min: 20,
          },
          aspectRatio: { ideal: 16 / 9 },
          brightness: { ideal: 0.5 },
          contrast: { ideal: 1.2 },
          saturation: { ideal: 0.8 },
          sharpness: { ideal: 1.0 },
        } as MediaTrackConstraints,
      };

      // INTENTAR OBTENER STREAM CON CONFIGURACIÓN AVANZADA
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia(advancedConstraints);
        console.log("Cámara inicializada con configuración avanzada completa");
      } catch (advancedError) {
        console.warn("Configuración avanzada no soportada, usando configuración optimizada...");
        // Fallback a configuración más compatible pero optimizada
        const fallbackConstraints: MediaStreamConstraints = {
          video: {
            facingMode: "environment",
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, min: 15 },
          } as MediaTrackConstraints,
        };

        stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        console.log("Cámara inicializada con configuración compatible");
      }

      // CONFIGURAR TRACK DE VIDEO Y CAPACIDADES DE ENFOQUE
      this.mediaStream = stream;
      this.currentTrack = stream.getVideoTracks()[0];

      if (this.currentTrack) {
        // OBTENER CAPACIDADES DE LA CÁMARA
        const capabilities = this.currentTrack.getCapabilities();
        this.focusCapabilities = capabilities;

        console.log("Capacidades de cámara:", {
          focusMode: (capabilities as any).focusMode,
          focusDistance: (capabilities as any).focusDistance,
          exposureMode: (capabilities as any).exposureMode,
          whiteBalanceMode: (capabilities as any).whiteBalanceMode,
          torch: (capabilities as any).torch,
        });

        // APLICAR CONFIGURACIONES AVANZADAS DE ENFOQUE
        await this.applyAdvancedCameraSettings();
      }

      return stream;
    } catch (error) {
      console.error("Error inicializando cámara con enfoque automático:", error);
      throw new Error(`Error de cámara: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  }

  // APLICAR CONFIGURACIONES AVANZADAS DE CÁMARA
  private async applyAdvancedCameraSettings(): Promise<void> {
    if (!this.currentTrack || !this.focusCapabilities) return;

    try {
      const constraints: any = {};

      // CONFIGURAR ENFOQUE AUTOMÁTICO CONTINUO
      const capabilities = this.focusCapabilities as any;
      if (capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("continuous")) {
        constraints.focusMode = "continuous";
        console.log("Enfoque automático continuo activado");
      } else if (capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("manual")) {
        // Si no hay automático, configurar manual a distancia óptima
        constraints.focusMode = "manual";
        if (capabilities.focusDistance) {
          constraints.focusDistance = this.manualFocusDistance;
          console.log("Enfoque manual configurado a distancia óptima");
        }
      }

      // CONFIGURAR EXPOSICIÓN AUTOMÁTICA
      if (capabilities.exposureMode && Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes("continuous")) {
        constraints.exposureMode = "continuous";
        console.log("Exposición automática activada");
      }

      // CONFIGURAR BALANCE DE BLANCOS AUTOMÁTICO
      if (capabilities.whiteBalanceMode && Array.isArray(capabilities.whiteBalanceMode) && capabilities.whiteBalanceMode.includes("continuous")) {
        constraints.whiteBalanceMode = "continuous";
        console.log("Balance de blancos automático activado");
      }

      // ACTIVAR FLASH/TORCH SI ESTÁ DISPONIBLE Y ES ÚTIL
      if (capabilities.torch) {
        console.log("Flash/Torch disponible para condiciones de poca luz");
      }

      // APLICAR CONFIGURACIONES
      if (Object.keys(constraints).length > 0) {
        await this.currentTrack.applyConstraints({ advanced: [constraints] });
        console.log("Configuraciones avanzadas aplicadas:", constraints);
      }

      // INICIAR OPTIMIZACIÓN CONTINUA DE ENFOQUE
      this.startContinuousAutofocus();
    } catch (error) {
      console.warn("No se pudieron aplicar algunas configuraciones avanzadas:", error);
    }
  }

  // ENFOQUE AUTOMÁTICO CONTINUO INTELIGENTE
  private startContinuousAutofocus(): void {
    if (this.autoFocusInterval) {
      clearInterval(this.autoFocusInterval);
    }

    this.autoFocusInterval = setInterval(async () => {
      if (!this.isScanning || !this.currentTrack) return;

      try {
        // CALCULAR NITIDEZ DE LA IMAGEN ACTUAL
        const currentSharpness = this.calculateImageSharpness();
        this.sharpnessHistory.push(currentSharpness);

        // Mantener historial de los últimos 5 frames
        if (this.sharpnessHistory.length > 5) {
          this.sharpnessHistory.shift();
        }

        // DECIDIR SI NECESITA REAJUSTE DE ENFOQUE
        const averageSharpness = this.sharpnessHistory.reduce((a, b) => a + b, 0) / this.sharpnessHistory.length;
        const sharpnessVariation = Math.max(...this.sharpnessHistory) - Math.min(...this.sharpnessHistory);

        // Si la nitidez es baja o muy variable, intentar optimizar
        if (averageSharpness < 0.4 || sharpnessVariation > 0.3) {
          if (!this.focusOptimizationActive) {
            this.optimizeFocusForBarcodes();
          }
        } else {
          this.focusOptimizationActive = false;
        }

        this.lastSharpnessScore = currentSharpness;
      } catch (error) {
        console.warn("Error en enfoque automático continuo:", error);
      }
    }, 500);

    console.log("Enfoque automático continuo iniciado");
  }

  // CALCULAR NITIDEZ DE LA IMAGEN
  private calculateImageSharpness(): number {
    if (!this.video || this.video.readyState < 2) return 0;

    try {
      // Crear canvas pequeño para análisis rápido
      const analysisCanvas = document.createElement("canvas");
      const analysisContext = analysisCanvas.getContext("2d");
      if (!analysisContext) return 0;

      // Usar área pequeña para análisis rápido
      const sampleWidth = 200;
      const sampleHeight = 150;
      analysisCanvas.width = sampleWidth;
      analysisCanvas.height = sampleHeight;

      // Dibujar frame actual redimensionado
      analysisContext.drawImage(this.video, 0, 0, sampleWidth, sampleHeight);
      const imageData = analysisContext.getImageData(0, 0, sampleWidth, sampleHeight);
      const data = imageData.data;

      // CALCULAR GRADIENTE LAPLACIANO PARA MEDIR NITIDEZ
      let sharpness = 0;
      let pixelCount = 0;

      for (let y = 1; y < sampleHeight - 1; y++) {
        for (let x = 1; x < sampleWidth - 1; x++) {
          const center = (y * sampleWidth + x) * 4;
          const top = ((y - 1) * sampleWidth + x) * 4;
          const bottom = ((y + 1) * sampleWidth + x) * 4;
          const left = (y * sampleWidth + (x - 1)) * 4;
          const right = (y * sampleWidth + (x + 1)) * 4;

          // Convertir a escala de grises y calcular gradiente
          const centerGray = (data[center] + data[center + 1] + data[center + 2]) / 3;
          const topGray = (data[top] + data[top + 1] + data[top + 2]) / 3;
          const bottomGray = (data[bottom] + data[bottom + 1] + data[bottom + 2]) / 3;
          const leftGray = (data[left] + data[left + 1] + data[left + 2]) / 3;
          const rightGray = (data[right] + data[right + 1] + data[right + 2]) / 3;

          // Operador Laplaciano
          const laplacian = Math.abs(
            4 * centerGray - topGray - bottomGray - leftGray - rightGray
          );

          sharpness += laplacian;
          pixelCount++;
        }
      }

      // Normalizar y devolver valor entre 0 y 1
      const normalizedSharpness = (sharpness / pixelCount) / 255;
      return Math.min(normalizedSharpness, 1);
    } catch (error) {
      console.warn("Error calculando nitidez:", error);
      return 0.5;
    }
  }

  // OPTIMIZAR ENFOQUE ESPECÍFICAMENTE PARA CÓDIGOS DE BARRAS
  private async optimizeFocusForBarcodes(): Promise<void> {
    if (!this.currentTrack || this.focusOptimizationActive) return;

    this.focusOptimizationActive = true;

    try {
      console.log("Optimizando enfoque para códigos de barras...");

      const capabilities = this.currentTrack.getCapabilities() as any;

      if (capabilities?.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("manual") && capabilities?.focusDistance) {
        // PROBAR DIFERENTES DISTANCIAS DE ENFOQUE ÓPTIMAS PARA CÓDIGOS
        const optimalDistances = [0.2, 0.3, 0.4, 0.5];
        let bestDistance = 0.3;
        let bestSharpness = 0;

        for (const distance of optimalDistances) {
          try {
            await this.currentTrack.applyConstraints({
              advanced: [
                {
                  focusMode: "manual",
                  focusDistance: distance,
                } as any,
              ],
            });

            // Esperar a que se estabilice el enfoque
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Medir nitidez
            const sharpness = this.calculateImageSharpness();

            if (sharpness > bestSharpness) {
              bestSharpness = sharpness;
              bestDistance = distance;
            }

            console.log(`Distancia ${distance}m: nitidez ${sharpness.toFixed(3)}`);
          } catch (error) {
            console.warn(`Error probando distancia ${distance}:`, error);
          }
        }

        // Aplicar la mejor distancia encontrada
        if (bestSharpness > this.lastSharpnessScore) {
          await this.currentTrack.applyConstraints({
            advanced: [
              {
                focusMode: "manual",
                focusDistance: bestDistance,
              } as any,
            ],
          });

          this.manualFocusDistance = bestDistance;
          console.log(`Enfoque optimizado a ${bestDistance}m (nitidez: ${bestSharpness.toFixed(3)})`);
        }
      } else if (capabilities?.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("continuous")) {
        // Si no hay modo manual, forzar reactivación de modo continuo
        await this.currentTrack.applyConstraints({
          advanced: [
            {
              focusMode: "continuous",
            } as any,
          ],
        });

        console.log("Enfoque automático continuo reactivado");
      }
    } catch (error) {
      console.warn("Error en optimización de enfoque:", error);
    } finally {
      // Dejar un tiempo antes de la próxima optimización
      setTimeout(() => {
        this.focusOptimizationActive = false;
      }, 2000);
    }
  }

  // MÉTODO PÚBLICO PARA ALTERNAR FLASH/TORCH
  async toggleTorch(enable?: boolean): Promise<boolean> {
    if (!this.currentTrack) {
      console.warn("Flash/Torch no disponible: no hay track de video activo");
      return false;
    }

    try {
      const capabilities = this.currentTrack.getCapabilities() as any;
      if (!capabilities?.torch) {
        console.warn("Flash/Torch no disponible en este dispositivo");
        return false;
      }

      const currentSettings = this.currentTrack.getSettings() as any;
      const newTorchState = enable !== undefined ? enable : !currentSettings.torch;

      await this.currentTrack.applyConstraints({
        advanced: [
          {
            torch: newTorchState,
          } as any,
        ],
      });

      console.log(`Flash/Torch ${newTorchState ? "activado" : "desactivado"}`);
      return newTorchState;
    } catch (error) {
      console.error("Error controlando flash/torch:", error);
      return false;
    }
  }

  async initZXingAdvanced(): Promise<void> {
    try {
      if (typeof window !== "undefined" && !(window as any).ZXing) {
        await this.loadZXingScriptAdvanced();
      }

      const ZXing = (window as any).ZXing;
      if (!ZXing) {
        throw new Error("No se pudo cargar ZXing desde ningún CDN");
      }

      // Crear reader con configuración ultra optimizada
      this.zxingReader = new ZXing.BrowserMultiFormatReader();

      // Configurar hints avanzados para mejor detección
      const hints = new Map();

      // Formatos optimizados por prioridad
      const priorityFormats = [
        ZXing.BarcodeFormat?.EAN_13,
        ZXing.BarcodeFormat?.EAN_8,
        ZXing.BarcodeFormat?.UPC_A,
        ZXing.BarcodeFormat?.UPC_E,
        ZXing.BarcodeFormat?.CODE_128,
        ZXing.BarcodeFormat?.CODE_39,
        ZXing.BarcodeFormat?.QR_CODE,
      ].filter((format) => format !== undefined);

      if (ZXing.DecodeHintType) {
        hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, priorityFormats);
        hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
        hints.set(ZXing.DecodeHintType.ALSO_INVERTED, true);
        hints.set(ZXing.DecodeHintType.ASSUME_CODE_39_CHECK_DIGIT, false);
        hints.set(ZXing.DecodeHintType.ASSUME_GS1, false);

        // Configuración para mejor rendimiento
        if (ZXing.DecodeHintType.RETURN_CODABAR_START_END) {
          hints.set(ZXing.DecodeHintType.RETURN_CODABAR_START_END, true);
        }
      }

      if (this.zxingReader) {
        this.zxingReader.hints = hints;
      }

      console.log("ZXing inicializado con configuración avanzada");
      this.useZXing = true;
    } catch (error) {
      console.error("Error crítico inicializando ZXing:", error);
      throw error;
    }
  }

  private loadZXingScriptAdvanced(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cdnUrls = [
        "https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js",
        "https://cdn.jsdelivr.net/npm/@zxing/library@0.20.0/umd/index.min.js",
        "https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js",
        "https://cdn.jsdelivr.net/npm/@zxing/library@0.19.1/umd/index.min.js",
      ];

      let currentIndex = 0;
      const loadTimeout = 8000;

      const tryLoadScript = () => {
        if (currentIndex >= cdnUrls.length) {
          reject(new Error("No se pudo cargar ZXing desde ningún CDN disponible"));
          return;
        }

        const script = document.createElement("script");
        const timeoutId = setTimeout(() => {
          script.remove();
          console.warn(`Timeout cargando ZXing desde: ${cdnUrls[currentIndex]}`);
          currentIndex++;
          tryLoadScript();
        }, loadTimeout);

        script.src = cdnUrls[currentIndex];
        script.async = true;
        script.defer = true;

        script.onload = () => {
          clearTimeout(timeoutId);
          console.log(`ZXing cargado exitosamente desde: ${cdnUrls[currentIndex]}`);
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeoutId);
          script.remove();
          console.warn(`Error cargando ZXing desde: ${cdnUrls[currentIndex]}`);
          currentIndex++;
          tryLoadScript();
        };

        if (typeof document !== 'undefined') {
          document.head.appendChild(script);
        }
      };

      tryLoadScript();
    });
  }

  start(): void {
    if (this.isScanning) {
      console.log("Scanner ya está en funcionamiento");
      return;
    }

    this.isScanning = true;
    this.lastDetection = 0;
    this.consecutiveDetections.clear();
    this.detectionHistory.clear();
    this.performanceStats.totalScans = 0;
    this.performanceStats.successfulScans = 0;

    console.log(`Iniciando scanner con método: ${this.useZXing ? "ZXing" : "BarcodeDetector"}`);

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

    // DETENER ENFOQUE AUTOMÁTICO
    if (this.autoFocusInterval) {
      clearInterval(this.autoFocusInterval);
      this.autoFocusInterval = null;
    }

    // LIMPIAR RECURSOS DE CÁMARA
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    this.currentTrack = null;
    this.focusCapabilities = null;
    this.focusOptimizationActive = false;
    this.sharpnessHistory = [];

    if (this.zxingReader) {
      try {
        this.zxingReader.reset();
      } catch (error) {
        console.warn("Error al detener ZXing reader:", error);
      }
    }

    this.consecutiveDetections.clear();
    this.resultCache.clear();

    console.log(`Scanner detenido. Stats: ${this.performanceStats.successfulScans}/${this.performanceStats.totalScans} exitosos`);
  }

  private startBarcodeDetectorScanning(): void {
    const scanLoop = () => {
      if (!this.isScanning) return;

      this.scanFrameWithBarcodeDetector().then(() => {
        if (this.isScanning && this.continuous) {
          this.animationId = requestAnimationFrame(scanLoop);
        }
      }).catch((error) => {
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

        if (cachedResult && cachedResult.timestamp && now - cachedResult.timestamp < this.cacheTimeout) {
          this.processDetection(cachedResult);
          if (this.continuous) {
            setTimeout(scanWithZXing, 100);
          }
          return;
        }

        // Intentar decodificar con ZXing
        if (this.zxingReader && this.zxingReader.decodeFromCanvas) {
          this.zxingReader.decodeFromCanvas(this.canvas)
            .then((result: any) => {
              const processingTime = performance.now() - startTime;

              this.updatePerformanceStats(processingTime);

              if (result && this.isValidBarcodeValue(result.text)) {
                const barcodeResult: BarcodeResult = {
                  code: result.text,
                  format: this.mapZXingFormat(result.format) || "unknown",
                  confidence: this.calculateZXingConfidence(result),
                  timestamp: now,
                  location: this.extractBarcodeLocation(result),
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

              if (this.continuous) {
                setTimeout(scanWithZXing, 80);
              }
            });
        }
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

      if (cachedResult && cachedResult.timestamp && now - cachedResult.timestamp < this.cacheTimeout) {
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
              location: this.extractBarcodeDetectorLocation(barcode),
            };

            // Guardar en cache
            this.resultCache.set(frameHash, barcodeResult);

            this.processDetection(barcodeResult);
            this.performanceStats.successfulScans++;
            break;
          }
        }
      }
    } catch (error) {
      const processingTime = performance.now() - startTime;

      this.updatePerformanceStats(processingTime);

      // Si falla BarcodeDetector, cambiar a ZXing
      if (!this.useZXing) {
        console.log("Error con BarcodeDetector, cambiando a ZXing...");
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
    this.context.drawImage(this.video, scanX, scanY, scanWidth, scanHeight, 0, 0, scanWidth, scanHeight);

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
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);

      // Aplicar threshold adaptativo más agresivo
      const threshold = 128;
      const enhanced = gray > threshold ? 255 : 0;

      // Aplicar un poco de contraste adicional
      const contrasted = enhanced === 255 ? 255 : Math.max(0, enhanced - 20);

      output[i] = contrasted; // Red
      output[i + 1] = contrasted; // Green
      output[i + 2] = contrasted; // Blue
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
    const formatReliability: { [key: string]: number } = {
      EAN_13: 0.95,
      EAN_8: 0.92,
      UPC_A: 0.95,
      UPC_E: 0.9,
      CODE_128: 0.88,
      CODE_39: 0.85,
      QR_CODE: 0.93,
    };

    const format = result.format?.toString();
    if (format && formatReliability[format]) {
      confidence *= formatReliability[format];
    }

    // Factor por longitud del código
    const codeLength = result.text?.length || 0;
    if (codeLength >= 8 && codeLength <= 14) {
      confidence *= 1.05;
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
    const formatWeights: { [key: string]: number } = {
      ean_13: 0.98,
      ean_8: 0.95,
      upc_a: 0.98,
      upc_e: 0.94,
      code_128: 0.9,
      code_39: 0.87,
      qr_code: 0.95,
    };

    confidence *= formatWeights[barcode.format] || 0.8;

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
        height: maxY - minY,
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
        height: barcode.boundingBox.height,
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

      console.log(`Código confirmado: ${code} (${result.format}) - Confianza: ${(result.confidence || 0).toFixed(2)}`);

      // Agregar estadísticas al resultado
      const enhancedResult = {
        ...result,
        confidence: result.confidence || 0.9,
        scanStats: {
          totalScans: this.performanceStats.totalScans,
          successRate: this.performanceStats.successfulScans / this.performanceStats.totalScans,
          avgProcessingTime: Math.round(this.performanceStats.averageProcessingTime),
        },
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
    return this.useZXing ? "ZXing Pro + AutoFocus" : "BarcodeDetector Native + AutoFocus";
  }

  getDetectionHistory(): Array<{ code: string; timestamp: number }> {
    return Array.from(this.detectionHistory.entries()).map(([code, timestamp]) => ({ code, timestamp }));
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
    focusStats: {
      autoFocusActive: boolean;
      lastSharpnessScore: number;
      averageSharpness: number;
      focusOptimizationActive: boolean;
      currentFocusDistance: number;
      torchAvailable: boolean;
    };
  } {
    const averageSharpness = this.sharpnessHistory.length > 0 ? this.sharpnessHistory.reduce((a, b) => a + b, 0) / this.sharpnessHistory.length : 0;

    return {
      method: this.getMethod(),
      scanning: this.isScanning,
      lastDetection: this.lastDetection,
      detectionCount: this.detectionHistory.size,
      performance: this.getPerformanceStats(),
      cacheSize: this.resultCache.size,
      focusStats: {
        autoFocusActive: this.autoFocusInterval !== null,
        lastSharpnessScore: this.lastSharpnessScore,
        averageSharpness,
        focusOptimizationActive: this.focusOptimizationActive,
        currentFocusDistance: this.manualFocusDistance,
        torchAvailable: !!(this.focusCapabilities as any)?.torch,
      },
    };
  }

  // Método para ajustar configuración en tiempo real
  updateConfiguration(config: Partial<{ detectionCooldown: number; requiredConsecutive: number; scanArea: { x: number; y: number; width: number; height: number }; manualFocusDistance: number }>): void {
    if (config.detectionCooldown !== undefined) {
      this.detectionCooldown = config.detectionCooldown;
    }
    if (config.requiredConsecutive !== undefined) {
      this.requiredConsecutive = config.requiredConsecutive;
    }
    if (config.scanArea !== undefined) {
      this.scanArea = config.scanArea;
    }
    if (config.manualFocusDistance !== undefined) {
      this.manualFocusDistance = config.manualFocusDistance;
      // Aplicar inmediatamente si está en modo manual
      if (this.currentTrack) {
        const capabilities = this.currentTrack.getCapabilities() as any;
        if (capabilities?.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes("manual")) {
          this.currentTrack.applyConstraints({
            advanced: [
              {
                focusMode: "manual",
                focusDistance: config.manualFocusDistance,
              } as any,
            ],
          }).catch((error) => console.warn("Error aplicando nueva distancia de enfoque:", error));
        }
      }
    }

    console.log("Configuración actualizada:", config);
  }

  // Método para limpiar cache manualmente
  clearCache(): void {
    this.resultCache.clear();
    this.detectionHistory.clear();
    this.consecutiveDetections.clear();
    this.sharpnessHistory = [];
    console.log("Cache limpiado");
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
    const commonPatterns = [/^( \d{8}| \d{12}| \d{13}| \d{14})$/, /^( \d{6}| \d{12})$/];

    const matchesPattern = commonPatterns.some((pattern) => pattern.test(code));
    if (matchesPattern) return true;

    // Validación flexible para otros formatos
    if (code.length >= 6 && code.length <= 18 && numericRatio >= 0.8) {
      return true;
    }

    return false;
  }

  private mapZXingFormat(zxingFormat: any): string {
    const formatMap: { [key: string]: string } = {
      EAN_13: "ean_13",
      EAN_8: "ean_8",
      UPC_A: "upc_a",
      UPC_E: "upc_e",
      CODE_128: "code_128",
      CODE_39: "code_39",
      CODE_93: "code_93",
      QR_CODE: "qr_code",
      DATA_MATRIX: "data_matrix",
      AZTEC: "aztec",
      PDF_417: "pdf_417",
    };

    return formatMap[zxingFormat?.toString()] || "unknown";
  }
}

// FUNCIONES PRINCIPALES MEJORADAS CON ENFOQUE AUTOMÁTICO
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
    scanArea: options?.scanArea,
  });

  // INICIALIZAR CON ENFOQUE AUTOMÁTICO
  try {
    const stream = await scanner.initializeCameraWithAutoFocus();
    videoElement.srcObject = stream;

    await new Promise<void>((resolve) => {
      videoElement.onloadedmetadata = () => resolve();
    });

    await videoElement.play();
    console.log("Video stream con enfoque automático iniciado");
  } catch (error) {
    console.error("Error iniciando cámara con enfoque automático:", error);
    throw error;
  }

  await scanner.init();
  scanner.start();

  return scanner;
}

export function stopBarcodeScanner(scanner?: UltraBarcodeScannerPro): void {
  if (scanner) {
    scanner.stop();
  }
}

// NUEVA FUNCIÓN PARA BUSCAR PRODUCTOS POR CÓDIGO DE BARRAS
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
    console.log(`Buscando producto con código: ${barcode}`);

    // Validar formato del código de barras
    if (!barcode || barcode.length < 8 || barcode.length > 14) {
      throw new Error('Código de barras inválido');
    }

    // Lista de APIs para probar
    const apis = [
      {
        name: 'OpenFoodFacts',
        url: `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        transform: (data: any) => {
          if (data.status === 1 && data.product) {
            return {
              product_name: data.product.product_name || data.product.generic_name,
              brands: data.product.brands,
              nutriments: data.product.nutriments,
              source: 'OpenFoodFacts'
            };
          }
          return null;
        }
      },
      {
        name: 'UPC Database',
        url: `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
        transform: (data: any) => {
          if (data.items && data.items.length > 0) {
            const item = data.items[0];
            return {
              product_name: item.title,
              brands: item.brand,
              nutriments: {},
              source: 'UPC Database'
            };
          }
          return null;
        }
      }
    ];

    // Probar cada API
    for (const api of apis) {
      try {
        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ProFitness/1.0'
          },
          signal: AbortSignal.timeout(10000) // 10 segundos timeout
        });

        if (!response.ok) {
          console.warn(`Error en ${api.name}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const product = api.transform(data);

        if (product && product.product_name) {
          console.log(`Producto encontrado en ${api.name}:`, product.product_name);
          return product;
        }
      } catch (apiError) {
        console.warn(`Error consultando ${api.name}:`, apiError);
        continue;
      }
    }

    // Si ninguna API funcionó, retornar datos básicos
    console.log(`No se encontró información para el código: ${barcode}`);
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
    console.error('Error buscando producto por código de barras:', error);

    if (error instanceof Error) {
      if (error.message.includes('inválido')) {
        throw error;
      } else if (error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Tiempo de espera agotado. Intenta nuevamente.');
      }
    }

    throw new Error('Error desconocido al buscar el producto');
  }
}

// FUNCIÓN AUXILIAR PARA VALIDAR CÓDIGOS DE BARRAS
export function validateBarcodeFormat(barcode: string): boolean {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }

  const cleanCode = barcode.trim();

  // Validar longitud
  if (cleanCode.length < 8 || cleanCode.length > 14) {
    return false;
  }

  // Validar que contenga solo números
  if (!(/^\d+$/.test(cleanCode))) {
    return false;
  }

  // Validar formatos específicos
  const validLengths = [8, 12, 13, 14]; // EAN-8, UPC-A, EAN-13, etc.
  return validLengths.includes(cleanCode.length);
}

// FUNCIÓN PARA LIMPIAR Y FORMATEAR CÓDIGOS DE BARRAS
export function formatBarcode(rawCode: string): string {
  if (!rawCode) return '';

  // Limpiar espacios y caracteres especiales
  let cleaned = rawCode.trim().replace(/[^\\d]/g, '');

  // Asegurar longitud mínima
  if (cleaned.length < 8) {
    cleaned = cleaned.padStart(8, '0');
  }

  return cleaned;
}
