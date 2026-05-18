import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<void> | null = null;

export const fetchCsrfToken = async () => {
  if (typeof window === 'undefined') return;
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = (async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/csrf-token`, { withCredentials: true });
      csrfToken = res.data.data.csrfToken;
    } catch (e) {
      console.error('Failed to fetch CSRF token', e);
      csrfTokenPromise = null; // Allow retry on failure
    }
  })();

  return csrfTokenPromise;
}

if (typeof window !== 'undefined') {
  fetchCsrfToken();
}

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const siteId = document.cookie
      .split('; ')
      .find(r => r.startsWith('siteId='))
      ?.split('=')[1]
    const isAuthRoute = config.url?.startsWith('/auth/') || config.url?.includes('/auth/')
    if (siteId && !isAuthRoute) {
      config.headers['X-Site-ID'] = siteId
      if (!config.params) config.params = {}
      if (!config.params.site) {
        config.params.site = siteId
      }
    }
    
    // CSRF Injection
    const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
    if (methodsRequiringCsrf.includes(config.method?.toLowerCase() || '')) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
  }
  return config
})

// Mutex untuk mencegah multiple refresh calls bersamaan
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: unknown) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Daftar endpoint auth yang TIDAK boleh trigger auto-refresh
// karena kegagalannya sudah di-handle langsung oleh pemanggil
const AUTH_SKIP_REFRESH_URLS = ['/auth/me', '/auth/refresh', '/auth/login', '/auth/register']

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Jangan auto-refresh untuk auth endpoints — biarkan callernya yang handle
    const isAuthEndpoint = AUTH_SKIP_REFRESH_URLS.some(url => original.url?.includes(url))
    
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Sudah ada refresh yang sedang berjalan, antri request ini
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
      }

      original._retry = true
      isRefreshing = true

      try {
        await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        processQueue(null)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)
        // Jangan redirect di sini — biarkan komponen/store yang menangani
        // Ini mencegah redirect loop pada halaman publik
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)