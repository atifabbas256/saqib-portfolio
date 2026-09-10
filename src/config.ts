/**
 * Shopify store configuration.
 *
 * In a real Expo project, wire these up via `expo-constants` + `app.config.js`
 * reading from a `.env` file (e.g. with `react-native-dotenv` or `expo-env`).
 * Hardcoded here for clarity — replace with your own store's values.
 */
export const SHOPIFY_STORE_DOMAIN = '0ddkap-1y.myshopify.com';
export const SHOPIFY_STOREFRONT_TOKEN = '408358ff1d149089d10ef531a289da99';
export const SHOPIFY_API_VERSION = '2025-01';

export const SHOPIFY_GRAPHQL_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

// Theming — dark, bold, streetwear-inspired (Limelight-style)
export const COLORS = {
  background: '#0A0A0A',
  surface: '#161616',
  surfaceAlt: '#1F1F1F',
  border: '#2A2A2A',
  textPrimary: '#FFFFFF',
  textSecondary: '#9A9A9A',
  accent: '#FF3D3D',
  success: '#3DDC84',
  white: '#FFFFFF',
};
