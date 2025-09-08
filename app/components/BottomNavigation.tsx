'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BottomNavigation() {
  const pathname = usePathname();
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        setLanguage(profile.language || 'es');
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }

    const handleLanguageChange = () => {
      try {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
          const profile = JSON.parse(userProfile);
          setLanguage(profile.language || 'es');
        }
      } catch (error) {
        console.log('Error updating language:', error);
      }
    };

    window.addEventListener('storage', handleLanguageChange);
    window.addEventListener('profileUpdated', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('profileUpdated', handleLanguageChange);
    };
  }, []);

  const translations = {
    es: {
      home: 'Home',
      nutrition: 'Nutrition',
      add: 'Add',
      progress: 'Progress',
      profile: 'Profile'
    },
    en: {
      home: 'Home',
      nutrition: 'Nutrition',
      add: 'Add',
      progress: 'Progress',
      profile: 'Profile'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.es;

  const navItems = [
    { href: '/', icon: 'ri-home-line', activeIcon: 'ri-home-fill', label: t.home },
    { href: '/nutrition', icon: 'ri-pie-chart-line', activeIcon: 'ri-pie-chart-fill', label: t.nutrition },
    { href: '/add-food', icon: 'ri-add-line', activeIcon: 'ri-add-line', label: t.add, isSpecial: true },
    { href: '/progress', icon: 'ri-line-chart-line', activeIcon: 'ri-line-chart-fill', label: t.progress },
    { href: '/profile', icon: 'ri-user-line', activeIcon: 'ri-user-fill', label: t.profile }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '8px 0'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        maxWidth: '375px',
        margin: '0 auto'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = isActive ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 4px',
                textDecoration: 'none',
                color: isActive ? '#3b82f6' : '#9ca3af'
              }}
            >
              <div style={{
                width: item.isSpecial ? '32px' : '24px',
                height: item.isSpecial ? '32px' : '24px',
                background: item.isSpecial ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' : 'transparent',
                borderRadius: item.isSpecial ? '50%' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <i 
                  className={IconComponent} 
                  style={{ 
                    fontSize: '18px',
                    color: item.isSpecial ? 'white' : 'inherit'
                  }}
                />
              </div>
              <span style={{ 
                fontSize: '12px',
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