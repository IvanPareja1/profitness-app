
export async function GET() {
  return Response.json({
    name: 'ProFitness',
    short_name: 'ProFitness',
    description: 'Aplicación de seguimiento nutricional y fitness',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/7625649a127219bd3a34457055bff123.png',
        sizes: '152x152',
        type: 'image/png'
      },
      {
        src: '/icon-180x180.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/e0de0a483af0a27a07c5f5d0c4bdfb20.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'https://static.readdy.ai/image/5f858daf8e885166d7b6b0d007fda7b6/a9bb3a212a263e3f4d517d4f87414af6.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ]
  });
}
