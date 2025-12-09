const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8087/api/auth';
const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8086/api';

async function authorizedFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('matricula_jwt');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BACKEND_API_BASE_URL}${path}`, { ...options, headers });
  return response;
}

export { AUTH_API_BASE_URL, BACKEND_API_BASE_URL, authorizedFetch };
