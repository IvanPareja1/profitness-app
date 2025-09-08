'use client';
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';
import SupabaseChecker from './components/SupabaseChecker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProFitness - Nutricion y Fitness',
  description: 'Nutre tu progreso, domina tus resultados.',
  manifest: '/manifest.json',
  keywords: ['nutricion', 'fitness', 'salud', 'dieta', 'ejercicio'],
  authors: [{ name: 'ProFitness Team' }],
  // ... resto de metadata
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <SupabaseChecker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}