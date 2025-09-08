
// Utilidades para manejo seguro de fecha y hora del dispositivo
import React from 'react';

export interface DeviceTimeInfo {
  currentDate: string;
  currentTime: string;
  timezone: string;
  locale: string;
  formattedDate: string;
  formattedTime: string;
  isoString: string;
  timestamp: number;
}

export interface TimeFormatOptions {
  includeSeconds?: boolean;
  use24Hour?: boolean;
  includeMeridiem?: boolean;
  locale?: string;
}

export interface DateFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';
  includeWeekday?: boolean;
  includeYear?: boolean;
  locale?: string;
}

// Clase para manejo seguro de fecha y hora del dispositivo
export class DeviceTimeManager {
  private static instance: DeviceTimeManager;
  private isClient = false;
  private cachedTimeInfo: DeviceTimeInfo | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    // Verificar si estamos en el cliente de forma más robusta
    this.isClient = typeof window !== 'undefined' && typeof document !== 'undefined';

    // Solo inicializar si estamos en el cliente y hay usuarios existentes
    if (this.isClient) {
      // Inicializar de forma segura para no interrumpir usuarios existentes
      this.safeInitialize();
    }
  }

  // Patrón Singleton
  public static getInstance(): DeviceTimeManager {
    if (!DeviceTimeManager.instance) {
      DeviceTimeManager.instance = new DeviceTimeManager();
    }
    return DeviceTimeManager.instance;
  }

  // Inicialización segura que no afecte usuarios en producción
  private safeInitialize(): void {
    try {
      // Verificar si el usuario ya tiene datos para evitar interrupciones
      const hasUserData = localStorage.getItem('userData') || localStorage.getItem('isAuthenticated') || Object.keys(localStorage).some(key => key.startsWith('nutrition_'));

      if (hasUserData) {
        // Usuario existente - inicializar gradualmente sin afectar funcionalidad
        this.gradualInitialization();
      } else {
        // Usuario nuevo - inicialización completa
        this.initialize();
      }
    } catch (error) {
      console.warn('Error en inicialización segura de DeviceTimeManager:', error);
      // Continuar sin tiempo del dispositivo si hay errores
      this.createFallbackTimeInfo();
    }
  }

  // Inicialización gradual para usuarios existentes
  private gradualInitialization(): void {
    try {
      // Solo actualizar información básica sin interrumpir
      this.updateTimeInfoSafely();
      this.isInitialized = true;

      // Configurar actualización periódica menos agresiva para usuarios existentes
      this.updateInterval = setInterval(() => {
        this.updateTimeInfoSafely();
      }, 120000); // 2 minutos en lugar de 1 para usuarios existentes
    } catch (error) {
      console.warn('Error en inicialización gradual:', error);
      this.createFallbackTimeInfo();
    }
  }

  // Inicializar el sistema de tiempo para nuevos usuarios
  private initialize(): void {
    try {
      this.updateTimeInfo();
      this.isInitialized = true;

      // Actualizar cada minuto para nuevos usuarios
      this.updateInterval = setInterval(() => {
        this.updateTimeInfo();
      }, 60000);
    } catch (error) {
      console.warn('Error inicializando DeviceTimeManager:', error);
      this.createFallbackTimeInfo();
    }
  }

  // Actualización segura de información de tiempo
  private updateTimeInfoSafely(): void {
    try {
      // Verificar que no haya operaciones críticas en curso
      if (typeof window !== 'undefined' && (window as any).nutritionDataUpdating) {
        return; // No actualizar durante operaciones críticas
      }

      this.updateTimeInfo();
    } catch (error) {
      console.warn('Error en actualización segura de tiempo:', error);
      // Mantener información anterior si existe, o crear fallback
      if (!this.cachedTimeInfo) {
        this.createFallbackTimeInfo();
      }
    }
  }

  // Actualizar información de tiempo
  private updateTimeInfo(): void {
    try {
      const now = new Date();

      this.cachedTimeInfo = {
        currentDate: this.getDateString(now),
        currentTime: this.getTimeString(now),
        timezone: this.getTimezone(),
        locale: this.getDeviceLocale(),
        formattedDate: this.formatDate(now),
        formattedTime: this.formatTime(now),
        isoString: now.toISOString(),
        timestamp: now.getTime()
      };
    } catch (error) {
      console.warn('Error actualizando tiempo:', error);
      this.createFallbackTimeInfo();
    }
  }

  // Crear información de tiempo fallback ultra segura
  private createFallbackTimeInfo(): void {
    const now = new Date();

    this.cachedTimeInfo = {
      currentDate: now.toISOString().split('T')[0],
      currentTime: now.toTimeString().split(' ')[0].substring(0, 5),
      timezone: 'UTC',
      locale: 'es-ES',
      formattedDate: now.toDateString(),
      formattedTime: now.toTimeString().split(' ')[0].substring(0, 5),
      isoString: now.toISOString(),
      timestamp: now.getTime()
    };
  }

  // Obtener fecha en formato YYYY-MM-DD con máxima compatibilidad
  private getDateString(date: Date): string {
    try {
      // Método más seguro que toISOString para evitar problemas de zona horaria
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.warn('Error obteniendo string de fecha:', error);
      return new Date().toISOString().split('T')[0];
    }
  }

  // Obtener hora en formato HH:MM con máxima compatibilidad
  private getTimeString(date: Date, options: TimeFormatOptions = {}): string {
    try {
      // Intentar usar Intl.DateTimeFormat si está disponible y es funcional
      if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        try {
          const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !options.use24Hour
          };

          if (options.includeSeconds) {
            timeOptions.second = '2-digit';
          }

          const locale = options.locale || this.getDeviceLocale();
          return date.toLocaleTimeString(locale, timeOptions);
        } catch (intlError) {
          // Fallback si Intl falla
          console.warn('Intl.DateTimeFormat falló:', intlError);
        }
      }

      // Fallback manual
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.warn('Error obteniendo string de hora:', error);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }

  // Obtener zona horaria del dispositivo con fallbacks seguros
  private getTimezone(): string {
    try {
      if (this.isClient && typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        try {
          const resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
          return resolvedOptions.timeZone || 'UTC';
        } catch (intlError) {
          console.warn('Error obteniendo timezone con Intl:', intlError);
        }
      }
    } catch (error) {
      console.warn('Error obteniendo zona horaria:', error);
    }

    // Intentar obtener offset como fallback
    try {
      const offset = new Date().getTimezoneOffset();
      const sign = offset > 0 ? '-' : '+';
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return 'UTC';
    }
  }

  // Obtener locale del dispositivo con fallbacks seguros
  private getDeviceLocale(): string {
    try {
      if (this.isClient && navigator) {
        // Verificar diferentes propiedades de navigator de forma segura
        const navigatorLanguage = navigator.language;
        if (navigatorLanguage) return navigatorLanguage;

        const navigatorLanguages = (navigator as any).languages;
        if (navigatorLanguages && navigatorLanguages.length > 0) {
          return navigatorLanguages[0];
        }
      }
    } catch (error) {
      console.warn('Error obteniendo locale del dispositivo:', error);
    }
    return 'es-ES';
  }

  // Formatear fecha según opciones con máxima compatibilidad
  private formatDate(date: Date, options: DateFormatOptions = {}): string {
    try {
      if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
        try {
          const locale = options.locale || this.getDeviceLocale();

          const dateOptions: Intl.DateTimeFormatOptions = {};

          if (options.includeWeekday) {
            dateOptions.weekday = 'long';
          }

          if (options.includeYear !== false) {
            dateOptions.year = 'numeric';
          }

          dateOptions.month = options.format === 'short' ? 'short' : 'long';
          dateOptions.day = 'numeric';

          return date.toLocaleDateString(locale, dateOptions);
        } catch (intlError) {
          console.warn('Intl.DateTimeFormat falló en formatDate:', intlError);
        }
      }
    } catch (error) {
      console.warn('Error formateando fecha:', error);
    }

    // Fallback ultra seguro
    return date.toDateString();
  }

  // Formatear hora según opciones
  private formatTime(date: Date, options: TimeFormatOptions = {}): string {
    return this.getTimeString(date, options);
  }

  // MÉTODOS PÚBLICOS CON PROTECCIONES ADICIONALES

  // Obtener información completa de tiempo
  public getTimeInfo(): DeviceTimeInfo {
    if (!this.isClient) {
      // En el servidor, crear información básica
      const now = new Date();
      return {
        currentDate: now.toISOString().split('T')[0],
        currentTime: now.toISOString().split('T')[1].substring(0, 5),
        timezone: 'UTC',
        locale: 'es-ES',
        formattedDate: now.toDateString(),
        formattedTime: now.toISOString().split('T')[1].substring(0, 5),
        isoString: now.toISOString(),
        timestamp: now.getTime()
      };
    }

    // Si no está inicializado o no hay info cache, crear fallback
    if (!this.isInitialized || !this.cachedTimeInfo) {
      try {
        this.updateTimeInfo();
      } catch (error) {
        this.createFallbackTimeInfo();
      }
    }

    return this.cachedTimeInfo!;
  }

  // Obtener fecha actual del dispositivo de forma ultra segura
  public getCurrentDate(): string {
    try {
      if (!this.isClient) {
        return new Date().toISOString().split('T')[0];
      }

      const timeInfo = this.getTimeInfo();
      return timeInfo.currentDate;
    } catch (error) {
      console.warn('Error obteniendo fecha actual:', error);
      // Triple fallback para máxima seguridad
      try {
        return new Date().toISOString().split('T')[0];
      } catch (fallbackError) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
  }

  // Obtener hora actual del dispositivo de forma ultra segura
  public getCurrentTime(options: TimeFormatOptions = {}): string {
    try {
      if (!this.isClient) {
        return new Date().toISOString().split('T')[1].substring(0, 5);
      }

      const now = new Date();
      return this.getTimeString(now, options);
    } catch (error) {
      console.warn('Error obteniendo hora actual:', error);
      // Fallback manual ultra seguro
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }
  }

  // Obtener fecha formateada de forma segura
  public getFormattedDate(options: DateFormatOptions = {}): string {
    try {
      if (!this.isClient) {
        return new Date().toDateString();
      }

      const now = new Date();
      return this.formatDate(now, options);
    } catch (error) {
      console.warn('Error obteniendo fecha formateada:', error);
      return new Date().toDateString();
    }
  }

  // Obtener zona horaria del dispositivo de forma segura
  public getDeviceTimezone(): string {
    try {
      const timeInfo = this.getTimeInfo();
      return timeInfo.timezone;
    } catch (error) {
      console.warn('Error obteniendo timezone:', error);
      return 'UTC';
    }
  }

  // Obtener locale del dispositivo de forma segura
  public getLocale(): string {
    try {
      const timeInfo = this.getTimeInfo();
      return timeInfo.locale;
    } catch (error) {
      console.warn('Error obteniendo locale:', error);
      return 'es-ES';
    }
  }

  // Verificar si una fecha es hoy de forma segura
  public isToday(dateString: string): boolean {
    try {
      const today = this.getCurrentDate();
      return dateString === today;
    } catch (error) {
      console.warn('Error verificando si es hoy:', error);
      return false;
    }
  }

  // Formatear timestamp a fecha local con máxima compatibilidad
  public formatTimestamp(timestamp: string | number, options: {
    includeDate?: boolean;
    includeTime?: boolean;
    dateOptions?: DateFormatOptions;
    timeOptions?: TimeFormatOptions;
  } = {}): string {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);

      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      const parts = [];

      if (options.includeDate !== false) {
        try {
          parts.push(this.formatDate(date, options.dateOptions));
        } catch (error) {
          parts.push(date.toDateString());
        }
      }

      if (options.includeTime !== false) {
        try {
          parts.push(this.formatTime(date, options.timeOptions));
        } catch (error) {
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          parts.push(`${hours}:${minutes}`);
        }
      }

      return parts.join(' - ');
    } catch (error) {
      console.warn('Error formateando timestamp:', error);
      return 'Error en fecha';
    }
  }

  // Crear timestamp con zona horaria local de forma segura
  public createLocalTimestamp(): string {
    try {
      return new Date().toISOString();
    } catch (error) {
      console.warn('Error creando timestamp:', error);
      // Fallback manual
      const now = new Date();
      return now.toString();
    }
  }

  // Crear timestamp alias para compatibilidad
  public createTimestamp(): string {
    return this.createLocalTimestamp();
  }

  // Sincronizar con nueva zona horaria (para cuando cambie el dispositivo)
  public synchronizeTimezone(): void {
    if (this.isClient && this.isInitialized) {
      try {
        this.updateTimeInfo();
      } catch (error) {
        console.warn('Error sincronizando timezone:', error);
      }
    }
  }

  // Limpiar recursos de forma segura
  public destroy(): void {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      this.cachedTimeInfo = null;
      this.isInitialized = false;
    } catch (error) {
      console.warn('Error limpiando recursos de DeviceTimeManager:', error);
    }
  }

  // Método para verificar si está funcionando correctamente
  public isWorking(): boolean {
    try {
      return this.isClient && this.isInitialized && this.cachedTimeInfo !== null;
    } catch (error) {
      return false;
    }
  }
}

