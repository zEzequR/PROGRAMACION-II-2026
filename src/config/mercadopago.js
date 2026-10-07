import 'dotenv/config'

// Toda la configuración de Mercado Pago vive acá — URLs base y las variables
// de entorno de las dos apps (tarjeta y QR). El resto del código importa estas
// constantes en vez de leer process.env directamente.

// URLs base de la API.
export const MP_API_BASE = "https://api.mercadopago.com";
export const MP_AUTH_BASE = "https://auth.mercadopago.com";

// Credenciales de la app de tarjeta ("pp2api").
export const MP_CLIENT_ID = process.env.MP_CLIENT_ID;
export const MP_CLIENT_SECRET = process.env.MP_CLIENT_SECRET;
export const MP_OAUTH_REDIRECT_URI = process.env.MP_OAUTH_REDIRECT_URI;
export const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;

// Credenciales de la app de QR ("Localia QR").
export const MP_QR_CLIENT_ID = process.env.MP_QR_CLIENT_ID;
export const MP_QR_CLIENT_SECRET = process.env.MP_QR_CLIENT_SECRET;
export const MP_QR_OAUTH_REDIRECT_URI = process.env.MP_QR_OAUTH_REDIRECT_URI;
export const MP_QR_WEBHOOK_SECRET = process.env.MP_QR_WEBHOOK_SECRET;

// Comisión que cobra la plataforma sobre cada venta (marketplace_fee en las orders).
export const MP_MARKETPLACE_FEE_PERCENT = process.env.MP_MARKETPLACE_FEE_PERCENT;

// Webhook y redirects post-pago para el pago con tarjeta (config.online de la order).
export const MP_WEBHOOK_URL = process.env.MP_WEBHOOK_URL;
export const MP_BACK_SUCCESS = process.env.MP_BACK_SUCCESS;
export const MP_BACK_FAILURE = process.env.MP_BACK_FAILURE;
export const MP_BACK_PENDING = process.env.MP_BACK_PENDING;


export const MP_CONEXION_RETORNO_URL = process.env.MP_CONEXION_RETORNO_URL;