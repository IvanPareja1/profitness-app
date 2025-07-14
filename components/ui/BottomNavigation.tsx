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
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center py-2 px-1">
              {item.isSpecial ? (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
                  <i className={`${item.icon} text-white text-lg`}></i>
                </div>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center mb-1">
                  <i className={`${item.icon} ${isActive ? 'text-blue-600' : 'text-gray-400'} text-lg`}></i>
                </div>
              )}
              <span className={`text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}