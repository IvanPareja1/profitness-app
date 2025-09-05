
'use client';

import { useState, useEffect } from 'react';
import { cloudSync, CloudSyncResult } from '../lib/cloud-sync';

interface CloudSyncManagerProps {
  onSyncComplete?: (result: CloudSyncResult) => void;
  onDataRestored?: () => void;
}

export default function CloudSyncManager({ onSyncComplete, onDataRestored }: CloudSyncManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [hasPermissions, setHasPermissions] = useState(false);
  const [lastSyncInfo, setLastSyncInfo] = useState<any>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [cloudBackupAvailable, setCloudBackupAvailable] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);

  useEffect(() => {
    checkPermissions();
    checkLastSync();
    checkCloudBackup();
  }, []);

  const checkPermissions = () => {
    setHasPermissions(cloudSync.hasPermissions());
  };

  const checkLastSync = () => {
    const syncInfo = cloudSync.getLastSyncInfo();
    setLastSyncInfo(syncInfo);
  };

  const checkCloudBackup = async () => {
    if (cloudSync.hasPermissions()) {
      const hasBackup = await cloudSync.hasCloudBackup();
      setCloudBackupAvailable(hasBackup);

      if (hasBackup) {
        const comparison = await cloudSync.compareWithCloud();
        setCompareResult(comparison);
      }
    }
  };

  const handleRequestPermissions = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Solicitando permisos...');

    try {
      const permissionGranted = await cloudSync.requestCloudPermissions();

      if (permissionGranted) {
        setHasPermissions(true);
        setSyncStatus('success');
        setSyncMessage('Permisos otorgados correctamente');
        setTimeout(() => {
          checkCloudBackup();
        }, 1000);
      } else {
        setSyncStatus('error');
        setSyncMessage('Permisos denegados');
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('Error al solicitar permisos');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 3000);
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Sincronizando datos...');

    try {
      const result = await cloudSync.autoSync();

      if (result.success) {
        setSyncStatus('success');
        setSyncMessage('Datos sincronizados correctamente');
        setLastSyncInfo({
          time: result.syncTime,
          success: true
        });

        if (onSyncComplete) {
          onSyncComplete(result);
        }
      } else {
        setSyncStatus('error');
        setSyncMessage(result.error || 'Error al sincronizar');
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('Error al sincronizar datos');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 3000);
  };

  const handleRestore = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Restaurando datos...');

    try {
      const result = await cloudSync.restoreFromCloud();

      if (result.success) {
        setSyncStatus('success');
        setSyncMessage('Datos restaurados correctamente');
        setShowRestoreDialog(false);

        if (onDataRestored) {
          onDataRestored();
        }

        // Recargar la página para mostrar los datos restaurados
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSyncStatus('error');
        setSyncMessage(result.error || 'Error al restaurar datos');
      }
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('Error al restaurar datos');
    }

    setTimeout(() => {
      setSyncStatus('idle');
      setSyncMessage('');
    }, 3000);
  };

  const handleDisconnect = () => {
    cloudSync.disconnect();
    setHasPermissions(false);
    setLastSyncInfo(null);
    setCloudBackupAvailable(false);
    setCompareResult(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="!rounded-button"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          width: '48px',
          height: '48px',
          background: hasPermissions ? 'linear-gradient(135deg, #10b981 0%, #16a34a 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}
      >
        <i className={`ri-${hasPermissions ? 'cloud-line' : 'cloud-off-line'}`} style={{ fontSize: '20px' }}></i>
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000
        }}
      />

      {/* Panel de Sincronización */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 1001
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Sincronización en la Nube
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#6b7280',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Estado de conexión */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: hasPermissions ? '#f0fdf4' : '#fef3c7',
          borderRadius: '12px',
          border: `1px solid ${hasPermissions ? '#dcfce7' : '#fde68a'}`,
          marginBottom: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: hasPermissions ? '#16a34a' : '#f59e0b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className={`ri-${hasPermissions ? 'cloud-line' : 'cloud-off-line'}`} style={{
              color: 'white',
              fontSize: '18px'
            }}></i>
          </div>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              margin: '0 0 2px 0'
            }}>
              {hasPermissions ? 'Conectado a Google Drive' : 'Sin conexión'}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0
            }}>
              {hasPermissions ? 'Datos protegidos en la nube' : 'Conecta para proteger tus datos'}
            </p>
          </div>
        </div>

        {/* Información de comparación */}
        {compareResult && (
          <div style={{
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              Estado de Sincronización
            </h4>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>En la nube:</span>
              <span style={{ fontSize: '12px', color: '#1f2937' }}>
                {compareResult.cloudTime ? formatDate(compareResult.cloudTime) : 'Sin datos'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>En el dispositivo:</span>
              <span style={{ fontSize: '12px', color: '#1f2937' }}>
                {compareResult.localTime ? formatDate(compareResult.localTime) : 'Sin datos'}
              </span>
            </div>
          </div>
        )}

        {/* Mensajes de estado */}
        {syncMessage && (
          <div style={{
            padding: '12px 16px',
            background: syncStatus === 'success' ? '#f0fdf4' : syncStatus === 'error' ? '#fef2f2' : '#fef3c7',
            border: `1px solid ${syncStatus === 'success' ? '#dcfce7' : syncStatus === 'error' ? '#fecaca' : '#fde68a'}`,
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className={`ri-${syncStatus === 'syncing' ? 'loader-4-line' : syncStatus === 'success' ? 'check-line' : 'error-warning-line'}`} style={{
              color: syncStatus === 'success' ? '#16a34a' : syncStatus === 'error' ? '#ef4444' : '#f59e0b',
              fontSize: '16px',
              animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none'
            }}></i>
            <span style={{
              fontSize: '14px',
              color: syncStatus === 'success' ? '#16a34a' : syncStatus === 'error' ? '#ef4444' : '#f59e0b'
            }}>
              {syncMessage}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {!hasPermissions ? (
            <button
              onClick={handleRequestPermissions}
              className="!rounded-button"
              disabled={syncStatus === 'syncing'}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: syncStatus === 'syncing' ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <i className="ri-key-line"></i>
              Conectar con Google Drive
            </button>
          ) : (
            <>
              <button
                onClick={handleSync}
                className="!rounded-button"
                disabled={syncStatus === 'syncing'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: syncStatus === 'syncing' ? '#9ca3af' : 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className={`ri-${syncStatus === 'syncing' ? 'loader-4-line' : 'upload-cloud-line'}`} style={{
                  animation: syncStatus === 'syncing' ? 'spin 1s linear infinite' : 'none'
                }}></i>
                Sincronizar Datos
              </button>

              {cloudBackupAvailable && (
                <button
                  onClick={() => setShowRestoreDialog(true)}
                  className="!rounded-button"
                  disabled={syncStatus === 'syncing'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: syncStatus === 'syncing' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <i className="ri-download-cloud-line"></i>
                  Restaurar desde la Nube
                </button>
              )}

              <button
                onClick={handleDisconnect}
                className="!rounded-button"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#f8fafc',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <i className="ri-logout-circle-line"></i>
                Desconectar
              </button>
            </>
          )}
        </div>

        {/* Información adicional */}
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            ¿Qué se sincroniza?
          </h4>
          <ul style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '0',
            paddingLeft: '16px'
          }}>
            <li>Perfil y configuraciones</li>
            <li>Datos de nutrición diarios</li>
            <li>Datos de fitness y ejercicio</li>
            <li>Configuraciones de recordatorios</li>
            <li>Objetivos y progreso</li>
          </ul>
        </div>
      </div>

      {/* Diálogo de confirmación de restauración */}
      {showRestoreDialog && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1002
          }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '320px',
            zIndex: 1003
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 12px 0'
            }}>
              Restaurar Datos
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 20px 0'
            }}>
              ¿Estás seguro de que quieres restaurar los datos desde la nube? 
              Esto sobrescribirá todos los datos actuales en este dispositivo.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowRestoreDialog(false)}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f8fafc',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleRestore}
                className="!rounded-button"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Restaurar
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
