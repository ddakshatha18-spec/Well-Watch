// Public configuration only. Never put tokens or AWS secrets in VITE_ variables.
const clean = (v) => (v || '').trim();

export const API_BASE_URL = (
  clean(import.meta.env.VITE_API_BASE_URL) ||
  'https://e95a0mqwd6.execute-api.ap-south-1.amazonaws.com/Prod'
).replace(/\/+$/, '');

export const LOCATION = {
  apiKey: clean(import.meta.env.VITE_LOCATION_API_KEY),
  region: clean(import.meta.env.VITE_LOCATION_REGION) || 'ap-south-1',
};

export const REQUEST_TIMEOUT_MS = 15000;
