
// Google Fit API Integration for Smartwatch Sync
export interface FitnessData {
  steps: number;
  calories: number;
  heartRate: number;
  activeMinutes: number;
  distance: number;
  sleepHours: number;
  date: string;
}

export interface SyncResult {
  success: boolean;
  data?: FitnessData;
  error?: string;
}

export class FitnessSyncService {
  private accessToken: string | null = null;
  private readonly FITNESS_API_BASE = 'https://www.googleapis.com/fitness/v1/users/me';

  constructor() {
    // Only access localStorage on the client-side
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('google_access_token');
    }
  }

  // Solicitar permisos de Google Fit
  async requestFitnessPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.google) {
        throw new Error('Google API no está cargada');
      }

      const authInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: "234981966694-v0qeb0nj89mrscnn5nef6o0eddj2fi15.apps.googleusercontent.com",
        scope: [
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.body.read',
          'https://www.googleapis.com/auth/fitness.heart_rate.read',
          'https://www.googleapis.com/auth/fitness.sleep.read'
        ].join(' '),
        callback: (response: any) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            if (typeof window !== 'undefined') {
              localStorage.setItem('google_access_token', response.access_token);
            }
          }
        }
      });

      authInstance.requestAccessToken();
      return true;
    } catch (error) {
      console.error('Error requesting fitness permissions:', error);
      return false;
    }
  }

  // Sincronizar datos del smartwatch
  async syncFitnessData(date: string = new Date().toISOString().split('T')[0]): Promise<SyncResult> {
    if (typeof window === 'undefined') {
      return {
        success: false,
        error: 'No se puede sincronizar en el servidor'
      };
    }

    if (!this.accessToken) {
      return {
        success: false,
        error: 'No hay token de acceso. Solicita permisos primero.'
      };
    }

    try {
      const startTime = new Date(date).getTime() * 1000000; // nanoseconds
      const endTime = startTime + (24 * 60 * 60 * 1000 * 1000000); // +24 hours in nanoseconds

      // Obtener datos de pasos
      const stepsData = await this.fetchDataSource('derived:com.google.step_count.delta:com.google.android.gms:estimated_steps', startTime, endTime);

      // Obtener datos de calorías
      const caloriesData = await this.fetchDataSource('derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended', startTime, endTime);

      // Obtener datos de actividad
      const activeMinutesData = await this.fetchDataSource('derived:com.google.active_minutes:com.google.android.gms:merge_active_minutes', startTime, endTime);

      // Obtener datos de ritmo cardíaco
      const heartRateData = await this.fetchDataSource('derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm', startTime, endTime);

      // Procesar y combinar datos
      const fitnessData: FitnessData = {
        steps: this.extractSteps(stepsData),
        calories: this.extractCalories(caloriesData),
        heartRate: this.extractHeartRate(heartRateData),
        activeMinutes: this.extractActiveMinutes(activeMinutesData),
        distance: this.calculateDistance(this.extractSteps(stepsData)),
        sleepHours: 0, // Requiere permisos adicionales
        date
      };

      // Guardar datos localmente
      this.saveFitnessData(fitnessData);

      return {
        success: true,
        data: fitnessData
      };

    } catch (error) {
      console.error('Error syncing fitness data:', error);
      return {
        success: false,
        error: 'Error al sincronizar datos del smartwatch'
      };
    }
  }

  // Obtener datos de una fuente específica
  private async fetchDataSource(dataSourceId: string, startTime: number, endTime: number): Promise<any> {
    const response = await fetch(`${this.FITNESS_API_BASE}/dataSources/${dataSourceId}/datasets/${startTime}-${endTime}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error fetching ${dataSourceId}: ${response.statusText}`);
    }

    return response.json();
  }

  // Extraer pasos de los datos
  private extractSteps(data: any): number {
    if (!data?.point) return 0;
    return data.point.reduce((total: number, point: any) => {
      return total + (point.value?.[0]?.intVal || 0);
    }, 0);
  }

  // Extraer calorías de los datos
  private extractCalories(data: any): number {
    if (!data?.point) return 0;
    return Math.round(data.point.reduce((total: number, point: any) => {
      return total + (point.value?.[0]?.fpVal || 0);
    }, 0));
  }

  // Extraer ritmo cardíaco promedio
  private extractHeartRate(data: any): number {
    if (!data?.point) return 0;
    const heartRates = data.point.map((point: any) => point.value?.[0]?.fpVal || 0).filter((hr: number) => hr > 0);
    return heartRates.length > 0 ? Math.round(heartRates.reduce((a: number, b: number) => a + b, 0) / heartRates.length) : 0;
  }

  // Extraer minutos activos
  private extractActiveMinutes(data: any): number {
    if (!data?.point) return 0;
    return Math.round(data.point.reduce((total: number, point: any) => {
      return total + (point.value?.[0]?.intVal || 0);
    }, 0) / 60); // Convertir a minutos
  }

  // Calcular distancia aproximada basada en pasos
  private calculateDistance(steps: number): number {
    // Promedio de 0.75 metros por paso
    return Math.round((steps * 0.75) / 1000 * 100) / 100; // km con 2 decimales
  }

  // Guardar datos de fitness localmente
  private saveFitnessData(data: FitnessData): void {
    if (typeof window === 'undefined') return;

    const key = `fitness_${data.date}`;
    localStorage.setItem(key, JSON.stringify(data));

    // Actualizar perfil del usuario con promedios
    this.updateUserAverages(data);
  }

  // Actualizar promedios del usuario
  private updateUserAverages(data: FitnessData): void {
    if (typeof window === 'undefined') return;

    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profile.avgDailySteps = data.steps;
      profile.avgActiveMinutes = data.activeMinutes;
      profile.avgCaloriesBurned = data.calories;
      profile.lastSyncTime = new Date().toISOString();
      profile.syncEnabled = true;

      localStorage.setItem('userProfile', JSON.stringify(profile));

      // Disparar evento para actualizar UI
      window.dispatchEvent(new CustomEvent('fitnessDataUpdated', { detail: data }));
    }
  }

  // Obtener datos de fitness guardados
  getFitnessData(date: string): FitnessData | null {
    if (typeof window === 'undefined') return null;

    const key = `fitness_${date}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  // Verificar si hay permisos de fitness
  hasPermissions(): boolean {
    if (typeof window === 'undefined') return false;
    return this.accessToken !== null;
  }

  // Obtener última sincronización
  getLastSyncTime(): string | null {
    if (typeof window === 'undefined') return null;

    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.lastSyncTime || null;
    }
    return null;
  }

  // Desconectar sincronización
  disconnect(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('google_access_token');
    this.accessToken = null;

    // Actualizar perfil
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profile.syncEnabled = false;
      profile.lastSyncTime = null;
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }
}

// Instancia singleton
export const fitnessSync = new FitnessSyncService();
