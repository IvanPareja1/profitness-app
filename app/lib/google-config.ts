
// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "TU_GOOGLE_CLIENT_ID_AQUI";

// Verificar que la configuración esté presente
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "TU_GOOGLE_CLIENT_ID_AQUI") {
  console.warn('⚠️  Google Client ID no está configurado. Agrega tu Client ID a las variables de entorno.');
}
