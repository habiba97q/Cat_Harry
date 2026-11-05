// src/utils/api.js
/**
 * Centralized API client for StudioSpace frontend.
 * Uses native fetch with credentials: 'include' to send HttpOnly JWT cookie.
 * All responses are parsed as JSON. Non‑2xx responses throw an error with the
 * parsed JSON payload attached as `error.response` for easy handling.
 */

const SERVER_URL = `${(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000').replace(/\/+$/, '')}/api`;

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      // Accept JSON by default
      Accept: 'application/json',
      ...headers,
    },
    credentials: 'include', // send HttpOnly cookie
  };

  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // Let browser set correct multipart headers
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${SERVER_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message || data?.errors?.[0]?.msg || res.statusText || 'Request failed');
    error.response = { data, status: res.status };
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, headers) => request(path, { method: 'POST', body, headers }),
  patch: (path, body, headers) => request(path, { method: 'PATCH', body, headers }),
  put: (path, body, headers) => request(path, { method: 'PUT', body, headers }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export default api;
