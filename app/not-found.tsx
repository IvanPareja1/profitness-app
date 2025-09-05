
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <i className="ri-error-warning-line" style={{ color: 'white', fontSize: '36px' }}></i>
      </div>
      
      <h1 style={{
        fontSize: '48px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '16px'
      }}>404</h1>
      
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '8px'
      }}>Página no encontrada</h2>
      
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '32px'
      }}>
        La página que buscas no existe o ha sido movida.
      </p>
      
      <Link href="/" style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: '500',
        transition: 'transform 0.2s'
      }} className="!rounded-button">
        Volver al inicio
      </Link>
    </div>
  );
}
