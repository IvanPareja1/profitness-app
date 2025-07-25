
import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "ProFitness - Nutrición y Fitness",
    short_name: "ProFitness",
    description: "Nutre tu progreso, domina tus resultados. Aplicación completa de nutrición y fitness.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    orientation: "portrait-primary",
    categories: ["health", "fitness", "nutrition", "lifestyle"],
    lang: "es",
    icons: [
      {
        src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/44cb678ba841e2a3e91ec8fab16b8a98.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/e9614fd88948e5f050315d0d06f626d9.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/77bd3515efa7348a1751277596a4d025.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/b919b60500cd326adbc377e080df2286.png",
        sizes: "32x32",
        type: "image/png",
        purpose: "any"
      }
    ],
    shortcuts: [
      {
        name: "Agregar Comida",
        short_name: "Comida",
        description: "Registra rápidamente tus alimentos",
        url: "/add-food",
        icons: [
          {
            src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/7ae63127bb660e76cb7f3a2599b876aa.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "Ver Nutrición",
        short_name: "Nutrición",
        description: "Consulta tu progreso nutricional",
        url: "/nutrition",
        icons: [
          {
            src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/nutrition-icon.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "Ver Progreso",
        short_name: "Progreso",
        description: "Revisa tus estadísticas y logros",
        url: "/progress",
        icons: [
          {
            src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/dac2a2d3b55c36ae006ad15e0180a1e8.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      },
      {
        name: "Mi Perfil",
        short_name: "Perfil",
        description: "Gestiona tu cuenta y configuración",
        url: "/profile",
        icons: [
          {
            src: "https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/profile-icon.png",
            sizes: "96x96",
            type: "image/png"
          }
        ]
      }
    ]
  };

  return NextResponse.json(manifest);
}