// Hook para usar en componentes React con protecciones adicionales
export function useDeviceTime() {
  const [timeInfo, setTimeInfo] = React.useState<DeviceTimeInfo | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const timeManager = DeviceTimeManager.getInstance();

      // Obtener información inicial de forma segura
      const initialInfo = timeManager.getTimeInfo();
      setTimeInfo(initialInfo);
      setIsLoaded(true);

      // Solo configurar actualización si el timeManager está funcionando
      if (timeManager.isWorking()) {
        const interval = setInterval(() => {
          try {
            const updatedInfo = timeManager.getTimeInfo();
            setTimeInfo(updatedInfo);
          } catch (error) {
            console.warn('Error actualizando timeInfo en hook:', error);
          }
        }, 60000);

        return () => {
          clearInterval(interval);
        };
      }
    } catch (error) {
      console.warn('Error en useDeviceTime hook:', error);
      // Configurar fallback
      setTimeInfo({
        currentDate: new Date().toISOString().split('T')[0],
        currentTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        timezone: 'UTC',
        locale: 'es-ES',
        formattedDate: new Date().toDateString(),
        formattedTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        isoString: new Date().toISOString(),
        timestamp: new Date().getTime()
      });
      setIsLoaded(true);
    }
  }, []);

  return {
    timeInfo,
    isLoaded,
    getCurrentDate: () => {
      try {
        return timeInfo?.currentDate || new Date().toISOString().split('T')[0];
      } catch (error) {
        return new Date().toISOString().split('T')[0];
      }
    },
    getCurrentTime: () => {
      try {
        return timeInfo?.currentTime || new Date().toTimeString().split(' ')[0].substring(0, 5);
      } catch (error) {
        return new Date().toTimeString().split(' ')[0].substring(0, 5);
      }
    },
    getFormattedDate: () => {
      try {
        return timeInfo?.formattedDate || new Date().toDateString();
      } catch (error) {
        return new Date().toDateString();
      }
    },
    getFormattedTime: () => {
      try {
        return timeInfo?.formattedTime || new Date().toTimeString().split(' ')[0].substring(0, 5);
      } catch (error) {
        return new Date().toTimeString().split(' ')[0].substring(0, 5);
      }
    },
    getTimezone: () => {
      try {
        return timeInfo?.timezone || 'UTC';
      } catch (error) {
        return 'UTC';
      }
    },
    getLocale: () => {
      try {
        return timeInfo?.locale || 'es-ES';
      } catch (error) {
        return 'es-ES';
      }
    }
  };
}

