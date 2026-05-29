import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<void> | null = null;
let csrfTokenExpiry: number | null = null;

// CSRF token valid untuk 1 jam (sesuaikan dengan server settings)
const CSRF_TOKEN_TTL = 60 * 60 * 1000; // 1 hour in ms

export const fetchCsrfToken = async () => {
  if (typeof window === 'undefined') return;
  
  // Jika token masih valid, tidak perlu fetch ulang
  if (csrfToken && csrfTokenExpiry && Date.now() < csrfTokenExpiry) {
    return Promise.resolve();
  }
  
  // Jika sedang dalam proses fetch, wait untuk proses tersebut selesai
  if (csrfTokenPromise) return csrfTokenPromise;

  csrfTokenPromise = (async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/csrf-token`, { withCredentials: true });
      csrfToken = res.data.data.csrfToken;
      csrfTokenExpiry = Date.now() + CSRF_TOKEN_TTL;
      if (!csrfToken) {
        throw new Error('Empty CSRF token received')
      }
    } catch (e) {
      console.error('Failed to fetch CSRF token', e);
      csrfToken = null;
      csrfTokenExpiry = null;
      csrfTokenPromise = null; // Allow retry on failure
      throw e;
    }
  })();

  return csrfTokenPromise;
}

// Invalidasi cache dan paksa ambil ulang token CSRF dari server
export const refreshCsrfToken = async () => {
  csrfToken = null;
  csrfTokenPromise = null;
  await fetchCsrfToken();
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
    
    // CSRF Injection — selalu fetch token terbaru untuk method yang membutuhkan
    const methodsRequiringCsrf = ['post', 'put', 'delete', 'patch'];
    if (methodsRequiringCsrf.includes(config.method?.toLowerCase() || '')) {
      // Selalu refresh CSRF token sebelum request mutasi untuk memastikan fresh
      await fetchCsrfToken();
      if (!csrfToken) {
        throw new Error('Unable to obtain CSRF token before request')
      }
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config
})

// Mutex untuk mencegah multiple refresh calls bersamaan
let isRefreshing = false
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = []

// Retry limit untuk token refresh (mencegah infinite loops)
let refreshRetryCount = 0
const MAX_REFRESH_RETRIES = 3

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
const AUTH_SKIP_REFRESH_URLS = [
  '/auth/me',
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/users/heartbeat'
]

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Enhanced logging untuk debugging (Priority 2.1)
    if (error.response?.status === 401) {
      console.warn('[AUTH] 401 Unauthorized:', {
        url: original.url,
        method: original.method,
        errorCode: error.response?.data?.error?.code,
        hasToken: !!document.cookie.includes('accessToken')
      })
    }

    // Log 403 responses for diagnostic
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.error?.code
      const errorMessage = error.response?.data?.error?.message
      console.warn(`[AUTH] 403 Forbidden:`, {
        url: original.url,
        method: original.method,
        errorCode: errorCode,
        errorMessage: errorMessage,
        hasCsrfToken: !!original.headers['X-CSRF-Token']
      })
    }

    // [CSRF] Jika 403 dengan kode EBADCSRFTOKEN, ambil token CSRF baru secara silent lalu coba ulang
    const isCsrfError =
      error.response?.status === 403 &&
      (error.response?.data?.error?.code === 'EBADCSRFTOKEN' ||
        error.response?.data?.error?.message?.toLowerCase().includes('csrf'))

    if (isCsrfError && !original._csrfRetry) {
      original._csrfRetry = true
      await refreshCsrfToken()
      if (csrfToken) {
        original.headers['X-CSRF-Token'] = csrfToken
      }
      return api(original)
    }

    // Jangan auto-refresh untuk auth endpoints — biarkan callernya yang handle
    const isAuthEndpoint = AUTH_SKIP_REFRESH_URLS.some(url => original.url?.includes(url))
    
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      // Check retry limit untuk mencegah infinite loops
      if (refreshRetryCount >= MAX_REFRESH_RETRIES) {
        console.error('[AUTH] Max refresh retries exceeded, clearing state')
        refreshRetryCount = 0
        // Trigger logout via clearing auth state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired'))
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Sudah ada refresh yang sedang berjalan, antri request ini
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
      }

      original._retry = true
      isRefreshing = true
      refreshRetryCount++

      try {
        await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true })
        refreshRetryCount = 0 // Reset on success
        processQueue(null)
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError)
        console.warn(`[AUTH] Token refresh failed (attempt ${refreshRetryCount}/${MAX_REFRESH_RETRIES})`)
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