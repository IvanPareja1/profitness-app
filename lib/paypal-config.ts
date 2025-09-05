
// PayPal Configuration for Donations
export const PAYPAL_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "TU_PAYPAL_CLIENT_ID_AQUI",
  CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || "TU_PAYPAL_CLIENT_SECRET_AQUI", // Solo backend
  MODE: process.env.PAYPAL_MODE || "sandbox", // "sandbox" o "live"
  API_BASE: process.env.PAYPAL_MODE === "live" 
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
};

// Verificar configuración
if (!PAYPAL_CONFIG.CLIENT_ID || PAYPAL_CONFIG.CLIENT_ID === "TU_PAYPAL_CLIENT_ID_AQUI") {
  console.warn('⚠️  PayPal Client ID no está configurado. Necesitas:');
  console.warn('1. Crear cuenta PayPal Developer');
  console.warn('2. Crear una aplicación');
  console.warn('3. Obtener Client ID y Client Secret');
  console.warn('4. Agregar a variables de entorno');
}

export interface PayPalPayment {
  amount: number;
  currency: string;
  description: string;
  return_url?: string;
  cancel_url?: string;
}

export interface PayPalResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}