// Funciones de utilidad para usar directamente con máxima seguridad
export const deviceTime = {
  // Obtener instancia del manager
  getInstance: () => {
    try {
      return DeviceTimeManager.getInstance();
    } catch (error) {
      console.warn('Error obteniendo instancia de DeviceTimeManager:', error);
      // Retornar objeto con métodos fallback
      return {
        getCurrentDate: () => new Date().toISOString().split('T')[0],
        getCurrentTime: () => new Date().toTimeString().split(' ')[0].substring(0, 5),
        getFormattedDate: () => new Date().toDateString(),
        getDeviceTimezone: () => 'UTC',
        getLocale: () => 'es-ES',
        isToday: () => false,
        formatTimestamp: () => 'Error en fecha',
        createTimestamp: () => new Date().toISOString(),
        synchronizeTimezone: () => {},
        isWorking: () => false
      };
    }
  },

  // Métodos rápidos con fallbacks ultra seguros
  getCurrentDate: () => {
    try {
      return DeviceTimeManager.getInstance().getCurrentDate();
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  },

  getCurrentTime: (options?: TimeFormatOptions) => {
    try {
      return DeviceTimeManager.getInstance().getCurrentTime(options);
    } catch (error) {
      return new Date().toTimeString().split(' ')[0].substring(0, 5);
    }
  },

  getFormattedDate: (options?: DateFormatOptions) => {
    try {
      return DeviceTimeManager.getInstance().getFormattedDate(options);
    } catch (error) {
      return new Date().toDateString();
    }
  },

  getTimezone: () => {
    try {
      return DeviceTimeManager.getInstance().getDeviceTimezone();
    } catch (error) {
      return 'UTC';
    }
  },

  getLocale: () => {
    try {
      return DeviceTimeManager.getInstance().getLocale();
    } catch (error) {
      return 'es-ES';
    }
  },

  isToday: (date: string) => {
    try {
      return DeviceTimeManager.getInstance().isToday(date);
    } catch (error) {
      return false;
    }
  },

  formatTimestamp: (timestamp: string | number, options?: any) => {
    try {
      return DeviceTimeManager.getInstance().formatTimestamp(timestamp, options);
    } catch (error) {
      return 'Error en fecha';
    }
  },

  createTimestamp: () => {
    try {
      return DeviceTimeManager.getInstance().createTimestamp();
    } catch (error) {
      return new Date().toISOString();
    }
  },

  synchronize: () => {
    try {
      return DeviceTimeManager.getInstance().synchronizeTimezone();
    } catch (error) {
      console.warn('Error sincronizando zona horaria:', error);
    }
  },

  // Método para verificar si el sistema está funcionando
  isWorking: () => {
    try {
      return DeviceTimeManager.getInstance().isWorking();
    } catch (error) {
      return false;
    }
  }
};
