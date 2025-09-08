
// Sistema de sincronización en la nube para preservar datos del usuario

// Declarar tipos globales
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export interface UserData {
  userData: any;
  userProfile: any;
  userProfilePhoto: string | null;
  nutritionData: { [key: string]: string };
  restDaySettings: string | null;
  hydrationReminder: string | null;
  healthData: string | null;
  fitnessData: { [key: string]: string };
  lastSync: string;
  deviceId: string;
  appVersion: string;
  syncTime?: string; 
}

export interface CloudSyncResult {
  success: boolean;
  data?: UserData;
  error?: string;
  syncTime?: string;
}

export class CloudSyncService {
  private accessToken: string | null = null;
  private readonly GOOGLE_DRIVE_API = 'https://www.googleapis.com/drive/v3';
  private readonly FOLDER_NAME = 'ProFitness_Backup';
  private readonly FILE_NAME = 'user_data_backup.json';
  private deviceId: string;
  private appVersion: string = '1.0.3';

  constructor() {
    if (typeof window !== 'undefined') {
      this.deviceId = this.getOrCreateDeviceId();
      this.accessToken = localStorage.getItem('google_access_token');
    } else {
      this.deviceId = '';
    }
  }

  // Generar ID único del dispositivo
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  // Solicitar permisos de Google Drive
  async requestCloudPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.google) {
        // Cargar Google API si no está disponible
        await this.loadGoogleAPI();
      }

      const authInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: "234981966694-v0qeb0nj89mrscnn5nef6o0eddj2fi15.apps.googleusercontent.com",
        scope: [
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.appdata'
        ].join(' '),
        callback: (response: any) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            localStorage.setItem('google_access_token', response.access_token);
          }
        }
      });

      authInstance.requestAccessToken();
      return true;
    } catch (error) {
      console.error('Error requesting cloud permissions:', error);
      return false;
    }
  }

  // Cargar Google API dinámicamente
  private async loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined' && window.google) {
        resolve();
        return;
      }

      // Cargar el script de Google API
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Recopilar todos los datos del usuario
  private collectUserData(): UserData {
    if (typeof window === 'undefined') {
      throw new Error('No se puede recopilar datos en el servidor');
    }

    const nutritionData: { [key: string]: string } = {};
    const fitnessData: { [key: string]: string } = {};

    // Recopilar datos de nutrición
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nutrition_')) {
        const value = localStorage.getItem(key);
        if (value) {
          nutritionData[key] = value;
        }
      }
      if (key && key.startsWith('fitness_')) {
        const value = localStorage.getItem(key);
        if (value) {
          fitnessData[key] = value;
        }
      }
    }

    return {
      userData: this.getStorageItem('userData'),
      userProfile: this.getStorageItem('userProfile'),
      userProfilePhoto: localStorage.getItem('userProfilePhoto'),
      nutritionData,
      fitnessData,
      restDaySettings: localStorage.getItem('restDaySettings'),
      hydrationReminder: localStorage.getItem('hydrationReminder'),
      healthData: localStorage.getItem('healthData'),
      lastSync: new Date().toISOString(),
      deviceId: this.deviceId,
      appVersion: this.appVersion
    };
  }

  // Obtener y parsear datos del localStorage
  private getStorageItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error parsing ${key}:`, error);
      return null;
    }
  }

  // Buscar o crear carpeta de backup en Google Drive
  private async findOrCreateBackupFolder(): Promise<string> {
    try {
      // Buscar carpeta existente
      const searchResponse = await fetch(
        `${this.GOOGLE_DRIVE_API}/files?q=name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder'`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchData = await searchResponse.json();

      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      // Crear nueva carpeta
      const createResponse = await fetch(`${this.GOOGLE_DRIVE_API}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      const createData = await createResponse.json();
      return createData.id;

    } catch (error) {
      throw new Error('Error al crear carpeta de backup');
    }
  }

  // Subir datos a Google Drive
  async uploadToCloud(userData: UserData): Promise<CloudSyncResult> {
    if (!this.accessToken) {
      return {
        success: false,
        error: 'No hay token de acceso. Solicita permisos primero.'
      };
    }

    try {
      const folderId = await this.findOrCreateBackupFolder();

      // Buscar archivo existente
      const searchResponse = await fetch(
        `${this.GOOGLE_DRIVE_API}/files?q=name='${this.FILE_NAME}' and parents in '${folderId}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchData = await searchResponse.json();
      const fileExists = searchData.files && searchData.files.length > 0;
      const fileId = fileExists ? searchData.files[0].id : null;

      // Preparar datos para subir
      const dataToUpload = {
        ...userData,
        syncTime: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          deviceId: this.deviceId,
          appVersion: this.appVersion
        }
      };

      const boundary = '-------314159265358979323846';
      const delimiter = "\\r\\n--" + boundary + "\\r\\n";
      const close_delim = "\\r\\n--" + boundary + "--";

      let metadata = {
        name: this.FILE_NAME,
        parents: [folderId]
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\\r\\n\\r\\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\\r\\n\\r\\n' +
        JSON.stringify(dataToUpload) +
        close_delim;

      const method = fileExists ? 'PATCH' : 'POST';
      const url = fileExists
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      if (!response.ok) {
        throw new Error(`Error al subir archivo: ${response.statusText}`);
      }

      const result = await response.json();

      // Guardar información de la última sincronización
      localStorage.setItem('lastCloudSync', JSON.stringify({
        time: new Date().toISOString(),
        fileId: result.id,
        success: true
      }));

      return {
        success: true,
        syncTime: new Date().toISOString(),
        data: dataToUpload
      };

    } catch (error) {
      console.error('Error uploading to cloud:', error);
      return {
        success: false,
        error: `Error al sincronizar con la nube: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Descargar datos desde Google Drive
  async downloadFromCloud(): Promise<CloudSyncResult> {
    if (!this.accessToken) {
      return {
        success: false,
        error: 'No hay token de acceso. Solicita permisos primero.'
      };
    }

    try {
      const folderId = await this.findOrCreateBackupFolder();

      // Buscar archivo de backup
      const searchResponse = await fetch(
        `${this.GOOGLE_DRIVE_API}/files?q=name='${this.FILE_NAME}' and parents in '${folderId}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchData = await searchResponse.json();

      if (!searchData.files || searchData.files.length === 0) {
        return {
          success: false,
          error: 'No se encontró backup en la nube'
        };
      }

      const fileId = searchData.files[0].id;

      // Descargar contenido del archivo
      const downloadResponse = await fetch(
        `${this.GOOGLE_DRIVE_API}/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!downloadResponse.ok) {
        throw new Error(`Error al descargar archivo: ${downloadResponse.statusText}`);
      }

      const cloudData = await downloadResponse.json();

      return {
        success: true,
        data: cloudData,
        syncTime: cloudData.syncTime
      };

    } catch (error) {
      console.error('Error downloading from cloud:', error);
      return {
        success: false,
        error: `Error al descargar desde la nube: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Sincronización automática (subida)
  async autoSync(): Promise<CloudSyncResult> {
    if (!this.hasPermissions()) {
      return {
        success: false,
        error: 'No hay permisos de sincronización'
      };
    }

    try {
      const userData = this.collectUserData();
      return await this.uploadToCloud(userData);
    } catch (error) {
      return {
        success: false,
        error: `Error en sincronización automática: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Restaurar datos desde la nube
  async restoreFromCloud(): Promise<CloudSyncResult> {
    const downloadResult = await this.downloadFromCloud();

    if (!downloadResult.success || !downloadResult.data) {
      return downloadResult;
    }

    try {
      const cloudData = downloadResult.data;

      // Restaurar datos del usuario
      if (cloudData.userData) {
        localStorage.setItem('userData', JSON.stringify(cloudData.userData));
      }

      if (cloudData.userProfile) {
        localStorage.setItem('userProfile', JSON.stringify(cloudData.userProfile));
      }

      if (cloudData.userProfilePhoto) {
        localStorage.setItem('userProfilePhoto', cloudData.userProfilePhoto);
      }

      // Restaurar datos de nutrición
      if (cloudData.nutritionData) {
        Object.entries(cloudData.nutritionData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }

      // Restaurar datos de fitness
      if (cloudData.fitnessData) {
        Object.entries(cloudData.fitnessData).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }

      // Restaurar configuraciones
      if (cloudData.restDaySettings) {
        localStorage.setItem('restDaySettings', cloudData.restDaySettings);
      }

      if (cloudData.hydrationReminder) {
        localStorage.setItem('hydrationReminder', cloudData.hydrationReminder);
      }

      if (cloudData.healthData) {
        localStorage.setItem('healthData', cloudData.healthData);
      }

      // Marcar como restaurado
      localStorage.setItem('dataRestored', JSON.stringify({
        time: new Date().toISOString(),
        source: 'cloud',
        deviceId: cloudData.deviceId,
        appVersion: cloudData.appVersion
      }));

      return {
        success: true,
        data: cloudData,
        syncTime: cloudData.syncTime || cloudData.lastSync || new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: `Error al restaurar datos: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Verificar si hay permisos
  hasPermissions(): boolean {
    return this.accessToken !== null;
  }

  // Obtener información de la última sincronización
  getLastSyncInfo(): any {
    if (typeof window === 'undefined') return null;

    const lastSync = localStorage.getItem('lastCloudSync');
    return lastSync ? JSON.parse(lastSync) : null;
  }

  // Verificar si hay datos en la nube
  async hasCloudBackup(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const folderId = await this.findOrCreateBackupFolder();
      const searchResponse = await fetch(
        `${this.GOOGLE_DRIVE_API}/files?q=name='${this.FILE_NAME}' and parents in '${folderId}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchData = await searchResponse.json();
      return searchData.files && searchData.files.length > 0;
    } catch (error) {
      return false;
    }
  }

  // Comparar versiones de datos
  async compareWithCloud(): Promise<{
    cloudNewer: boolean;
    localNewer: boolean;
    cloudTime?: string;
    localTime?: string;
  }> {
    const cloudResult = await this.downloadFromCloud();
    if (!cloudResult.success || !cloudResult.data) {
      return { cloudNewer: false, localNewer: true };
    }

    const cloudTime = new Date(cloudResult.data.lastSync);
    const localSyncInfo = this.getLastSyncInfo();
    const localTime = localSyncInfo ? new Date(localSyncInfo.time) : new Date(0);

    return {
      cloudNewer: cloudTime > localTime,
      localNewer: localTime > cloudTime,
      cloudTime: cloudTime.toISOString(),
      localTime: localTime.toISOString()
    };
  }

  // Desconectar sincronización
  disconnect(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('google_access_token');
    localStorage.removeItem('lastCloudSync');
    this.accessToken = null;
  }
}

// Instancia singleton
export const cloudSync = new CloudSyncService();
