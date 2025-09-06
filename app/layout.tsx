
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ServiceWorker from '@/components/ServiceWorker';
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
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/3996af3f516097f6140fa851c5b0df5f.png', sizes: '32x32', type: 'image/png' },
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/7625649a127219bd3a34457055bff123.png', sizes: '152x152', type: 'image/png' },
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/e0de0a483af0a27a07c5f5d0c4bdfb20.png', sizes: '192x192', type: 'image/png' },
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/a9bb3a212a263e3f4d517d4f87414af6.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/2834b0a0b957a555e9a866f31c9e4d63.png', sizes: '180x180', type: 'image/png' },
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
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className={inter.className}>
  {children}
  <ServiceWorker />
</body>
    </html>
  );
}
