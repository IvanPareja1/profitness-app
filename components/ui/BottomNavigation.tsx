'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: 'ri-home-line', label: 'Inicio' },
    { href: '/nutrition', icon: 'ri-pie-chart-line', label: 'Nutrición' },
    { href: '/add-food', icon: 'ri-add-line', label: 'Agregar', isSpecial: true },
    { href: '/progress', icon: 'ri-line-chart-line', label: 'Progreso' },
    { href: '/profile', icon: 'ri-user-line', label: 'Perfil' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      backgroundColor: 'white',
      borderTop: '1px solid #e5e7eb',
      zIndex: 40
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        padding: '8px 0'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 4px',
                textDecoration: 'none'
              }}
            >
              {item.isSpecial ? (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <i className={item.icon} style={{ color: 'white', fontSize: '18px' }}></i>
                </div>
              ) : (
                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <i className={item.icon} style={{ 
                    color: isActive ? '#2563eb' : '#9ca3af', 
                    fontSize: '18px' 
                  }}></i>
                </div>
              )}
              <span style={{
                fontSize: '12px',
                color: isActive ? '#2563eb' : '#9ca3af',
                fontWeight: isActive ? '500' : '400'
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}