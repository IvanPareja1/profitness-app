import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "Profitness - Nutrición Inteligente",
    short_name: "Profitness",
    description: "Nutre tu progreso, domina tus resultados. Tu compañero perfecto para un estilo de vida saludable.",
    start_url: "/",
    display: "standalone",
    background_color: "#3b82f6",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    categories: ["health", "fitness", "lifestyle"],
    lang: "es-ES",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any"
      }
    ],
    shortcuts: [
      {
        name: "Agregar Comida",
        short_name: "Agregar",
        description: "Registra rápidamente tus alimentos",
        url: "/add-food",
        icons: [
          {
            src: "/icons/shortcut-add-food.png",
            sizes: "96x96"
          }
        ]
      },
      {
        name: "Ver Progreso",
        short_name: "Progreso",
        description: "Revisa tu evolución",
        url: "/progress",
        icons: [
          {
            src: "/icons/shortcut-progress.png",
            sizes: "96x96"
          }
        ]
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
}