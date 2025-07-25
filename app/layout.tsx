
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProFitness - Nutrición y Fitness',
  description: 'Nutre tu progreso, domina tus resultados. Aplicación completa de nutrición y fitness.',
  manifest: '/manifest.json',
  keywords: ['nutrición', 'fitness', 'salud', 'dieta', 'ejercicio', 'wellness'],
  authors: [{ name: 'ProFitness Team' }],
  creator: 'ProFitness',
  publisher: 'ProFitness',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ProFitness',
  },
  applicationName: 'ProFitness',
  category: 'health',
  classification: 'Health & Fitness',
  robots: 'index, follow',
  openGraph: {
    title: 'ProFitness - Nutrición y Fitness',
    description: 'Nutre tu progreso, domina tus resultados',
    type: 'website',
    locale: 'es_ES',
    siteName: 'ProFitness',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProFitness - Nutrición y Fitness',
    description: 'Nutre tu progreso, domina tus resultados',
  },
  icons: {
    icon: [
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/b919b60500cd326adbc377e080df2286.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/e9614fd88948e5f050315d0d06f626d9.png', sizes: '192x192', type: 'image/png' },
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/44cb678ba841e2a3e91ec8fab16b8a98.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/77bd3515efa7348a1751277596a4d025.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'ProFitness',
    'application-name': 'ProFitness',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#3b82f6',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
  colorScheme: 'light',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Registrar Service Worker para actualizaciones automáticas
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                      console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}