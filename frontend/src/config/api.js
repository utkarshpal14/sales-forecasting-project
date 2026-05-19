const LOCAL_API = 'http://localhost:8000';

function isBrowserLocalhost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/**
 * API base URL for FastAPI backend.
 * - Browser on localhost → always LOCAL_API (even after `npm run build` + serve)
 * - Vercel / deployed → REACT_APP_API_BASE_URL from .env.production (Render)
 * - npm start → .env.development (also localhost override)
 */
function resolveApiBaseUrl() {
  if (isBrowserLocalhost()) {
    return LOCAL_API;
  }

  const fromEnv = process.env.REACT_APP_API_BASE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '');
  }
  return LOCAL_API;
}

export const API_BASE_URL = resolveApiBaseUrl();

if (
  process.env.NODE_ENV === 'production' &&
  !isBrowserLocalhost() &&
  API_BASE_URL.includes('localhost')
) {
  console.warn(
    '[API] REACT_APP_API_BASE_URL is not set for production. Set your Render URL in .env.production or Vercel.'
  );
}
